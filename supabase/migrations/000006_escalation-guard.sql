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
  new.affiliation  := old.affiliation;
  new.student_id   := old.student_id;
  new.upn          := old.upn;
  new.entra_oid    := old.entra_oid;
  new.first_name   := old.first_name;
  new.last_name    := old.last_name;
  new.display_name := old.display_name;
  new.email        := old.email;

  return new;
end;
$$;

create trigger profiles_guard_role
  before update on profiles
  for each row execute function prevent_privilege_escalation();
