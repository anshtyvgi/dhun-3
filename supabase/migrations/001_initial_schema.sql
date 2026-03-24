-- Dhun Database Schema
-- Run this in Supabase SQL Editor

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  phone text,
  language text default 'en',
  preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Generation batches (groups 3 songs per request)
create table public.generation_batches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prompt_original text not null,
  prompt_enhanced text,
  recipient_type text not null,
  emotion text not null,
  status text default 'pending' check (status in ('pending', 'generating', 'completed', 'failed')),
  created_at timestamptz default now()
);

alter table public.generation_batches enable row level security;
create policy "Users can manage own batches" on public.generation_batches for all using (auth.uid() = user_id);

-- Songs
create table public.songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  batch_id uuid references public.generation_batches(id) on delete cascade,
  prompt_original text not null,
  prompt_enhanced text,
  recipient_type text not null,
  emotion text not null,
  status text default 'pending' check (status in ('pending', 'generating', 'completed', 'failed')),
  suno_task_id text,
  audio_url text,
  lyrics text,
  title text,
  duration_seconds integer,
  style_tags text[],
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.songs enable row level security;
create policy "Users can manage own songs" on public.songs for all using (auth.uid() = user_id);

-- Cards (the core shareable unit)
create table public.cards (
  id uuid default gen_random_uuid() primary key,
  song_id uuid references public.songs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_name text not null,
  to_name text not null,
  message text,
  emotion text not null,
  recipient_type text not null,
  background_url text,
  visual_theme jsonb default '{}',
  is_premium boolean default false,
  is_public boolean default true,
  view_count integer default 0,
  share_count integer default 0,
  created_at timestamptz default now()
);

alter table public.cards enable row level security;
create policy "Anyone can view public cards" on public.cards for select using (is_public = true);
create policy "Users can manage own cards" on public.cards for all using (auth.uid() = user_id);

-- Transactions (mocked payments)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  card_id uuid references public.cards(id),
  type text not null check (type in ('download', 'share', 'extend')),
  amount integer not null,
  status text default 'completed',
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index idx_songs_user on public.songs(user_id);
create index idx_songs_batch on public.songs(batch_id);
create index idx_songs_status on public.songs(status);
create index idx_cards_user on public.cards(user_id);
create index idx_cards_public on public.cards(is_public) where is_public = true;
create index idx_generation_batches_user on public.generation_batches(user_id);
create index idx_generation_batches_status on public.generation_batches(status);

-- Enable realtime for songs (for generation status updates)
alter publication supabase_realtime add table public.songs;
