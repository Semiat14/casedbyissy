// The one place the site gets its data from.
//
// Pages and components only ever call these functions — they never import the
// placeholder data or (later) the Supabase client directly. When we switch to
// Supabase, only this file changes: each function keeps its name, inputs and
// return type, and just swaps the in-memory lookup for a database query.

import type { Collection, PhoneModelWithStock, Product } from "./types";
import {
  collections,
  phoneModels,
  productPhoneModels,
  products,
} from "./placeholder-data";

export async function getCollections(): Promise<Collection[]> {
  return collections;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  return collections.find((c) => c.slug === slug) ?? null;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  return collections.find((c) => c.id === id) ?? null;
}

export async function getProductsByCollection(collectionId: string): Promise<Product[]> {
  return products.filter((p) => p.collectionId === collectionId && p.isActive);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug && p.isActive) ?? null;
}

/** Every phone model this product is made for, each with its stock flag. */
export async function getPhoneModelsForProduct(
  productId: string,
): Promise<PhoneModelWithStock[]> {
  return productPhoneModels
    .filter((link) => link.productId === productId)
    .flatMap((link) => {
      const model = phoneModels.find((m) => m.id === link.phoneModelId);
      return model ? [{ ...model, inStock: link.inStock }] : [];
    });
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((p) => p.isFeatured && p.isActive);
}
