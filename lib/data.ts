// The one place the site gets its catalog data from.
//
// Pages and components only ever call these functions; they never talk to
// Supabase directly. Each function reads from Supabase with the public
// (cookie-free) client, converts database rows (snake_case, storage paths)
// into the app's types (camelCase, full image URLs), and returns them.
//
// CACHING
// Every function is cached with "use cache" and tagged "catalog":
//   - A successful read is kept for `cacheLife("hours")`: visitors get instant
//     pages, and Next.js refreshes the data in the background about once an
//     hour.
//   - A failed read is logged, returns an empty result, and is only kept for
//     `cacheLife("minutes")`, so a brief database hiccup doesn't leave the shop
//     empty for an hour.
//
// REFRESHING AFTER ADMIN EDITS
// When the admin saves a change (in a Server Action), it will call:
//
//     import { updateTag } from "next/cache";
//     updateTag(CATALOG_TAG);
//
// That throws away every cached catalog read at once, so the very next page
// view fetches fresh data and the admin sees their change immediately.
// (From a Route Handler, e.g. a webhook, use revalidateTag(CATALOG_TAG, "max")
// instead.)

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import type { Collection, PhoneModelWithStock, Product } from "./types";

export const CATALOG_TAG = "catalog";
const IMAGE_BUCKET = "product-images";

// ---------------------------------------------------------------------------
// Database row shapes (what Supabase returns) and conversion to app types
// ---------------------------------------------------------------------------

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
};

type ProductRow = {
  id: string;
  collection_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[] | null;
  is_featured: boolean;
  is_active: boolean;
};

type PhoneModelRow = {
  id: string;
  brand: string;
  name: string;
  sort_order: number;
};

type ProductPhoneModelRow = {
  in_stock: boolean;
  phone_models: PhoneModelRow | null;
};

const COLLECTION_COLUMNS = "id, name, slug, description, cover_image";
const PRODUCT_COLUMNS =
  "id, collection_id, name, slug, description, price, images, is_featured, is_active";

/** Turns a path in the product-images bucket into a public URL. */
function toImageUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path; // already a full URL
  return createPublicClient().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    coverImage: row.cover_image ? toImageUrl(row.cover_image) : null,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    collectionId: row.collection_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: row.price,
    images: (row.images ?? []).filter(Boolean).map(toImageUrl),
    isFeatured: row.is_featured,
    isActive: row.is_active,
  };
}

/**
 * Runs a query, logging any failure. Returns `{ ok: false }` instead of
 * throwing, so the calling function can fall back to an empty result.
 */
async function safeQuery<T>(
  label: string,
  run: () => PromiseLike<{ data: T | null; error: unknown }>,
): Promise<{ ok: true; data: T | null } | { ok: false }> {
  try {
    const { data, error } = await run();
    if (error) {
      console.error(`[data] ${label} failed:`, error);
      return { ok: false };
    }
    return { ok: true, data };
  } catch (error) {
    console.error(`[data] ${label} failed:`, error);
    return { ok: false };
  }
}

// ---------------------------------------------------------------------------
// Public functions used by the pages
// ---------------------------------------------------------------------------

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery("getCollections", () =>
    createPublicClient()
      .from("collections")
      .select(COLLECTION_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .overrideTypes<CollectionRow[], { merge: false }>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return [];
  }

  cacheLife("hours");
  return (result.data ?? []).map(toCollection);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery(`getCollectionBySlug(${slug})`, () =>
    createPublicClient()
      .from("collections")
      .select(COLLECTION_COLUMNS)
      .eq("slug", slug)
      .maybeSingle<CollectionRow>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return null;
  }

  cacheLife("hours");
  return result.data ? toCollection(result.data) : null;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery(`getCollectionById(${id})`, () =>
    createPublicClient()
      .from("collections")
      .select(COLLECTION_COLUMNS)
      .eq("id", id)
      .maybeSingle<CollectionRow>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return null;
  }

  cacheLife("hours");
  return result.data ? toCollection(result.data) : null;
}

export async function getProductsByCollection(collectionId: string): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery(`getProductsByCollection(${collectionId})`, () =>
    createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("collection_id", collectionId)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .overrideTypes<ProductRow[], { merge: false }>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return [];
  }

  cacheLife("hours");
  return (result.data ?? []).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery(`getProductBySlug(${slug})`, () =>
    createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle<ProductRow>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return null;
  }

  cacheLife("hours");
  return result.data ? toProduct(result.data) : null;
}

/** Every phone model this product is made for, each with its stock flag, in sort_order. */
export async function getPhoneModelsForProduct(
  productId: string,
): Promise<PhoneModelWithStock[]> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery(`getPhoneModelsForProduct(${productId})`, () =>
    createPublicClient()
      .from("product_phone_models")
      .select("in_stock, phone_models (id, brand, name, sort_order)")
      .eq("product_id", productId)
      .overrideTypes<ProductPhoneModelRow[], { merge: false }>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return [];
  }

  cacheLife("hours");
  return (result.data ?? [])
    .flatMap((row) => (row.phone_models ? [{ ...row.phone_models, inStock: row.in_stock }] : []))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map(({ id, brand, name, inStock }) => ({ id, brand, name, inStock }));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_TAG);

  const result = await safeQuery("getFeaturedProducts", () =>
    createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .overrideTypes<ProductRow[], { merge: false }>(),
  );
  if (!result.ok) {
    cacheLife("minutes");
    return [];
  }

  cacheLife("hours");
  return (result.data ?? []).map(toProduct);
}
