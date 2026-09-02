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
    first_name   = coalesce(new.raw_user_meta_data ->> 'given_name', first_name),
    last_name    = coalesce(new.raw_user_meta_data ->> 'family_name', last_name),
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