-- Migration 0002: pre-local-test blockers and fresh-schema fixes
--
-- Apply this ONLY if you already ran supabase/schema.sql and migration 0001.
-- If you have not deployed the database yet, just run the updated
-- supabase/schema.sql — it already contains everything below.
--
-- This migration is safe to run once. Policies and the currency constraint
-- use drop-then-create; the NOT NULL changes are idempotent.

-- ---------------------------------------------------------------------------
-- H2: shirt rows must not be exposed publicly.
-- Shirts carry sensitive fields (purchase_price, purchase_source,
-- estimated_value, purchase_date, notes), so they are owner-only for now.
-- A future public showcase should read from a dedicated security-barrier
-- VIEW exposing only non-sensitive columns — never these tables directly.
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view shirts in accessible collections" on public.shirts;
drop policy if exists "Users can view own shirts" on public.shirts;
create policy "Users can view own shirts" on public.shirts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view images of accessible shirts" on public.shirt_images;
drop policy if exists "Users can view own shirt images" on public.shirt_images;
create policy "Users can view own shirt images" on public.shirt_images for select
  using (
    exists (select 1 from public.shirts where id = shirt_id and user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- M2: make defaulted columns NOT NULL so generated types are accurate.
-- (Fails only if existing rows hold NULLs in these columns; rows created by
-- the app always have values because the column defaults applied on insert.)
-- ---------------------------------------------------------------------------
alter table public.profiles
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.collections
  alter column is_public set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.shirts
  alter column signed set not null,
  alter column currency set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.shirt_images
  alter column is_primary set not null,
  alter column display_order set not null,
  alter column created_at set not null;

alter table public.wishlist_items
  alter column created_at set not null,
  alter column updated_at set not null;

-- ---------------------------------------------------------------------------
-- M7: currency check constraint + default DKK.
-- (USD/EUR — the previous defaults — are in the allowed set, so any existing
-- rows pass the new constraint.)
-- ---------------------------------------------------------------------------
alter table public.shirts alter column currency set default 'DKK';
alter table public.shirts drop constraint if exists shirts_currency_check;
alter table public.shirts add constraint shirts_currency_check
  check (currency in ('DKK', 'EUR', 'USD', 'GBP', 'SEK', 'NOK', 'AUD', 'CAD'));

-- ---------------------------------------------------------------------------
-- L1: explicit WITH CHECK on the profiles/collections update policies.
-- ---------------------------------------------------------------------------
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can update own collections" on public.collections;
create policy "Users can update own collections" on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
