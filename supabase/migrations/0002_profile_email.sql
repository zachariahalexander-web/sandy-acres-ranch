-- Admin guest list needs to show each guest's email without granting
-- direct access to the auth schema, so mirror it onto profiles.

alter table public.profiles add column email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;
