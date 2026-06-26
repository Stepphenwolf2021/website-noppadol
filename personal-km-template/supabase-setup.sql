-- =====================================================================
-- 🛠️ SUPABASE DATABASE SETUP & SCHEMA MIGRATIONS
-- =====================================================================
-- Run this script inside the Supabase SQL Editor to set up your tables, 
-- Row Level Security (RLS) policies, and relationships.
-- =====================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Categories Table
create table categories (
  id text primary key,
  name text not null,
  user_id uuid references auth.users not null default auth.uid()
);

-- 3. Resources Table
create table resources (
  id text primary key,
  title text not null,
  author text not null,
  type text not null,
  category text references categories(id) on delete cascade,
  url text not null,
  featured_video_id text,
  languages text[] not null,
  tags text[] not null,
  description text not null,
  popularity text,
  region text,
  user_id uuid references auth.users not null default auth.uid()
);

-- 4. Bookmarks Table
create table bookmarks (
  user_id uuid references auth.users not null default auth.uid(),
  resource_id text references resources(id) on delete cascade,
  primary key (user_id, resource_id)
);

-- 5. Collections Table
create table collections (
  id text primary key,
  name text not null,
  resource_ids text[] not null default '{}',
  user_id uuid references auth.users not null default auth.uid()
);

-- =====================================================================
-- 🔒 VARIANT A: Private Single-User (Default)
-- Each user can only view, add, edit, or delete their own data.
-- =====================================================================

-- Enable RLS
alter table categories enable row level security;
alter table resources enable row level security;
alter table bookmarks enable row level security;
alter table collections enable row level security;

-- Policies for categories
create policy "Users can manage their own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies for resources
create policy "Users can manage their own resources" on resources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies for bookmarks
create policy "Users can manage their own bookmarks" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies for collections
create policy "Users can manage their own collections" on collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- =====================================================================
-- 👥 VARIANT B: Group/Team Upgrade (Shared Hub)
-- Run the following commands to transition the workspace into a shared 
-- wiki where multiple members of the same organization can view/edit data.
-- =====================================================================

/*
-- 1. Create a Profiles table to track user metadata and team associations
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  team_id text -- Users with matching team_id share the same database
);

-- 2. Enable profile updates on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, team_id)
  values (new.id, new.email, null); -- Admin assigns team_id later
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Modify RLS policies to allow shared access across matching team_ids
-- Drop the single-user policies first:
drop policy if exists "Users can manage their own categories" on categories;
drop policy if exists "Users can manage their own resources" on resources;
drop policy if exists "Users can manage their own bookmarks" on bookmarks;
drop policy if exists "Users can manage their own collections" on collections;

-- Create group policies referencing profiles:
create policy "Team members can read/write categories" on categories
  for all using (
    (select team_id from public.profiles where id = auth.uid()) = 
    (select team_id from public.profiles where id = user_id)
  );

create policy "Team members can read/write resources" on resources
  for all using (
    (select team_id from public.profiles where id = auth.uid()) = 
    (select team_id from public.profiles where id = user_id)
  );

create policy "Team members can read/write bookmarks" on bookmarks
  for all using (
    (select team_id from public.profiles where id = auth.uid()) = 
    (select team_id from public.profiles where id = user_id)
  );

create policy "Team members can read/write collections" on collections
  for all using (
    (select team_id from public.profiles where id = auth.uid()) = 
    (select team_id from public.profiles where id = user_id)
  );
*/
