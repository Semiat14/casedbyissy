"use server";

// Server Actions for /admin/phone-models.
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
import { moveRow, nextSortOrder } from "@/lib/admin-db";
import { isDirection, isUuid, readText, type FormState } from "@/lib/admin-forms";

const GENERIC = "Something went wrong while saving. Please try again.";

type Validated =
  | { ok: true; brand: string; name: string }
  | { ok: false; state: FormState };

/**
 * Checks brand + name, reuses the existing spelling of a brand
 * ("iphone" → "iPhone") so groups don't split, and rejects exact duplicates
 * (same brand and name, ignoring capitals). `exceptId` skips the model being edited.
 */
async function validatePhoneModel(
  formData: FormData,
  exceptId: string | null,
): Promise<Validated> {
  let brand = readText(formData, "brand");
  const name = readText(formData, "name");
  const values = { brand, name };

  const fieldErrors: Record<string, string> = {};
  if (!brand) fieldErrors.brand = "Please enter a brand, e.g. iPhone or Samsung.";
  else if (brand.length > 40) fieldErrors.brand = "Please keep the brand under 40 characters.";
  if (!name) fieldErrors.name = "Please enter the model, e.g. iPhone 15 Pro.";
  else if (name.length > 60) fieldErrors.name = "Please keep the model under 60 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: { status: "error", message: "Please check the highlighted fields.", fieldErrors, values },
    };
  }

  const supabase = await createClient();
  const { data: existing, error } = await supabase
    .from("phone_models")
    .select("id, brand, name")
    .overrideTypes<{ id: string; brand: string; name: string }[], { merge: false }>();
  if (error) {
    console.error("[admin] validatePhoneModel failed:", error);
    return { ok: false, state: { status: "error", message: GENERIC, values } };
  }

  const others = (existing ?? []).filter((m) => m.id !== exceptId);

  const sameBrand = others.find((m) => m.brand.toLowerCase() === brand.toLowerCase());
  if (sameBrand) brand = sameBrand.brand;

  const duplicate = others.some(
    (m) => m.brand.toLowerCase() === brand.toLowerCase() && m.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Please check the highlighted fields.",
        fieldErrors: { name: `${brand} · ${name} is already in your list.` },
        values,
      },
    };
  }

  return { ok: true, brand, name };
}

/** Quick-add from the list page. Stays on the page and clears the form. */
export async function addPhoneModel(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const result = await validatePhoneModel(formData, null);
  if (!result.ok) return result.state;
  const { brand, name } = result;

  const supabase = await createClient();
  try {
    const sort_order = await nextSortOrder(supabase, "phone_models");
    const { error } = await supabase.from("phone_models").insert({ brand, name, sort_order });
    if (error) throw error;
  } catch (error) {
    console.error("[admin] addPhoneModel failed:", error);
    return { status: "error", message: GENERIC, values: { brand, name } };
  }

  updateTag(CATALOG_TAG);
  refresh(); // redraw the list with the new model
  // Keep the brand filled in: Issy often adds several models of one brand in a row.
  return { status: "success", message: `Added ${brand} · ${name}.`, values: { brand, name: "" } };
}

/** Edit page. Bind the id: updatePhoneModel.bind(null, id). */
export async function updatePhoneModel(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return { status: "error", message: GENERIC };

  const result = await validatePhoneModel(formData, id);
  if (!result.ok) return result.state;
  const { brand, name } = result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phone_models")
    .update({ brand, name })
    .eq("id", id)
    .select("id");
  if (error) {
    console.error("[admin] updatePhoneModel failed:", error);
    return { status: "error", message: GENERIC, values: { brand, name } };
  }
  if (!data?.length) {
    return { status: "error", message: "This phone model no longer exists.", values: { brand, name } };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/phone-models?saved=updated");
}

/**
 * Delete a phone model. The database also removes it from every product
 * (on delete cascade). Bind the id: deletePhoneModel.bind(null, id).
 */
export async function deletePhoneModel(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return { status: "error", message: GENERIC };

  const supabase = await createClient();
  const { error } = await supabase.from("phone_models").delete().eq("id", id);
  if (error) {
    console.error("[admin] deletePhoneModel failed:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/phone-models?saved=deleted");
}

/** Move a model up or down within its brand. Bind both: movePhoneModel.bind(null, id, "up"). */
export async function movePhoneModel(id: string, direction: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(id) || !isDirection(direction)) return;

  const supabase = await createClient();
  try {
    await moveRow(supabase, "phone_models", id, direction, { sameBrand: true });
  } catch (error) {
    console.error("[admin] movePhoneModel failed:", error);
    return;
  }

  updateTag(CATALOG_TAG);
  refresh();
}
