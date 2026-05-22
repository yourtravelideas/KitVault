-- Enable UUID extension
create extension if not exists "uuid-ossp";

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
  shirt_type text not null default 'Home',
  manufacturer text,
  sponsor text,
  size text,
  player_name text,
  shirt_number text,
  condition text,
  authenticity_type text not null default 'Replica',
  signed boolean default false,
  patches text,
  purchase_source text,
  purchase_date date,
  purchase_price numeric(10,2),
  estimated_value numeric(10,2),
  currency text default 'USD',
  notes text,
  status text not null default 'owned',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shirt images table
create table public.shirt_images (
  id uuid default uuid_generate_v4() primary key,
  shirt_id uuid references public.shirts on delete cascade not null,
  url text not null,
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
  shirt_type text,
  size text,
  player_name text,
  priority text not null default 'Medium',
  notes text,
  status text not null default 'Searching',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
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
create policy "Users can insert own shirts" on public.shirts for insert with check (auth.uid() = user_id);
create policy "Users can update own shirts" on public.shirts for update using (auth.uid() = user_id);
create policy "Users can delete own shirts" on public.shirts for delete using (auth.uid() = user_id);

-- Shirt images policies
create policy "Users can view images of accessible shirts" on public.shirt_images for select using (
  exists (select 1 from public.shirts where id = shirt_id and (
    user_id = auth.uid() or
    exists (select 1 from public.collections where id = collection_id and is_public = true)
  ))
);
create policy "Users can manage own shirt images" on public.shirt_images for all using (
  exists (select 1 from public.shirts where id = shirt_id and user_id = auth.uid())
);

-- Wishlist policies
create policy "Users can manage own wishlist" on public.wishlist_items for all using (auth.uid() = user_id);

-- Function to handle new user profile creation
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

-- Storage bucket for shirt images
insert into storage.buckets (id, name, public) values ('shirt-images', 'shirt-images', true);

create policy "Anyone can view shirt images" on storage.objects for select using (bucket_id = 'shirt-images');
create policy "Authenticated users can upload shirt images" on storage.objects for insert with check (bucket_id = 'shirt-images' and auth.role() = 'authenticated');
create policy "Users can update own shirt images" on storage.objects for update using (bucket_id = 'shirt-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own shirt images" on storage.objects for delete using (bucket_id = 'shirt-images' and auth.uid()::text = (storage.foldername(name))[1]);
