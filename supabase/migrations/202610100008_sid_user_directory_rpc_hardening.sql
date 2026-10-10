-- Avoid recursive profile RLS evaluation: return directory data only through an admin-checked RPC.
drop policy if exists "Admins can read all profiles" on public.profiles;

create or replace function public.admin_list_users()
returns table (id uuid, full_name text, email text, role text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ) then
    raise exception 'Only administrators can list users' using errcode = '42501';
  end if;
  return query
    select p.id, p.full_name, p.email, p.role, p.created_at
    from public.profiles p
    order by p.full_name, p.email;
end;
$$;
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
