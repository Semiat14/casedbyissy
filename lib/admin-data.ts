// Data reads for the admin area.
//
// These use the cookie-based server client, so they run as the signed-in
// admin (Row Level Security lets the admin see hidden products too).
//
// NOT CACHED, on purpose: no "use cache" here, and nothing here is tagged
// "catalog". Admin results depend on who's signed in, must always be fresh,
// and must never end up in the public catalog cache that visitors share
// (that lives in lib/data.ts and uses the cookie-free public client).

import { isUuid } from "./admin-forms";
import { requireAdmin } from "./auth";
import { createClient } from "./supabase/server";

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export type AdminCollection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Storage path of the cover photo, or null. */
  coverImage: string | null;
  productCount: number;
};

type AdminCollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  products: { count: number }[] | null;
};

function toAdminCollection(row: AdminCollectionRow): AdminCollection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    coverImage: row.cover_image,
    productCount: row.products?.[0]?.count ?? 0,
  };
}

/** All collections in display order, with how many products each has. `null` on error. */
export async function getAdminCollections(): Promise<AdminCollection[] | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, cover_image, products(count)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .overrideTypes<AdminCollectionRow[], { merge: false }>();

  if (error) {
    console.error("[admin] getAdminCollections failed:", error);
    return null;
  }
  return (data ?? []).map(toAdminCollection);
}

/** One collection, or null if it doesn't exist (or the id is malformed). */
export async function getAdminCollection(id: string): Promise<AdminCollection | null> {
  await requireAdmin();
  if (!isUuid(id)) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, cover_image, products(count)")
    .eq("id", id)
    .maybeSingle<AdminCollectionRow>();

  if (error) {
    console.error("[admin] getAdminCollection failed:", error);
    return null;
  }
  return data ? toAdminCollection(data) : null;
}

// ---------------------------------------------------------------------------
// Phone models
// ---------------------------------------------------------------------------

export type AdminPhoneModel = {
  id: string;
  brand: string;
  name: string;
};

export type PhoneModelGroup = {
  brand: string;
  models: AdminPhoneModel[];
};

/** All phone models in display order. `null` on error. */
export async function getAdminPhoneModels(): Promise<AdminPhoneModel[] | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("phone_models")
    .select("id, brand, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .overrideTypes<AdminPhoneModel[], { merge: false }>();

  if (error) {
    console.error("[admin] getAdminPhoneModels failed:", error);
    return null;
  }
  return data ?? [];
}

/**
 * Groups models by brand (case-insensitive). Brands appear in the order of
 * their first model; models keep their sort order within each brand.
 */
export function groupByBrand(models: AdminPhoneModel[]): PhoneModelGroup[] {
  const groups = new Map<string, PhoneModelGroup>();
  for (const model of models) {
    const key = model.brand.toLowerCase();
    const group = groups.get(key) ?? { brand: model.brand, models: [] };
    group.models.push(model);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** One phone model, or null if it doesn't exist (or the id is malformed). */
export async function getAdminPhoneModel(id: string): Promise<AdminPhoneModel | null> {
  await requireAdmin();
  if (!isUuid(id)) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("phone_models")
    .select("id, brand, name")
    .eq("id", id)
    .maybeSingle<AdminPhoneModel>();

  if (error) {
    console.error("[admin] getAdminPhoneModel failed:", error);
    return null;
  }
  return data;
}

/** How many products a phone model is offered on (for the delete warning). */
export async function getPhoneModelProductCount(id: string): Promise<number> {
  await requireAdmin();
  if (!isUuid(id)) return 0;
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("product_phone_models")
    .select("*", { count: "exact", head: true })
    .eq("phone_model_id", id);

  if (error) {
    console.error("[admin] getPhoneModelProductCount failed:", error);
    return 0;
  }
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type AdminProductSummary = {
  id: string;
  name: string;
  slug: string;
  price: number;
  /** Storage path of the main photo, or null. */
  mainImage: string | null;
  collectionId: string;
  collectionName: string;
  isActive: boolean;
  isFeatured: boolean;
};

type AdminProductSummaryRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  collection_id: string;
  is_active: boolean;
  is_featured: boolean;
  collections: { name: string } | null;
};

/**
 * All products, hidden ones included, newest first. Pass a collection id to
 * show only that collection. `null` on error.
 */
export async function getAdminProducts(collectionId?: string): Promise<AdminProductSummary[] | null> {
  await requireAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, slug, price, images, collection_id, is_active, is_featured, collections(name)")
    .order("created_at", { ascending: false });
  if (collectionId && isUuid(collectionId)) query = query.eq("collection_id", collectionId);

  const { data, error } = await query.overrideTypes<AdminProductSummaryRow[], { merge: false }>();
  if (error) {
    console.error("[admin] getAdminProducts failed:", error);
    return null;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    mainImage: row.images?.[0] ?? null,
    collectionId: row.collection_id,
    collectionName: row.collections?.name ?? "—",
    isActive: row.is_active,
    isFeatured: row.is_featured,
  }));
}

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  collectionId: string;
  description: string;
  price: number;
  /** Storage paths, main photo first. */
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  phoneModels: { phoneModelId: string; inStock: boolean }[];
};

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  collection_id: string;
  description: string | null;
  price: number;
  images: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  product_phone_models: { phone_model_id: string; in_stock: boolean }[] | null;
};

/** One product with its phone models, or null if it doesn't exist. */
export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  await requireAdmin();
  if (!isUuid(id)) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, collection_id, description, price, images, is_featured, is_active, product_phone_models(phone_model_id, in_stock)",
    )
    .eq("id", id)
    .maybeSingle<AdminProductRow>();

  if (error) {
    console.error("[admin] getAdminProduct failed:", error);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    collectionId: data.collection_id,
    description: data.description ?? "",
    price: data.price,
    images: data.images ?? [],
    isFeatured: data.is_featured,
    isActive: data.is_active,
    phoneModels: (data.product_phone_models ?? []).map((link) => ({
      phoneModelId: link.phone_model_id,
      inStock: link.in_stock,
    })),
  };
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type CatalogCounts = {
  collections: number;
  products: number;
  hiddenProducts: number;
  phoneModels: number;
};

/** How many of each thing exist. `null` means the count couldn't be loaded. */
export async function getCatalogCounts(): Promise<CatalogCounts | null> {
  await requireAdmin(); // every admin read checks the login itself
  const supabase = await createClient();

  const count = (table: string) => supabase.from(table).select("*", { count: "exact", head: true });

  const [collections, products, hiddenProducts, phoneModels] = await Promise.all([
    count("collections"),
    count("products"),
    count("products").eq("is_active", false),
    count("phone_models"),
  ]);

  const failed = [collections, products, hiddenProducts, phoneModels].find((r) => r.error);
  if (failed) {
    console.error("[admin] getCatalogCounts failed:", failed.error);
    return null;
  }

  return {
    collections: collections.count ?? 0,
    products: products.count ?? 0,
    hiddenProducts: hiddenProducts.count ?? 0,
    phoneModels: phoneModels.count ?? 0,
  };
}
