"use server";

// Server Actions for /admin/collections.
//
// Every action can be called directly (not only through our forms), so each
// one checks the login itself, validates everything it receives, and only
// then touches the database. After any change it calls updateTag(CATALOG_TAG)
// so the public shop shows the change on the very next page view.

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PG, errorCode, moveRow, nextSortOrder } from "@/lib/admin-db";
import {
  SLUG_PATTERN,
  isDirection,
  isUuid,
  readMultiline,
  readText,
  slugify,
  type FormState,
} from "@/lib/admin-forms";

const HAS_PRODUCTS = "This collection still has products. Move or delete them first.";
const GENERIC = "Something went wrong while saving. Please try again.";

/** Create (id = null) or update a collection. Bind the id: saveCollection.bind(null, id). */
export async function saveCollection(
  id: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (id !== null && !isUuid(id)) return { status: "error", message: GENERIC };

  const name = readText(formData, "name");
  const slugInput = readText(formData, "slug").toLowerCase();
  const description = readMultiline(formData, "description");
  const slug = slugInput || slugify(name);
  const values = { name, slug, description };

  // Validate
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Please enter a name.";
  else if (name.length > 80) fieldErrors.name = "Please keep the name under 80 characters.";

  if (!slug) fieldErrors.slug = "Please enter a slug.";
  else if (slug.length > 80) fieldErrors.slug = "Please keep the slug under 80 characters.";
  else if (!SLUG_PATTERN.test(slug))
    fieldErrors.slug = "Use lowercase letters, numbers and single hyphens only (e.g. lace-theory).";

  if (description.length > 1000)
    fieldErrors.description = "Please keep the description under 1,000 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  // Save
  const supabase = await createClient();
  try {
    if (id === null) {
      const sort_order = await nextSortOrder(supabase, "collections");
      const { error } = await supabase
        .from("collections")
        .insert({ name, slug, description, sort_order });
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("collections")
        .update({ name, slug, description })
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (!data?.length) {
        return { status: "error", message: "This collection no longer exists.", values };
      }
    }
  } catch (error) {
    if (errorCode(error) === PG.uniqueViolation) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        fieldErrors: { slug: "Another collection already uses this slug. Please choose a different one." },
        values,
      };
    }
    console.error("[admin] saveCollection failed:", error);
    return { status: "error", message: GENERIC, values };
  }

  updateTag(CATALOG_TAG);
  redirect(`/admin/collections?saved=${id === null ? "created" : "updated"}`);
}

/** Delete a collection. Bind the id: deleteCollection.bind(null, id). */
export async function deleteCollection(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return { status: "error", message: GENERIC };

  const supabase = await createClient();

  // Check first so we can explain, rather than relying on the database error.
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", id);
  if (countError) {
    console.error("[admin] deleteCollection count failed:", countError);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  if ((count ?? 0) > 0) return { status: "error", message: HAS_PRODUCTS };

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) {
    // A product could have been added in the meantime; the database blocks it.
    if (errorCode(error) === PG.foreignKeyViolation) return { status: "error", message: HAS_PRODUCTS };
    console.error("[admin] deleteCollection failed:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/collections?saved=deleted");
}

/** Move a collection one place up or down. Bind both: moveCollection.bind(null, id, "up"). */
export async function moveCollection(id: string, direction: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(id) || !isDirection(direction)) return;

  const supabase = await createClient();
  try {
    await moveRow(supabase, "collections", id, direction);
  } catch (error) {
    console.error("[admin] moveCollection failed:", error);
    return;
  }

  updateTag(CATALOG_TAG);
  refresh(); // redraw this admin page with the new order
}
