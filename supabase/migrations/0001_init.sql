-- 0001_init: extensions and the single-owner check used by every RLS policy.

-- Extensions needed in later phases.
create extension if not exists pgcrypto with schema extensions;  -- gen_random_uuid, digests
create extension if not exists pg_trgm with schema extensions;   -- global search
create extension if not exists pg_cron;                          -- nightly jobs
create extension if not exists pg_net with schema extensions;    -- cron -> Edge Functions

-- Shared updated_at trigger for every table from phase 1 on.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- app_owner holds exactly one row: AJ's auth user id.
-- The first account ever created becomes the owner. Any later signup (if signups stay on)
-- is a logged-in user that RLS still treats as a stranger.
create table public.app_owner (
  id boolean primary key default true check (id),
  user_id uuid not null unique references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger app_owner_updated_at
before update on public.app_owner
for each row execute function public.set_updated_at();

alter table public.app_owner enable row level security;

-- True only for AJ's session. Every policy in later migrations uses:
--   using (public.is_owner()) with check (public.is_owner())
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_owner where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

create policy "owner reads app_owner" on public.app_owner
  for select to authenticated
  using (user_id = (select auth.uid()));
-- No insert/update/delete policies: only the trigger below (or the SQL editor) can change it.

-- Claim ownership for the first user that signs up.
create or replace function public.claim_first_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.app_owner (user_id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.claim_first_owner() from public, anon, authenticated;

create trigger on_auth_user_created_claim_owner
after insert on auth.users
for each row execute function public.claim_first_owner();

-- If AJ already signed up before this migration ran, make the oldest account the owner.
insert into public.app_owner (user_id)
select id from auth.users order by created_at asc limit 1
on conflict (id) do nothing;
