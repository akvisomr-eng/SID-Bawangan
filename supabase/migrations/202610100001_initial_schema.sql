-- SID Bawangan core schema. Applied to project iacagsauvncvowpotdfy.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'editor' check (role in ('admin','editor','publisher')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text not null default '' check (char_length(summary) <= 400),
  body text not null default '',
  category text not null check (category in ('news','announcement','service','village_profile')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_posts_have_date check (status <> 'published' or published_at is not null)
);
create index if not exists posts_public_feed_idx on public.posts (published_at desc) where status = 'published';
create index if not exists posts_category_status_idx on public.posts (category, status, updated_at desc);
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = ''
as $$ select p.role from public.profiles p where p.id = (select auth.uid()) limit 1; $$;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
revoke all on public.profiles from anon, authenticated;
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant execute on function public.current_user_role() to authenticated;
drop policy if exists "Published posts are publicly readable" on public.posts;
create policy "Published posts are publicly readable" on public.posts for select to anon, authenticated using (status = 'published');
drop policy if exists "Staff can read posts" on public.posts;
create policy "Staff can read posts" on public.posts for select to authenticated using ((select public.current_user_role()) in ('admin','editor','publisher'));
drop policy if exists "Editors can create drafts" on public.posts;
create policy "Editors can create drafts" on public.posts for insert to authenticated with check ((select public.current_user_role()) in ('admin','editor','publisher') and (author_id is null or author_id = (select auth.uid())) and status = 'draft');
drop policy if exists "Editors can update drafts and publishers can publish" on public.posts;
create policy "Editors can update drafts and publishers can publish" on public.posts for update to authenticated using ((select public.current_user_role()) in ('admin','editor','publisher')) with check ((select public.current_user_role()) in ('admin','publisher') or ((select public.current_user_role()) = 'editor' and status = 'draft'));
drop policy if exists "Admins can delete posts" on public.posts;
create policy "Admins can delete posts" on public.posts for delete to authenticated using ((select public.current_user_role()) = 'admin');
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'editor') on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
comment on table public.posts is 'Konten publik SID Bawangan. Hanya status published yang terlihat untuk pengunjung.';
comment on table public.profiles is 'Profil internal pengguna terautentikasi; penetapan peran dilakukan melalui jalur admin tepercaya.';
