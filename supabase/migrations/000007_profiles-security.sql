alter table profiles enable row level security;

create policy "users can view own profile"
  on profiles for select
  using (id = auth.uid() or is_operator());

create policy "admins can update any profile"
  on profiles for update
  using (is_admin())
  with check (is_admin());

create policy "admins can delete profiles"
  on profiles for delete
  using (is_admin());