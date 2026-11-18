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
  productCount: number;
};

type AdminCollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: { count: number }[] | null;
};

function toAdminCollection(row: AdminCollectionRow): AdminCollection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    productCount: row.products?.[0]?.count ?? 0,
  };
}

/** All collections in display order, with how many products each has. `null` on error. */
export async function getAdminCollections(): Promise<AdminCollection[] | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, products(count)")
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
    .select("id, name, slug, description, products(count)")
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
