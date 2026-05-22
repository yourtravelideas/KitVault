-- KitVault — full database schema
-- Run this against a fresh Supabase project's SQL editor.
-- If you have already deployed an earlier version, run the migration in
-- supabase/migrations/ instead of re-running this file.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Collections table
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false,
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shirts table
create table public.shirts (
  id uuid default uuid_generate_v4() primary key,
  collection_id uuid references public.collections on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  club text not null,
  country text,
  season text,
  shirt_type text not null default 'Home'
    check (shirt_type in ('Home', 'Away', 'Third', 'Goalkeeper', 'Training', 'Special')),
  manufacturer text,
  sponsor text,
  size text,
  player_name text,
  shirt_number text,
  condition text,
  authenticity_type text not null default 'Replica'
    check (authenticity_type in ('Replica', 'Player Issue', 'Match Worn', 'Unknown')),
  signed boolean default false,
  patches text,
  purchase_source text,
  purchase_date date,
  purchase_price numeric(10,2) check (purchase_price is null or purchase_price >= 0),
  estimated_value numeric(10,2) check (estimated_value is null or estimated_value >= 0),
  currency text default 'USD',
  notes text,
  status text not null default 'owned'
    check (status in ('owned', 'open_to_trade', 'not_for_sale')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shirt images table
create table public.shirt_images (
  id uuid default uuid_generate_v4() primary key,
  shirt_id uuid references public.shirts on delete cascade not null,
  url text not null,
  storage_path text,
  is_primary boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Wishlist table
create table public.wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  club text not null,
  season text,
  shirt_type text
    check (shirt_type is null or shirt_type in ('Home', 'Away', 'Third', 'Goalkeeper', 'Training', 'Special')),
  size text,
  player_name text,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Grail')),
  notes text,
  status text not null default 'Searching'
    check (status in ('Searching', 'Found', 'Paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_collections_user_id on public.collections(user_id);
create index idx_collections_public on public.collections(is_public) where is_public = true;
create index idx_shirts_user_id on public.shirts(user_id);
create index idx_shirts_collection_id on public.shirts(collection_id);
create index idx_shirt_images_shirt_id on public.shirt_images(shirt_id);
create index idx_wishlist_items_user_id on public.wishlist_items(user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.shirts enable row level security;
alter table public.shirt_images enable row level security;
alter table public.wishlist_items enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Collections policies
create policy "Users can view own collections" on public.collections for select using (auth.uid() = user_id or is_public = true);
create policy "Users can insert own collections" on public.collections for insert with check (auth.uid() = user_id);
create policy "Users can update own collections" on public.collections for update using (auth.uid() = user_id);
create policy "Users can delete own collections" on public.collections for delete using (auth.uid() = user_id);

-- Shirts policies
create policy "Users can view shirts in accessible collections" on public.shirts for select using (
  auth.uid() = user_id or
  exists (select 1 from public.collections where id = collection_id and is_public = true)
);
-- Insert/update are only allowed when the target collection is owned by the user.
create policy "Users can insert shirts in own collections" on public.shirts for insert with check (
  auth.uid() = user_id and
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);
create policy "Users can update shirts in own collections" on public.shirts for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
  );
create policy "Users can delete own shirts" on public.shirts for delete using (auth.uid() = user_id);

-- Shirt images policies
create policy "Users can view images of accessible shirts" on public.shirt_images for select using (
  exists (select 1 from public.shirts where id = shirt_id and (
    user_id = auth.uid() or
    exists (select 1 from public.collections where id = collection_id and is_public = true)
  ))
);
create policy "Users can manage own shirt images" on public.shirt_images for all
  using (
    exists (select 1 from public.shirts where id = shirt_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.shirts where id = shirt_id and user_id = auth.uid())
  );

-- Wishlist policies
create policy "Users can manage own wishlist" on public.wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Functions & triggers
-- ---------------------------------------------------------------------------

-- Create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at columns in sync on every update.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create or replace trigger collections_set_updated_at
  before update on public.collections
  for each row execute procedure public.handle_updated_at();

create or replace trigger shirts_set_updated_at
  before update on public.shirts
  for each row execute procedure public.handle_updated_at();

create or replace trigger wishlist_items_set_updated_at
  before update on public.wishlist_items
  for each row execute procedure public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- Storage bucket for shirt images
insert into storage.buckets (id, name, public) values ('shirt-images', 'shirt-images', true);

-- Images are stored under <user_id>/<shirt_id>/<file>, so the first path
-- segment must match the uploading user.
create policy "Anyone can view shirt images" on storage.objects for select using (bucket_id = 'shirt-images');
create policy "Users can upload shirt images to own folder" on storage.objects for insert with check (
  bucket_id = 'shirt-images' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users can update own shirt images" on storage.objects for update using (
  bucket_id = 'shirt-images' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users can delete own shirt images" on storage.objects for delete using (
  bucket_id = 'shirt-images' and auth.uid()::text = (storage.foldername(name))[1]
);
