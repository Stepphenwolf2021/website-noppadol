"""
security.py — authentication & secret management for pam-webapp.

Design (highest practical security for a self-hosted node, honest about limits):
  * Passwords: scrypt (stdlib, memory-hard), per-user random salt,
    constant-time compare. Min length enforced at the API layer.
  * Sessions: random 256-bit tokens, server-side store, idle expiry,
    HttpOnly + SameSite=Strict cookies (Secure flag added on HTTPS).
  * Login throttling: exponential lockout per username+IP, no user enumeration.
  * 2FA: TOTP (RFC 6238) implemented with stdlib hmac — no extra deps.
  * Secrets at rest: AI provider API keys encrypted with Fernet; the Fernet
    key derives from a 0600 server secret file, never stored in the graph.
  * For SaaS production: replace with a managed IdP (OIDC) + per-tenant vault.
"""
import base64
import hashlib
import hmac
import os
import pathlib
import secrets
import struct
import time

from cryptography.fernet import Fernet, InvalidToken

# --------------------------------------------------------------------------
# Server secret + Fernet encryption for stored API keys
# --------------------------------------------------------------------------
SECRET_FILE = pathlib.Path.home() / ".pam-webapp.secret"


def _server_secret() -> bytes:
    if not SECRET_FILE.exists():
        SECRET_FILE.write_bytes(secrets.token_bytes(32))
        SECRET_FILE.chmod(0o600)
    return SECRET_FILE.read_bytes()


def _fernet() -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(_server_secret()).digest())
    return Fernet(key)


def encrypt_secret(plain: str) -> str:
    return _fernet().encrypt(plain.encode()).decode()


def decrypt_secret(token: str) -> str | None:
    try:
        return _fernet().decrypt(token.encode()).decode()
    except (InvalidToken, ValueError):
        return None


# --------------------------------------------------------------------------
# Password hashing (scrypt, stdlib)
# --------------------------------------------------------------------------
def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    dk = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1,
                        maxmem=64 * 1024 * 1024)
    return salt.hex() + "$" + dk.hex()


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split("$", 1)
        dk = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex),
                            n=2**14, r=8, p=1, maxmem=64 * 1024 * 1024)
        return hmac.compare_digest(dk.hex(), dk_hex)
    except (ValueError, TypeError):
        return False


# --------------------------------------------------------------------------
# TOTP (RFC 6238) — stdlib only
# --------------------------------------------------------------------------
def new_totp_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode().rstrip("=")


def _totp_at(secret_b32: str, counter: int) -> str:
    pad = "=" * (-len(secret_b32) % 8)
    key = base64.b32decode(secret_b32 + pad, casefold=True)
    mac = hmac.new(key, struct.pack(">Q", counter), hashlib.sha1).digest()
    off = mac[-1] & 0x0F
    code = (struct.unpack(">I", mac[off:off + 4])[0] & 0x7FFFFFFF) % 1_000_000
    return f"{code:06d}"


def verify_totp(secret_b32: str, code: str, window: int = 1) -> bool:
    if not (code and code.isdigit() and len(code) == 6):
        return False
    now = int(time.time()) // 30
    return any(hmac.compare_digest(_totp_at(secret_b32, now + w), code)
               for w in range(-window, window + 1))


def otpauth_uri(secret_b32: str, username: str,
                issuer: str = "AssetGraph") -> str:
    return (f"otpauth://totp/{issuer}:{username}?secret={secret_b32}"
            f"&issuer={issuer}&algorithm=SHA1&digits=6&period=30")


# --------------------------------------------------------------------------
# Sessions (server-side, idle expiry)
# --------------------------------------------------------------------------
SESSION_TTL = 12 * 3600
_SESSIONS: dict = {}


def create_session(username: str) -> str:
    token = secrets.token_urlsafe(32)
    _SESSIONS[token] = {"user": username, "exp": time.time() + SESSION_TTL}
    return token


def get_session(token: str | None) -> dict | None:
    if not token:
        return None
    s = _SESSIONS.get(token)
    if not s:
        return None
    if s["exp"] < time.time():
        _SESSIONS.pop(token, None)
        return None
    s["exp"] = time.time() + SESSION_TTL          # sliding expiry
    return s


def drop_session(token: str | None):
    if token:
        _SESSIONS.pop(token, None)


def drop_all_sessions(username: str):
    for t in [t for t, s in _SESSIONS.items() if s["user"] == username]:
        _SESSIONS.pop(t, None)


# --------------------------------------------------------------------------
# Login throttling (per username+IP, exponential lockout)
# --------------------------------------------------------------------------
_FAILS: dict = {}
MAX_FREE_FAILS = 5


def is_locked(key: str) -> int:
    """Return seconds remaining if locked, else 0."""
    rec = _FAILS.get(key)
    if not rec:
        return 0
    remaining = rec.get("until", 0) - time.time()
    return max(0, int(remaining))


def register_fail(key: str):
    rec = _FAILS.setdefault(key, {"count": 0, "until": 0})
    rec["count"] += 1
    if rec["count"] >= MAX_FREE_FAILS:
        # 30s, 60s, 120s, ... capped at 1h
        wait = min(30 * 2 ** (rec["count"] - MAX_FREE_FAILS), 3600)
        rec["until"] = time.time() + wait


def clear_fails(key: str):
    _FAILS.pop(key, None)
