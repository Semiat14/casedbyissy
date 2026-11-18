// Shared by admin Server Actions (server) and admin forms (browser):
// the shape of a form's result, and small input helpers. No database code here.

/** What every admin form action returns to the form that called it. */
export type FormState = {
  status: "idle" | "success" | "error";
  /** Shown at the top of the form (success or general error). */
  message?: string;
  /** Per-field errors, keyed by the input's name. */
  fieldErrors?: Record<string, string>;
  /** What was submitted, so the form can be refilled after an error. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

/** Reads a text field from a form, trimmed, with inner runs of spaces collapsed. */
export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/** Like readText, but keeps line breaks (for descriptions). */
export function readMultiline(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** "Persian Princess 2.0" → "persian-princess-2-0" */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Lowercase letters, numbers and single hyphens between them. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a well-formed database id. Ids arrive from the browser, so check them. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export type MoveDirection = "up" | "down";

export function isDirection(value: unknown): value is MoveDirection {
  return value === "up" || value === "down";
}
