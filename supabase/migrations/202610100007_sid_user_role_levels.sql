-- SID Bawangan user levels and safe administrator-managed role assignment.
alter table public.profiles add column if not exists email text;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin','publisher','editor','viewer'));

create index if not exists profiles_role_idx on public.profiles(role);
create unique index if not exists profiles_email_idx on public.profiles(lower(email)) where email is not null and email <> '';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email, 'editor')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.sync_profile_email()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;
revoke all on function public.sync_profile_email() from public, anon, authenticated;
drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

update public.profiles p set email = u.email
from auth.users u where p.id = u.id and p.email is distinct from u.email;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select to authenticated
using ((select public.current_user_role()) = 'admin');

create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void language plpgsql security definer set search_path = ''
as $$
declare current_role text; target_role text; admin_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select p.role into current_role from public.profiles p where p.id = (select auth.uid());
  if current_role is distinct from 'admin' then
    raise exception 'Only administrators can assign roles' using errcode = '42501';
  end if;
  if new_role not in ('admin','publisher','editor','viewer') then
    raise exception 'Invalid user role' using errcode = '22023';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'Administrators cannot change their own role here' using errcode = '42501';
  end if;
  select p.role into target_role from public.profiles p where p.id = target_user_id for update;
  if not found then raise exception 'User profile not found' using errcode = 'P0002'; end if;
  if target_role = 'admin' and new_role <> 'admin' then
    select count(*) into admin_count from public.profiles p where p.role = 'admin';
    if admin_count <= 1 then raise exception 'The last administrator cannot be demoted' using errcode = '42501'; end if;
  end if;
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;
revoke all on function public.admin_set_user_role(uuid, text) from public, anon;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;

drop policy if exists "Authenticated users can read published posts or staff drafts" on public.posts;
create policy "Authenticated users can read published posts or staff drafts" on public.posts for select to authenticated
using (status = 'published' or (select public.current_user_role()) in ('admin','publisher','editor','viewer'));

drop policy if exists "Authenticated users can read published modules or staff drafts" on public.portal_modules;
create policy "Authenticated users can read published modules or staff drafts" on public.portal_modules for select to authenticated
using (status = 'published' or (select public.current_user_role()) in ('admin','publisher','editor','viewer'));

comment on column public.profiles.role is 'Role-based access: admin, publisher, editor, viewer. Role changes must use admin_set_user_role.';
