-- MedScopeGlobal — initial schema, RLS, storage, and auth hooks
-- Run in Supabase SQL Editor or: supabase db push

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category_id uuid not null references public.categories (id) on delete restrict,
  author_id uuid references public.users (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  vip_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists articles_published_at_idx
  on public.articles (published, published_at desc nulls last);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  public_url text not null,
  mime_type text,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  active boolean not null default true,
  placement text,
  created_at timestamptz not null default now()
);

create index if not exists ads_active_idx on public.ads (active);

create table if not exists public.vip_subscriptions (
  user_id uuid primary key references public.users (id) on delete cascade,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  priority boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  data jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auth: mirror auth.users → public.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'reader'), '@', 1)
    ),
    'user'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.users.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.media enable row level security;
alter table public.ads enable row level security;
alter table public.vip_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.logs enable row level security;

-- users
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));

-- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- articles
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles
  for select using (published = true or public.is_admin());

drop policy if exists articles_admin_write on public.articles;
create policy articles_admin_write on public.articles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- media
drop policy if exists media_admin_all on public.media;
create policy media_admin_all on public.media
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ads
drop policy if exists ads_public_read on public.ads;
create policy ads_public_read on public.ads
  for select using (active = true or public.is_admin());

drop policy if exists ads_admin_write on public.ads;
create policy ads_admin_write on public.ads
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- vip_subscriptions
drop policy if exists vip_select_own on public.vip_subscriptions;
create policy vip_select_own on public.vip_subscriptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- notifications
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- logs: no client policies (service role only)

-- ---------------------------------------------------------------------------
-- Storage bucket: media
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_storage_public_read on storage.objects;
create policy media_storage_public_read on storage.objects
  for select
  using (bucket_id = 'media');

drop policy if exists media_storage_admin_write on storage.objects;
create policy media_storage_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
