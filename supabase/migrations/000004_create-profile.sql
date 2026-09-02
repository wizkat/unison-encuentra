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