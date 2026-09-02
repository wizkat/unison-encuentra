create or replace function current_role_of()
returns user_role
language sql security definer stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

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

revoke execute on function current_role_of() from public, anon;
revoke execute on function is_operator()     from public, anon;
revoke execute on function is_admin()        from public, anon;

grant execute on function current_role_of() to authenticated;
grant execute on function is_operator()     to authenticated;
grant execute on function is_admin()        to authenticated;