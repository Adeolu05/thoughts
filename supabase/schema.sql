-- Thoughts Supabase schema with Auth + Row Level Security
-- Run this in Supabase SQL Editor.

create table if not exists public.thoughts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  created_at timestamptz not null,
  content text not null default '',
  title text,
  source text not null check (source in ('typed', 'pasted', 'spoken')),
  theme text not null check (theme in ('lyric', 'editorial', 'classic')),
  gradient text not null check (
    gradient in (
      'midnight-muse',
      'sunset-glow',
      'aurora-mesh',
      'forest',
      'ocean',
      'noir',
      'paper',
      'coffee'
    )
  ),
  mood text check (
    mood is null or mood in (
      'hopeful',
      'reflective',
      'grateful',
      'anxious',
      'excited',
      'peaceful',
      'melancholy',
      'determined',
      'joyful',
      'neutral'
    )
  ),
  spotify_url text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  photo_data_url text,
  image_data_url text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists thoughts_user_created_at_idx
  on public.thoughts (user_id, created_at desc);

create index if not exists thoughts_published_created_at_idx
  on public.thoughts (is_published, created_at desc);

create index if not exists thoughts_tags_gin_idx
  on public.thoughts using gin (tags);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists thoughts_touch_updated_at on public.thoughts;

create trigger thoughts_touch_updated_at
before update on public.thoughts
for each row
execute function public.touch_updated_at();

alter table public.thoughts enable row level security;

drop policy if exists "Published thoughts are public" on public.thoughts;
drop policy if exists "Users can read their thoughts" on public.thoughts;
drop policy if exists "Users can insert their thoughts" on public.thoughts;
drop policy if exists "Users can update their thoughts" on public.thoughts;
drop policy if exists "Users can delete their thoughts" on public.thoughts;

create policy "Published thoughts are public"
on public.thoughts
for select
to anon, authenticated
using (is_published = true);

create policy "Users can read their thoughts"
on public.thoughts
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their thoughts"
on public.thoughts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their thoughts"
on public.thoughts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their thoughts"
on public.thoughts
for delete
to authenticated
using (auth.uid() = user_id);
