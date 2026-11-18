// Shared rules for photos in the product-images bucket. Safe to import from
// both the browser (uploader) and the server (Server Actions).

export const IMAGE_BUCKET = "product-images";

export type ImageFolder = "products" | "collections";

/** Most photos a product can have. */
export const MAX_PRODUCT_IMAGES = 10;

/**
 * A path our uploader could have produced: the expected folder, then a single
 * file name made of safe characters with an image extension. No sub-folders,
 * no "..", nothing pointing elsewhere in the bucket.
 * e.g. "products/3f1c…e9.webp"
 */
export function isImagePath(value: unknown, folder: ImageFolder): value is string {
  return (
    typeof value === "string" &&
    new RegExp(`^${folder}/[a-z0-9-]{8,64}\\.(webp|jpg|jpeg|png)$`).test(value)
  );
}

/** Public URL of a file in the bucket (the bucket is public). */
export function publicImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
