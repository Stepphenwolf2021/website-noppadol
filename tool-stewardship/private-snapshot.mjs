// Optimistic write guard: a stale tab must never overwrite a newer saved register.
export function saveLibrarySnapshot(storage,key,next,expectedRaw){if(storage.getItem(key)!==expectedRaw)throw Error('ข้อมูลในแท็บอื่นเปลี่ยนแล้ว กรุณาโหลดหน้านี้ใหม่ก่อนบันทึก เพื่อรักษาข้อมูลล่าสุด');const value=JSON.stringify(next);storage.setItem(key,value);return value;}
