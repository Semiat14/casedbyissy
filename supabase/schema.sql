-- =============================================================================
-- Cased By Issy — database schema
--
-- Paste into the Supabase SQL Editor and run. Safe to run more than once:
-- tables, indexes and the bucket are only created if missing, policies are
-- dropped and re-created, and seed rows are skipped if they already exist.
--
-- Columns are snake_case versions of the types in lib/types.ts
-- (e.g. coverImage → cover_image, collectionId → collection_id).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Collections, e.g. "Lace Theory". cover_image is a path inside the
-- product-images bucket (not a full URL). sort_order controls display order.
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  cover_image text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Phone models a case can be made for, e.g. brand "iPhone", name "iPhone 16".
create table if not exists public.phone_models (
  id         uuid primary key default gen_random_uuid(),
  brand      text not null,
  name       text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Products. price is whole naira (15000 = ₦15,000). images is a list of
-- paths inside the product-images bucket; the first one is the main image.
-- A collection can't be deleted while it still has products (on delete
-- restrict), so products are never removed by accident.
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete restrict,
  name          text not null,
  slug          text not null unique,
  description   text not null default '',
  price         integer not null check (price >= 0),
  images        text[] not null default '{}',
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Which phone models each product is available in, and whether each is in
-- stock. Rows disappear automatically when their product or phone model is
-- deleted (on delete cascade).
create table if not exists public.product_phone_models (
  product_id     uuid not null references public.products (id) on delete cascade,
  phone_model_id uuid not null references public.phone_models (id) on delete cascade,
  in_stock       boolean not null default true,
  primary key (product_id, phone_model_id)
);

-- -----------------------------------------------------------------------------
-- Indexes (speed up the lookups the site does most)
-- -----------------------------------------------------------------------------

create index if not exists products_collection_id_idx
  on public.products (collection_id);

create index if not exists product_phone_models_phone_model_id_idx
  on public.product_phone_models (phone_model_id);

-- -----------------------------------------------------------------------------
-- Table access for Supabase's API roles
-- (anon = website visitors, authenticated = the signed-in admin).
-- Row Level Security below then decides which rows each role can touch.
-- -----------------------------------------------------------------------------

grant select on
  public.collections, public.phone_models, public.products, public.product_phone_models
  to anon, authenticated;

grant insert, update, delete on
  public.collections, public.phone_models, public.products, public.product_phone_models
  to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Turned on for every table: with RLS on, nothing is allowed unless a policy
-- below allows it. Public sign-ups are disabled, so "authenticated" = admin.
-- -----------------------------------------------------------------------------

alter table public.collections          enable row level security;
alter table public.phone_models         enable row level security;
alter table public.products             enable row level security;
alter table public.product_phone_models enable row level security;

-- collections: anyone can read; only the admin can change.
drop policy if exists "Anyone can read collections" on public.collections;
create policy "Anyone can read collections"
  on public.collections for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can insert collections" on public.collections;
create policy "Admin can insert collections"
  on public.collections for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update collections" on public.collections;
create policy "Admin can update collections"
  on public.collections for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin can delete collections" on public.collections;
create policy "Admin can delete collections"
  on public.collections for delete
  to authenticated
  using (true);

-- phone_models: anyone can read; only the admin can change.
drop policy if exists "Anyone can read phone models" on public.phone_models;
create policy "Anyone can read phone models"
  on public.phone_models for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can insert phone models" on public.phone_models;
create policy "Admin can insert phone models"
  on public.phone_models for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update phone models" on public.phone_models;
create policy "Admin can update phone models"
  on public.phone_models for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin can delete phone models" on public.phone_models;
create policy "Admin can delete phone models"
  on public.phone_models for delete
  to authenticated
  using (true);

-- products: visitors only see active products; the admin sees all of them
-- (including hidden ones, so they can be edited and switched back on).
drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admin can read all products" on public.products;
create policy "Admin can read all products"
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
  on public.products for delete
  to authenticated
  using (true);

-- product_phone_models: anyone can read; only the admin can change.
drop policy if exists "Anyone can read product phone models" on public.product_phone_models;
create policy "Anyone can read product phone models"
  on public.product_phone_models for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can insert product phone models" on public.product_phone_models;
create policy "Admin can insert product phone models"
  on public.product_phone_models for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update product phone models" on public.product_phone_models;
create policy "Admin can update product phone models"
  on public.product_phone_models for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin can delete product phone models" on public.product_phone_models;
create policy "Admin can delete product phone models"
  on public.product_phone_models for delete
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- Storage: product-images bucket
-- Public bucket, so images load by URL without signing in. Only the admin
-- can upload, replace or delete files.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- -----------------------------------------------------------------------------
-- Seed data: the six collections (same names, slugs and descriptions as
-- lib/placeholder-data.ts). Existing slugs are left untouched.
-- Phone models and products are added later, not seeded here.
-- -----------------------------------------------------------------------------

insert into public.collections (name, slug, description, sort_order) values
  ('Persian Princess',     'persian-princess',   'Ornate patterns with a regal touch.', 1),
  ('Persian Princess 2.0', 'persian-princess-2', 'The original, reimagined.',           2),
  ('Lace Theory',          'lace-theory',        'Delicate lace, softly romantic.',     3),
  ('Hijabi Bloom',         'hijabi-bloom',       'Modest, floral and graceful.',        4),
  ('Leopelle',             'leopelle',           'Bold prints with quiet confidence.',  5),
  ('Ambelle',              'ambelle',            'Warm tones, timeless beauty.',        6)
on conflict (slug) do nothing;

commit;
