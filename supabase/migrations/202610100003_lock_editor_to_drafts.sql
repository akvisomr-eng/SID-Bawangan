-- Prevent editor accounts from modifying already-published or archived content.
drop policy if exists "Editors can update drafts and publishers can publish" on public.posts;
create policy "Editors update drafts; publishers manage publication" on public.posts
for update to authenticated
using (
  (select public.current_user_role()) in ('admin','publisher')
  or ((select public.current_user_role()) = 'editor' and status = 'draft')
)
with check (
  (select public.current_user_role()) in ('admin','publisher')
  or ((select public.current_user_role()) = 'editor' and status = 'draft')
);
