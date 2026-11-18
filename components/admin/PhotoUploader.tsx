"use client";

// Pick photos → shrink them in the browser → upload straight to Supabase
// Storage → hand the form a list of storage paths (hidden inputs).
//
// The form only ever submits paths, never the photos themselves; the Server
// Action checks each path is in the right folder before saving it.
//
// Clean-up: photos uploaded and then removed here (before saving) are deleted
// right away. Photos that were already saved are only deleted from storage
// once the form is saved (the Server Action does that), so "Cancel" is safe.
// NOTE: if Issy uploads photos and then leaves without saving, those files
// stay in the bucket unused. That's harmless for now; a periodic clean-up of
// files no product or collection points to can be added later.

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  ACCEPTED_TYPES,
  FriendlyError,
  deleteUploadedImages,
  prepareImage,
  uploadImage,
} from "@/lib/image-upload";
import { publicImageUrl, type ImageFolder } from "@/lib/storage";

type Item = {
  key: string;
  /** Storage path once uploaded (or for photos that were already saved). */
  path: string | null;
  /** What the thumbnail shows: a local preview while uploading, then the stored photo. */
  preview: string;
  status: "processing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  /** Uploaded during this visit (so safe to delete straight away if removed). */
  isNew: boolean;
};

type PhotoUploaderProps = {
  folder: ImageFolder;
  /** Name of the hidden inputs the form submits, one per photo, in order. */
  name: string;
  /** Paths already saved. */
  initialPaths?: string[];
  /** 1 for a single cover photo; more for products. */
  maxPhotos: number;
  /** Tells the form when uploads are still running, so it can hold off saving. */
  onBusyChange?: (busy: boolean) => void;
  error?: string;
};

export default function PhotoUploader({
  folder,
  name,
  initialPaths = [],
  maxPhotos,
  onBusyChange,
  error,
}: PhotoUploaderProps) {
  const [items, setItems] = useState<Item[]>(() =>
    initialPaths.map((path) => ({
      key: path,
      path,
      preview: publicImageUrl(path),
      status: "done",
      progress: 1,
      isNew: false,
    })),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const single = maxPhotos === 1;

  const busy = items.some((item) => item.status === "processing" || item.status === "uploading");
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  // Free local previews when leaving the page.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => itemsRef.current.forEach((item) => revokePreview(item.preview)),
    [],
  );

  function update(key: string, changes: Partial<Item>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }

  async function processFile(key: string, file: File) {
    try {
      const { blob, extension } = await prepareImage(file);
      update(key, { status: "uploading", progress: 0 });
      const path = await uploadImage(blob, extension, folder, (progress) => update(key, { progress }));
      update(key, { status: "done", path, progress: 1 });
    } catch (err) {
      update(key, {
        status: "error",
        error: err instanceof FriendlyError ? err.message : "Something went wrong with this photo.",
      });
      if (!(err instanceof FriendlyError)) console.error("[upload]", err);
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setNotice(null);

    let files = Array.from(fileList);
    if (single) {
      // A new cover replaces the old one.
      items.forEach(discard);
      files = files.slice(0, 1);
    } else {
      const room = maxPhotos - items.length;
      if (room <= 0) {
        setNotice(`You can add up to ${maxPhotos} photos.`);
        return;
      }
      if (files.length > room) {
        setNotice(`Only ${room} more ${room === 1 ? "photo" : "photos"} added (limit ${maxPhotos}).`);
        files = files.slice(0, room);
      }
    }

    const added: Item[] = files.map((file) => ({
      key: crypto.randomUUID(),
      path: null,
      preview: URL.createObjectURL(file),
      status: "processing",
      progress: 0,
      isNew: true,
    }));
    setItems((current) => (single ? added : [...current, ...added]));
    added.forEach((item, i) => void processFile(item.key, files[i]));
  }

  /** Clean up an item that's leaving the list. */
  function discard(item: Item) {
    revokePreview(item.preview);
    if (item.isNew && item.path) void deleteUploadedImages([item.path]);
  }

  function remove(key: string) {
    const item = items.find((i) => i.key === key);
    if (item) discard(item);
    setItems((current) => current.filter((i) => i.key !== key));
  }

  function move(index: number, step: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + step;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const inputId = `photos-${name}`;
  const canAddMore = single || items.length < maxPhotos;

  return (
    <div>
      {items.length > 0 && (
        <ul className={`grid gap-3 ${single ? "max-w-48 grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
          {items.map((item, index) => (
            <li key={item.key} className="flex flex-col border border-foreground/10 bg-white/60">
              <div className="relative aspect-square overflow-hidden bg-blush">
                {/* eslint-disable-next-line @next/next/no-img-element -- local previews (blob: URLs) can't go through next/image */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />

                {!single && index === 0 && item.status !== "error" && (
                  <span className="absolute top-2 left-2 bg-foreground px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-background">
                    Main photo
                  </span>
                )}

                {(item.status === "processing" || item.status === "uploading") && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-background/60 p-2">
                    <span className="text-xs">
                      {item.status === "processing"
                        ? "Resizing…"
                        : `Uploading ${Math.round(item.progress * 100)}%`}
                    </span>
                    <div className="mt-1 h-1 w-full bg-foreground/15">
                      <div
                        className="h-full bg-foreground transition-[width]"
                        style={{ width: `${item.status === "processing" ? 5 : item.progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.status === "error" && (
                  <div className="absolute inset-0 flex items-center bg-red-50/95 p-3 text-xs leading-snug text-red-900">
                    {item.error}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                {!single ? (
                  <div className="flex">
                    <IconButton
                      label="Move photo earlier"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronLeft size={18} strokeWidth={1.5} />
                    </IconButton>
                    <IconButton
                      label="Move photo later"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronRight size={18} strokeWidth={1.5} />
                    </IconButton>
                  </div>
                ) : (
                  <span />
                )}
                <IconButton label="Remove photo" onClick={() => remove(item.key)}>
                  <X size={18} strokeWidth={1.5} />
                </IconButton>
              </div>

              {item.status === "done" && item.path && (
                <input type="hidden" name={name} value={item.path} />
              )}
            </li>
          ))}
        </ul>
      )}

      {canAddMore && (
        <label
          htmlFor={inputId}
          className={`flex min-h-14 cursor-pointer items-center justify-center border border-dashed border-foreground/30 px-6 text-sm uppercase tracking-[0.15em] transition-colors hover:border-foreground ${items.length > 0 ? "mt-3" : ""}`}
        >
          {single ? (items.length > 0 ? "Replace photo" : "Choose photo") : "+ Add photos"}
          <input
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple={!single}
            className="sr-only"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = ""; // allow picking the same file again
            }}
          />
        </label>
      )}

      <p className="mt-2 text-sm text-foreground/60">
        {single
          ? "Optional. JPEG, PNG or WebP."
          : `JPEG, PNG or WebP, up to ${maxPhotos}. The first photo is the main one.`}
        {busy && " Please wait for uploads to finish before saving."}
      </p>
      {notice && <p className="mt-2 text-sm text-amber-900">{notice}</p>}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

function revokePreview(preview: string) {
  if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center hover:bg-foreground/5 disabled:text-foreground/20"
    >
      {children}
    </button>
  );
}
