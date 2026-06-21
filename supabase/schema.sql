create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create table if not exists public.colleges (
  id text primary key,
  name text not null,
  gender_accepted text,
  campus_size text,
  enrollments integer,
  faculty integer,
  established_year integer,
  rating numeric,
  university text,
  courses text[] not null default '{}',
  facilities text[] not null default '{}',
  city text,
  state text,
  country text,
  college_type text,
  average_fees numeric,
  created_at timestamptz not null default now()
);

create index if not exists colleges_state_idx on public.colleges (state);
create index if not exists colleges_type_idx on public.colleges (college_type);
create index if not exists colleges_rating_idx on public.colleges (rating desc nulls last);
create index if not exists colleges_name_trgm_idx on public.colleges using gin (name gin_trgm_ops);

alter table public.colleges enable row level security;

drop policy if exists "Public can read colleges" on public.colleges;
create policy "Public can read colleges"
on public.colleges
for select
to anon, authenticated
using (true);

create table if not exists public.saved_colleges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  college_id text not null references public.colleges(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, college_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  college_id text not null references public.colleges(id) on delete cascade,
  user_id uuid,
  user_name text not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  review text not null,
  created_at timestamptz not null default now()
);

alter table public.saved_colleges enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Users can read their saved colleges" on public.saved_colleges;
create policy "Users can read their saved colleges"
on public.saved_colleges
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can save colleges" on public.saved_colleges;
create policy "Users can save colleges"
on public.saved_colleges
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can create reviews" on public.reviews;
create policy "Authenticated users can create reviews"
on public.reviews
for insert
to authenticated
with check (auth.uid() = user_id or user_id is null);
