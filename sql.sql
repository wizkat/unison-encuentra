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

-- Idempotent teardown so this file can be re-run during development.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;
drop function if exists get_or_create_profile() cascade;
drop function if exists provision_profile(auth.users) cascade;
drop function if exists handle_new_user() cascade;
drop function if exists sync_user_from_entra() cascade;
drop function if exists prevent_privilege_escalation() cascade;
drop function if exists current_role_of() cascade;
drop function if exists is_operator() cascade;
drop function if exists is_admin() cascade;
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
--
-- security definer + stable so RLS policies can call them
-- without recursing into the profiles policies.
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
-- Provisioning
--
-- The derivation logic lives in provision_profile(), called from
-- two places: the insert trigger (normal path) and
-- get_or_create_profile() (repair path, when the client reads
-- before the trigger's row is visible).
--
-- Single source of truth: the student ID regex appears once.
-- ============================================================

create or replace function provision_profile(u auth.users)
returns profiles
language plpgsql security definer
set search_path = public
as $$
declare
  v_upn        text;
  v_student_id text;
  v_profile    profiles;
begin
  v_upn := coalesce(u.raw_user_meta_data ->> 'preferred_username', u.email);

  -- Student ID: 'a' + 9 digits, whole string.
  -- Anchored so accounts like soporte2024@ capture nothing.
  v_student_id := substring(lower(split_part(v_upn, '@', 1)) from '^a([0-9]{9})$');

  insert into public.profiles (
    id, entra_oid, email, upn, student_id, display_name, affiliation
  )
  values (
    u.id,
    (u.raw_user_meta_data -> 'custom_claims' ->> 'oid')::uuid,
    coalesce(u.email, u.raw_user_meta_data ->> 'email'),
    v_upn,
    v_student_id,
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email),
    case when v_student_id is not null then 'student'::affiliation
         else 'employee'::affiliation end
  )
  on conflict (id) do nothing
  returning * into v_profile;

  -- on conflict do nothing leaves v_profile null when the row already
  -- existed. Fetch it so the caller always gets a profile back.
  if v_profile is null then
    select * into v_profile from profiles where id = u.id;
  end if;

  return v_profile;
end;
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  perform provision_profile(new);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Repair path
--
-- Called by the client instead of a plain select. Removes the race
-- between the trigger's insert and the client's first read, and
-- self-heals accounts whose profile is missing for any reason.
-- ============================================================

create or replace function get_or_create_profile()
returns profiles
language plpgsql security definer
set search_path = public
as $$
declare
  v_profile profiles;
  v_user    auth.users;
begin
  select * into v_profile from profiles where id = auth.uid();
  if found then
    return v_profile;
  end if;

  select * into v_user from auth.users where id = auth.uid();
  if not found then
    raise exception 'No active session';
  end if;

  return provision_profile(v_user);
end;
$$;

-- security definer bypasses RLS, so access is granted explicitly.
revoke execute on function get_or_create_profile() from public, anon;
grant execute on function get_or_create_profile() to authenticated;

-- ============================================================
-- Entra sync
--
-- The insert trigger runs once. Without this, a name or email
-- changed in Entra would never reach profiles.
-- Role, affiliation, upn and student_id are deliberately excluded:
-- those are ours or are identity facts that must not change silently.
-- ============================================================

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

-- ============================================================
-- Escalation guard
--
-- RLS cannot restrict individual columns, so without this a member
-- could run: update profiles set role='admin' where id=auth.uid()
-- and the update policy would allow it.
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
--
-- No insert policy on purpose: only provision_profile() creates
-- rows, and it is security definer, so no client can insert a
-- profile with an elevated role.
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