create type user_role as enum ('student', 'faculty', 'staff', 'admin');

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  entra_oid    uuid,
  email        text not null,
  upn          text,
  student_id   text unique,
  display_name text not null,
  role         user_role not null default 'student',
  created_at   timestamptz not null default now(),

  constraint student_id_format check (student_id ~ '^[0-9]{9}$')
);

create index profiles_role_idx on profiles(role);
create index profiles_student_id_idx on profiles(student_id);

create or replace function current_role_of()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select current_role_of() in ('staff', 'admin');
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select current_role_of() = 'admin';
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upn        text;
  v_student_id text;
begin
  v_upn := coalesce(
    new.raw_user_meta_data ->> 'preferred_username',
    new.email
  );

  v_student_id := substring(lower(split_part(v_upn, '@', 1)) from '^a([0-9]{9})$');

  insert into public.profiles (
    id, entra_oid, email, upn, student_id, display_name, role
  )
  values (
    new.id,
    (new.raw_user_meta_data -> 'custom_claims' ->> 'oid')::uuid,
    coalesce(new.email, new.raw_user_meta_data ->> 'email'),
    v_upn,
    v_student_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case when v_student_id is not null then 'student' else 'faculty' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only an administrator can change roles';
  end if;

  new.student_id := old.student_id;
  new.upn        := old.upn;
  new.entra_oid  := old.entra_oid;

  return new;
end;
$$;

create trigger profiles_guard_role
  before update on profiles
  for each row execute function prevent_role_escalation();

alter table profiles enable row level security;

create policy "users can view own profile"
  on profiles for select
  using (id = auth.uid() or is_staff());

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