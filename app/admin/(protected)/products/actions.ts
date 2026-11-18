"use server";

// Server Actions for /admin/products.
//
// Every action can be called directly (not only through our forms), so each
// one checks the login itself, validates everything it receives, and only
// then touches the database. After any change it calls updateTag(CATALOG_TAG)
// so the public shop shows the change on the very next page view.

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CATALOG_TAG } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PG, errorCode, removeStoredImages } from "@/lib/admin-db";
import { MAX_PRODUCT_IMAGES, isImagePath } from "@/lib/storage";
import {
  SLUG_PATTERN,
  isUuid,
  readMultiline,
  readText,
  slugify,
  type FormState,
} from "@/lib/admin-forms";

const GENERIC = "Something went wrong while saving. Please try again.";
const MAX_PRICE = 10_000_000;

/** All values of a repeated field (e.g. several checked boxes), as strings. */
function readAll(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((v): v is string => typeof v === "string");
}

/**
 * Create (id = null) or update a product, including its photos and phone
 * models. Bind the id: saveProduct.bind(null, id).
 */
export async function saveProduct(
  id: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (id !== null && !isUuid(id)) return { status: "error", message: GENERIC };

  // Read and tidy everything
  const name = readText(formData, "name");
  const slug = readText(formData, "slug").toLowerCase() || slugify(name);
  const collectionId = readText(formData, "collectionId");
  const priceInput = readText(formData, "price");
  const description = readMultiline(formData, "description");
  const isFeatured = formData.get("featured") === "on";
  const isActive = formData.get("visible") === "on";
  const images = [...new Set(readAll(formData, "images"))];
  const modelIds = [...new Set(readAll(formData, "phoneModels"))].filter(isUuid);
  const inStockIds = new Set(readAll(formData, "inStock"));

  const values = { name, slug, collectionId, price: priceInput, description };
  const fieldErrors: Record<string, string> = {};

  // Validate
  if (!name) fieldErrors.name = "Please enter a name.";
  else if (name.length > 100) fieldErrors.name = "Please keep the name under 100 characters.";

  if (!slug) fieldErrors.slug = "Please enter a slug.";
  else if (slug.length > 100) fieldErrors.slug = "Please keep the slug under 100 characters.";
  else if (!SLUG_PATTERN.test(slug))
    fieldErrors.slug = "Use lowercase letters, numbers and single hyphens only (e.g. lace-theory-blush).";

  if (!isUuid(collectionId)) fieldErrors.collectionId = "Please choose a collection.";

  // Accept "15000", "15,000" or "₦15,000"; whole naira only.
  const priceDigits = priceInput.replace(/[₦,\s]/g, "");
  const price = Number(priceDigits);
  if (!priceDigits) fieldErrors.price = "Please enter a price.";
  else if (!/^\d+$/.test(priceDigits)) fieldErrors.price = "Please enter whole naira only, e.g. 15000.";
  else if (price <= 0) fieldErrors.price = "The price must be more than ₦0.";
  else if (price > MAX_PRICE) fieldErrors.price = "That price looks too high. Please check it.";

  if (description.length > 2000)
    fieldErrors.description = "Please keep the description under 2,000 characters.";

  // Only accept paths our uploader could have produced, inside products/.
  if (images.some((path) => !isImagePath(path, "products")))
    fieldErrors.images = "One of the photos couldn't be saved. Please remove it and upload it again.";
  else if (images.length > MAX_PRODUCT_IMAGES)
    fieldErrors.images = `Please use at most ${MAX_PRODUCT_IMAGES} photos.`;

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  const supabase = await createClient();

  // The collection must exist
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .maybeSingle();
  if (collectionError) {
    console.error("[admin] saveProduct collection check failed:", collectionError);
    return { status: "error", message: GENERIC, values };
  }
  if (!collection) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { collectionId: "That collection no longer exists. Please choose another." },
      values,
    };
  }

  // Keep only phone models that really exist
  let phoneModelIds: string[] = [];
  if (modelIds.length > 0) {
    const { data: models, error } = await supabase
      .from("phone_models")
      .select("id")
      .in("id", modelIds);
    if (error) {
      console.error("[admin] saveProduct model check failed:", error);
      return { status: "error", message: GENERIC, values };
    }
    phoneModelIds = (models ?? []).map((m: { id: string }) => m.id);
  }

  const row = {
    name,
    slug,
    collection_id: collectionId,
    price,
    description,
    images,
    is_featured: isFeatured,
    is_active: isActive,
  };

  // Save the product
  let productId = id;
  let oldImages: string[] = [];
  try {
    if (id === null) {
      const { data, error } = await supabase.from("products").insert(row).select("id").single<{ id: string }>();
      if (error) throw error;
      productId = data.id;
    } else {
      const { data: before, error: readError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .maybeSingle<{ images: string[] | null }>();
      if (readError) throw readError;
      if (!before) return { status: "error", message: "This product no longer exists.", values };
      oldImages = before.images ?? [];

      const { error } = await supabase.from("products").update(row).eq("id", id);
      if (error) throw error;
    }
  } catch (error) {
    const code = errorCode(error);
    if (code === PG.uniqueViolation) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        fieldErrors: { slug: "Another product already uses this slug. Please choose a different one." },
        values,
      };
    }
    if (code === PG.foreignKeyViolation) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        fieldErrors: { collectionId: "That collection no longer exists. Please choose another." },
        values,
      };
    }
    console.error("[admin] saveProduct failed:", error);
    return { status: "error", message: GENERIC, values };
  }

  // Save its phone models
  const linksSaved = await replacePhoneModels(supabase, productId!, phoneModelIds, inStockIds);
  if (!linksSaved) {
    if (id === null) {
      // Don't leave a half-saved new product behind.
      await supabase.from("products").delete().eq("id", productId!);
      return { status: "error", message: GENERIC, values };
    }
    updateTag(CATALOG_TAG);
    return {
      status: "error",
      message: "The product was saved, but its phone models couldn't be updated. Please save again.",
      values,
    };
  }

  // Saved: delete photos that were removed from this product.
  const kept = new Set(images);
  await removeStoredImages(supabase, oldImages.filter((path) => !kept.has(path)));

  updateTag(CATALOG_TAG);
  redirect(`/admin/products?saved=${id === null ? "created" : "updated"}`);
}

/**
 * Makes the product's phone models exactly `ids`: adds/updates those (with
 * their in-stock flag), then removes any others. Adding first means a failure
 * part-way never leaves the product with no models at all.
 */
async function replacePhoneModels(
  supabase: SupabaseClient,
  productId: string,
  ids: string[],
  inStockIds: Set<string>,
): Promise<boolean> {
  if (ids.length > 0) {
    const { error } = await supabase.from("product_phone_models").upsert(
      ids.map((phoneModelId) => ({
        product_id: productId,
        phone_model_id: phoneModelId,
        in_stock: inStockIds.has(phoneModelId),
      })),
      { onConflict: "product_id,phone_model_id" },
    );
    if (error) {
      console.error("[admin] saving phone models failed:", error);
      return false;
    }
  }

  let removal = supabase.from("product_phone_models").delete().eq("product_id", productId);
  if (ids.length > 0) removal = removal.not("phone_model_id", "in", `(${ids.join(",")})`);
  const { error } = await removal;
  if (error) {
    console.error("[admin] removing phone models failed:", error);
    return false;
  }
  return true;
}

/** Delete a product and its photos. Bind the id: deleteProduct.bind(null, id). */
export async function deleteProduct(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return { status: "error", message: GENERIC };

  const supabase = await createClient();
  // Its phone model rows are removed by the database (on delete cascade).
  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("images")
    .overrideTypes<{ images: string[] | null }[], { merge: false }>();
  if (error) {
    console.error("[admin] deleteProduct failed:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  await removeStoredImages(supabase, (deleted ?? []).flatMap((row) => row.images ?? []));

  updateTag(CATALOG_TAG);
  redirect("/admin/products?saved=deleted");
}

/** Quick Visible/Hidden switch on the list. Bind: setProductVisibility.bind(null, id, "show"). */
export async function setProductVisibility(id: string, visibility: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(id) || (visibility !== "show" && visibility !== "hide")) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: visibility === "show" })
    .eq("id", id);
  if (error) {
    console.error("[admin] setProductVisibility failed:", error);
    return;
  }

  updateTag(CATALOG_TAG);
  refresh();
}
