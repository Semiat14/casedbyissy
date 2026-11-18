// Browser-only helpers for the admin photo uploader: shrink a photo, then
// upload it straight to Supabase Storage as the signed-in admin.

import { createClient } from "./supabase/client";
import { getSupabaseEnv } from "./supabase/env";
import { IMAGE_BUCKET, type ImageFolder } from "./storage";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIDE = 1600;
const QUALITY = 0.8;
/** Matches the bucket limit in supabase/storage-limits.sql. */
const MAX_BYTES = 5 * 1024 * 1024;

export class FriendlyError extends Error {}

/**
 * Turns any accepted photo into a web-ready image: longest side at most
 * 1600px, WebP at ~80% quality, and the right way up (phone photos often
 * store "rotate me" in their metadata; createImageBitmap applies it).
 *
 * Safari can't create WebP files, so there we fall back to JPEG.
 */
export async function prepareImage(file: File): Promise<{ blob: Blob; extension: "webp" | "jpg" }> {
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
    throw new FriendlyError(
      file.type.includes("heic") || file.type.includes("heif")
        ? "This is an iPhone HEIC photo, which can't be read here. Please export it as JPEG, or upload it from your phone."
        : "Please choose a JPEG, PNG or WebP photo.",
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new FriendlyError(
      "This photo couldn't be read. If it's a HEIC photo, please export it as JPEG first.",
    );
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new FriendlyError("Your browser couldn't process this photo.");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await toBlob(canvas, "image/webp", QUALITY);
    let extension: "webp" | "jpg" = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob(canvas, "image/jpeg", 0.82);
      extension = "jpg";
    }
    if (!blob) throw new FriendlyError("Your browser couldn't process this photo.");
    if (blob.size > MAX_BYTES) throw new FriendlyError("This photo is too large, even after resizing.");

    return { blob, extension };
  } finally {
    bitmap.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Uploads to products/<uuid>.webp (or collections/…) and reports progress
 * from 0 to 1. Returns the storage path.
 *
 * Uses the browser Supabase client for the admin's login, and XMLHttpRequest
 * for the upload itself because it's the only browser API that reports upload
 * progress. The request is the same one supabase-js's storage upload() makes.
 */
export async function uploadImage(
  blob: Blob,
  extension: "webp" | "jpg",
  folder: ImageFolder,
  onProgress: (fraction: number) => void,
): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new FriendlyError("You've been signed out. Please sign in again.");

  const { url, key } = getSupabaseEnv();
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${url}/storage/v1/object/${IMAGE_BUCKET}/${path}`);
    xhr.setRequestHeader("authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("x-upsert", "false");
    // File names are never reused, so browsers can cache them for a year.
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("content-type", blob.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      console.error("[upload] failed:", xhr.status, xhr.responseText);
      reject(
        new FriendlyError(
          xhr.status === 413
            ? "This photo is too large to upload."
            : xhr.status === 401 || xhr.status === 403
              ? "Upload not allowed. Please sign in again."
              : "The upload failed. Please try again.",
        ),
      );
    };
    xhr.onerror = () => reject(new FriendlyError("The upload failed. Check your connection and try again."));
    xhr.send(blob);
  });

  onProgress(1);
  return path;
}

/** Deletes photos uploaded during this visit that were then removed before saving. */
export async function deleteUploadedImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await createClient().storage.from(IMAGE_BUCKET).remove(paths);
  if (error) console.error("[upload] cleanup failed:", error);
}
