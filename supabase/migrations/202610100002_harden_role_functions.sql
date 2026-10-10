-- Defense-in-depth for SID Bawangan role helper functions.
create or replace function public.current_user_role()
returns text language sql stable set search_path = ''
as $$ select p.role from public.profiles p where p.id = (select auth.uid()) limit 1; $$;
revoke all on function public.current_user_role() from public, anon, authenticated;
grant execute on function public.current_user_role() to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create index if not exists posts_author_id_idx on public.posts(author_id);
