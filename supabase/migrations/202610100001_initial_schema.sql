-- SID Bawangan initial schema. Review and apply in a dedicated Supabase project.
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
  title text not null,
  slug text not null unique,
  summary text not null default '',
  body text not null default '',
  category text not null check (category in ('news','announcement','service','village_profile')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_posts_have_date check (status <> 'published' or published_at is not null)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Public visitors can read only published content.
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts" on public.posts
  for select to anon, authenticated using (status = 'published');

-- Authenticated users can read their own profile. Role management is reserved for trusted admin workflows.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

-- No client-side write policy is added yet. Add role-checked policies only after role provisioning is designed.
revoke all on public.profiles from anon;
revoke all on public.posts from anon;
grant select on public.posts to anon, authenticated;
grant select on public.profiles to authenticated;
