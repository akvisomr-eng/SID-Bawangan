-- Reduce duplicate SELECT policy checks and index the module editor foreign key.
create index if not exists portal_modules_updated_by_idx on public.portal_modules(updated_by);
drop policy if exists "Published posts are publicly readable" on public.posts;
drop policy if exists "Staff can read posts" on public.posts;
create policy "Published posts are publicly readable" on public.posts for select to anon using (status = 'published');
create policy "Authenticated users can read published posts or staff drafts" on public.posts for select to authenticated
using (status = 'published' or (select public.current_user_role()) in ('admin','editor','publisher'));
drop policy if exists "Published portal modules are publicly readable" on public.portal_modules;
drop policy if exists "Staff can read portal modules" on public.portal_modules;
create policy "Published portal modules are publicly readable" on public.portal_modules for select to anon using (status = 'published');
create policy "Authenticated users can read published modules or staff drafts" on public.portal_modules for select to authenticated
using (status = 'published' or (select public.current_user_role()) in ('admin','editor','publisher'));
