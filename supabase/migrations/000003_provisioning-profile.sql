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
  v_student_id := substring(lower(split_part(v_upn, '@', 1)) from '^a([0-9]{9})$');

  insert into public.profiles (
    id, entra_oid, email, upn, student_id,
    first_name, last_name, display_name, affiliation
  )
  values (
    u.id,
    (u.raw_user_meta_data -> 'custom_claims' ->> 'oid')::uuid,
    coalesce(u.email, u.raw_user_meta_data ->> 'email'),
    v_upn,
    v_student_id,
    u.raw_user_meta_data ->> 'given_name',
    u.raw_user_meta_data ->> 'family_name',
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email),
    case when v_student_id is not null then 'student'::affiliation
         else 'employee'::affiliation end
  )
  on conflict (id) do nothing
  returning * into v_profile;

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