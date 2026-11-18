// Database helpers shared by the admin Server Actions.
//
// Deliberately NOT a "use server" file: every export of a "use server" file
// becomes a Server Action anyone can call, and these helpers don't check the
// login themselves. Only call them from an action that has already called
// requireAdmin().

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MoveDirection } from "./admin-forms";
import { IMAGE_BUCKET } from "./storage";

/** Postgres error codes we turn into friendly messages. */
export const PG = {
  uniqueViolation: "23505",
  foreignKeyViolation: "23503",
  invalidText: "22P02",
} as const;

export function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

/**
 * Deletes photos from the product-images bucket. Failures are logged, not
 * thrown: the database change has already been saved, and a leftover file
 * is harmless.
 */
export async function removeStoredImages(supabase: SupabaseClient, paths: string[]): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(unique);
  if (error) console.error("[admin] removing photos failed:", error, unique);
}

/** The next sort_order value, so new rows go to the end of the list. */
export async function nextSortOrder(
  supabase: SupabaseClient,
  table: "collections" | "phone_models",
): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();
  if (error) throw error;
  return (data?.sort_order ?? 0) + 1;
}

type OrderedRow = { id: string; sort_order: number; brand?: string };

/**
 * Moves one row up or down, then renumbers the whole list 1, 2, 3… so the
 * order stays tidy even if two rows ever had the same number.
 *
 * For phone models, pass `sameBrand: true` to move past the next model of the
 * same brand (the admin shows them grouped by brand).
 *
 * Returns false if the row wasn't found.
 */
export async function moveRow(
  supabase: SupabaseClient,
  table: "collections" | "phone_models",
  id: string,
  direction: MoveDirection,
  options: { sameBrand?: boolean } = {},
): Promise<boolean> {
  const columns = options.sameBrand ? "id, sort_order, brand" : "id, sort_order";
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .overrideTypes<OrderedRow[], { merge: false }>();
  if (error) throw error;

  const rows = [...(data ?? [])];
  const from = rows.findIndex((row) => row.id === id);
  if (from === -1) return false;

  // Find the neighbour to swap with.
  const step = direction === "up" ? -1 : 1;
  let to = from + step;
  if (options.sameBrand) {
    const brand = rows[from].brand?.toLowerCase();
    while (to >= 0 && to < rows.length && rows[to].brand?.toLowerCase() !== brand) to += step;
  }
  if (to < 0 || to >= rows.length) return true; // already at the top/bottom: nothing to do

  [rows[from], rows[to]] = [rows[to], rows[from]];

  // Save only the rows whose number actually changed.
  const changes = rows
    .map((row, index) => ({ id: row.id, sort_order: index + 1, before: row.sort_order }))
    .filter((row) => row.sort_order !== row.before);

  const results = await Promise.all(
    changes.map((row) =>
      supabase.from(table).update({ sort_order: row.sort_order }).eq("id", row.id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;

  return true;
}
