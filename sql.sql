-- ============================================================
-- Profiles
--
-- Two independent dimensions:
--   affiliation: who the person is    (derived from UPN)
--   role:        what they may do     (granted manually)
--
-- A student worker at the lost-and-found desk is
-- affiliation='student' AND role='operator'. Both are true.
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_guard_role on profiles;
drop table if exists profiles cascade;
drop type if exists user_role cascade;
drop type if exists affiliation cascade;

create type affiliation as enum ('student', 'employee');
create type user_role   as enum ('member', 'operator', 'admin');

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  entra_oid    uuid,
  email        text not null,
  upn          text,
  student_id   text unique,
  display_name text not null,
  affiliation  affiliation not null default 'employee',
  role         user_role   not null default 'member',
  created_at   timestamptz not null default now(),

  constraint student_id_format check (student_id ~ '^[0-9]{9}$'),

  -- Only students carry a student ID, and every student has one.
  constraint student_id_matches_affiliation check (
    (affiliation = 'student' and student_id is not null) or
    (affiliation = 'employee' and student_id is null)
  )
);

create index profiles_role_idx on profiles(role) where role <> 'member';
create index profiles_student_id_idx on profiles(student_id);

-- ============================================================
-- Authorization helpers
-- ============================================================

create or replace function current_role_of()
returns user_role
language sql security definer stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- Operator or above: uploads found items, resolves claims.
create or replace function is_operator()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select current_role_of() in ('operator', 'admin');
$$;

create or replace function is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select current_role_of() = 'admin';
$$;

-- ============================================================
-- Provisioning on first sign-in
--
-- Affiliation is derived. Role is always 'member': elevated
-- roles are granted by an admin, never by the trigger.
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_upn        text;
  v_student_id text;
begin
  v_upn := coalesce(new.raw_user_meta_data ->> 'preferred_username', new.email);

  -- Student ID: 'a' + 9 digits, whole string.
  v_student_id := substring(lower(split_part(v_upn, '@', 1)) from '^a([0-9]{9})$');

  insert into public.profiles (
    id, entra_oid, email, upn, student_id, display_name, affiliation
  )
  values (
    new.id,
    (new.raw_user_meta_data -> 'custom_claims' ->> 'oid')::uuid,
    coalesce(new.email, new.raw_user_meta_data ->> 'email'),
    v_upn,
    v_student_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case when v_student_id is not null then 'student' else 'employee' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Escalation guard
--
-- RLS cannot restrict individual columns, so without this a
-- member could set their own role to 'admin' and the update
-- policy would allow it.
-- ============================================================

create or replace function prevent_privilege_escalation()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only an administrator can change roles';
  end if;

  -- Identity facts come from Entra and are never edited by hand.
  new.affiliation := old.affiliation;
  new.student_id  := old.student_id;
  new.upn         := old.upn;
  new.entra_oid   := old.entra_oid;

  return new;
end;
$$;

create trigger profiles_guard_role
  before update on profiles
  for each row execute function prevent_privilege_escalation();

-- ============================================================
-- Row level security
-- ============================================================

alter table profiles enable row level security;

create policy "users can view own profile"
  on profiles for select
  using (id = auth.uid() or is_operator());

create policy "users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "admins can update any profile"
  on profiles for update
  using (is_admin())
  with check (is_admin());

create policy "admins can delete profiles"
  on profiles for delete
  using (is_admin());

create or replace function sync_user_from_entra()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email        = coalesce(new.email, new.raw_user_meta_data ->> 'email', email),
    display_name = coalesce(new.raw_user_meta_data ->> 'full_name', display_name),
    entra_oid    = coalesce(
                     (new.raw_user_meta_data -> 'custom_claims' ->> 'oid')::uuid,
                     entra_oid
                   )
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_updated
  after update on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function sync_user_from_entra();