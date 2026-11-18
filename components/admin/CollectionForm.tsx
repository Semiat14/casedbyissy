"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveCollection } from "@/app/admin/(protected)/collections/actions";
import { initialFormState, slugify } from "@/lib/admin-forms";
import FormField, { FormTextarea } from "./FormField";
import FormMessage from "./FormMessage";
import PhotoUploader from "./PhotoUploader";
import SubmitButton from "./SubmitButton";

type CollectionFormProps = {
  /** Omit to create a new collection. */
  collection?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string | null;
  };
};

export default function CollectionForm({ collection }: CollectionFormProps) {
  const isEditing = Boolean(collection);
  const [state, formAction] = useActionState(
    saveCollection.bind(null, collection?.id ?? null),
    initialFormState,
  );

  const [name, setName] = useState(collection?.name ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  // New collections: the slug follows the name until Issy edits it herself.
  const [slugEdited, setSlugEdited] = useState(isEditing);

  const [uploading, setUploading] = useState(false);

  const slugChanged = isEditing && slug !== collection?.slug;
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" && state.message && (
        <FormMessage status="error">{state.message}</FormMessage>
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-foreground/65">Cover photo</p>
        <PhotoUploader
          folder="collections"
          name="coverImage"
          maxPhotos={1}
          initialPaths={collection?.coverImage ? [collection.coverImage] : []}
          onBusyChange={setUploading}
          error={errors.coverImage}
        />
      </div>

      <FormField
        label="Name"
        name="name"
        required
        maxLength={80}
        value={name}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          if (!slugEdited) setSlug(slugify(e.target.value));
        }}
      />

      <FormField
        label="Slug"
        name="slug"
        required
        maxLength={80}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={slug}
        error={errors.slug}
        onChange={(e) => {
          setSlugEdited(true);
          setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
        }}
        hint={
          <>
            <span>
              The web address: casedbyissy.com/collections/<strong>{slug || "…"}</strong>. Lowercase
              letters, numbers and hyphens only.
            </span>
            {isEditing && (
              <span
                className={`mt-2 block ${slugChanged ? "font-medium text-amber-900" : "text-foreground/60"}`}
              >
                ⚠ Changing this will break links you&rsquo;ve already shared.
              </span>
            )}
          </>
        }
      />

      <FormTextarea
        label="Description (optional)"
        name="description"
        maxLength={1000}
        // After an error React resets the form; keep what was typed.
        defaultValue={state.values?.description ?? collection?.description ?? ""}
        error={errors.description}
        hint="A short line shown under the collection name."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton disabled={uploading}>
          {uploading ? "Uploading photo…" : isEditing ? "Save changes" : "Create collection"}
        </SubmitButton>
        <Link
          href="/admin/collections"
          className="flex min-h-12 items-center justify-center px-6 text-sm uppercase tracking-[0.15em] text-foreground/65 hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
