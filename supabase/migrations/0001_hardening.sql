-- Migration: security & data-integrity hardening
--
-- Apply this ONLY if you already ran the original supabase/schema.sql against
-- your project. If you have not deployed the database yet, just run the
-- updated supabase/schema.sql instead — it already contains everything below.
--
-- This migration is safe to run once. It is idempotent for triggers, indexes
-- and the new column, and uses drop-then-create for policies and constraints.

-- ---------------------------------------------------------------------------
-- 3. shirt_images: track the storage object path alongside the public URL
-- ---------------------------------------------------------------------------
alter table public.shirt_images
  add column if not exists storage_path text;

-- ---------------------------------------------------------------------------
-- 6. shirts RLS: restrict insert/update to collections the user owns
-- ---------------------------------------------------------------------------
drop policy if exists "Users can insert own shirts" on public.shirts;
drop policy if exists "Users can update own shirts" on public.shirts;
drop policy if exists "Users can insert shirts in own collections" on public.shirts;
drop policy if exists "Users can update shirts in own collections" on public.shirts;

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

-- Add an explicit with-check to the shirt_images "for all" policy.
drop policy if exists "Users can manage own shirt images" on public.shirt_images;
create policy "Users can manage own shirt images" on public.shirt_images for all
  using (
    exists (select 1 from public.shirts where id = shirt_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.shirts where id = shirt_id and user_id = auth.uid())
  );

-- Add an explicit with-check to the wishlist "for all" policy.
drop policy if exists "Users can manage own wishlist" on public.wishlist_items;
create policy "Users can manage own wishlist" on public.wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. storage.objects: users may only upload into their own folder
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can upload shirt images" on storage.objects;
drop policy if exists "Users can upload shirt images to own folder" on storage.objects;
create policy "Users can upload shirt images to own folder" on storage.objects for insert with check (
  bucket_id = 'shirt-images' and auth.uid()::text = (storage.foldername(name))[1]
);

-- ---------------------------------------------------------------------------
-- 7. Check constraints (drop-then-add so the migration can be re-run safely)
-- ---------------------------------------------------------------------------
alter table public.shirts drop constraint if exists shirts_shirt_type_check;
alter table public.shirts add constraint shirts_shirt_type_check
  check (shirt_type in ('Home', 'Away', 'Third', 'Goalkeeper', 'Training', 'Special'));

alter table public.shirts drop constraint if exists shirts_authenticity_type_check;
alter table public.shirts add constraint shirts_authenticity_type_check
  check (authenticity_type in ('Replica', 'Player Issue', 'Match Worn', 'Unknown'));

alter table public.shirts drop constraint if exists shirts_status_check;
alter table public.shirts add constraint shirts_status_check
  check (status in ('owned', 'open_to_trade', 'not_for_sale'));

alter table public.shirts drop constraint if exists shirts_purchase_price_check;
alter table public.shirts add constraint shirts_purchase_price_check
  check (purchase_price is null or purchase_price >= 0);

alter table public.shirts drop constraint if exists shirts_estimated_value_check;
alter table public.shirts add constraint shirts_estimated_value_check
  check (estimated_value is null or estimated_value >= 0);

alter table public.wishlist_items drop constraint if exists wishlist_items_priority_check;
alter table public.wishlist_items add constraint wishlist_items_priority_check
  check (priority in ('Low', 'Medium', 'High', 'Grail'));

alter table public.wishlist_items drop constraint if exists wishlist_items_status_check;
alter table public.wishlist_items add constraint wishlist_items_status_check
  check (status in ('Searching', 'Found', 'Paused'));

alter table public.wishlist_items drop constraint if exists wishlist_items_shirt_type_check;
alter table public.wishlist_items add constraint wishlist_items_shirt_type_check
  check (shirt_type is null or shirt_type in ('Home', 'Away', 'Third', 'Goalkeeper', 'Training', 'Special'));

-- ---------------------------------------------------------------------------
-- 8. updated_at triggers
-- ---------------------------------------------------------------------------
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
-- 9. Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_collections_user_id on public.collections(user_id);
create index if not exists idx_collections_public on public.collections(is_public) where is_public = true;
create index if not exists idx_shirts_user_id on public.shirts(user_id);
create index if not exists idx_shirts_collection_id on public.shirts(collection_id);
create index if not exists idx_shirt_images_shirt_id on public.shirt_images(shirt_id);
create index if not exists idx_wishlist_items_user_id on public.wishlist_items(user_id);
