"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProduct } from "@/app/admin/(protected)/products/actions";
import { initialFormState, slugify } from "@/lib/admin-forms";
import type { AdminProduct, PhoneModelGroup } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { MAX_PRODUCT_IMAGES } from "@/lib/storage";
import FormField, { FormTextarea } from "./FormField";
import FormMessage from "./FormMessage";
import PhotoUploader from "./PhotoUploader";
import SubmitButton from "./SubmitButton";
import Toggle from "./Toggle";

type ProductFormProps = {
  /** Omit to create a new product. */
  product?: AdminProduct;
  collections: { id: string; name: string }[];
  phoneModelGroups: PhoneModelGroup[];
  /** Pre-selected collection for a new product (e.g. from the list filter). */
  defaultCollectionId?: string;
};

const labelClass = "text-xs uppercase tracking-[0.15em] text-foreground/65";

export default function ProductForm({
  product,
  collections,
  phoneModelGroups,
  defaultCollectionId,
}: ProductFormProps) {
  const isEditing = Boolean(product);
  const [state, formAction] = useActionState(
    saveProduct.bind(null, product?.id ?? null),
    initialFormState,
  );
  const errors = state.fieldErrors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [collectionId, setCollectionId] = useState(
    product?.collectionId ?? defaultCollectionId ?? "",
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [featured, setFeatured] = useState(product?.isFeatured ?? false);
  const [visible, setVisible] = useState(product?.isActive ?? true);
  const [uploading, setUploading] = useState(false);
  // Checked phone models → whether each is in stock.
  const [models, setModels] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((product?.phoneModels ?? []).map((m) => [m.phoneModelId, m.inStock])),
  );

  const slugChanged = isEditing && slug !== product?.slug;
  const priceDigits = price.replace(/[₦,\s]/g, "");
  const pricePreview = /^\d+$/.test(priceDigits) && Number(priceDigits) > 0 ? formatPrice(Number(priceDigits)) : null;

  function toggleModel(id: string, checked: boolean) {
    setModels((current) => {
      const next = { ...current };
      if (checked) next[id] = current[id] ?? true; // new models default to in stock
      else delete next[id];
      return next;
    });
  }

  function setBrand(group: PhoneModelGroup, checked: boolean) {
    group.models.forEach((model) => toggleModel(model.id, checked));
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.status === "error" && state.message && (
        <FormMessage status="error">{state.message}</FormMessage>
      )}

      {/* Photos */}
      <div>
        <p className={`${labelClass} mb-2`}>Photos</p>
        <PhotoUploader
          folder="products"
          name="images"
          maxPhotos={MAX_PRODUCT_IMAGES}
          initialPaths={product?.images ?? []}
          onBusyChange={setUploading}
          error={errors.images}
        />
      </div>

      <FormField
        label="Name"
        name="name"
        required
        maxLength={100}
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
        maxLength={100}
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
              The web address: casedbyissy.com/product/<strong>{slug || "…"}</strong>. Lowercase
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

      {/* Collection */}
      <div>
        <label htmlFor="field-collectionId" className={labelClass}>
          Collection
        </label>
        <select
          id="field-collectionId"
          name="collectionId"
          required
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          aria-invalid={errors.collectionId ? true : undefined}
          className={`mt-2 min-h-12 w-full border bg-white/70 px-4 py-3 text-base outline-none focus:border-foreground ${errors.collectionId ? "border-red-700" : "border-foreground/20"}`}
        >
          <option value="" disabled>
            Choose a collection…
          </option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {collections.length === 0 && (
          <p className="mt-2 text-sm text-foreground/60">
            No collections yet.{" "}
            <Link href="/admin/collections/new" className="underline underline-offset-4">
              Add a collection
            </Link>{" "}
            first.
          </p>
        )}
        {errors.collectionId && <p className="mt-2 text-sm text-red-800">{errors.collectionId}</p>}
      </div>

      <FormField
        label="Price (naira)"
        name="price"
        required
        inputMode="numeric"
        autoComplete="off"
        placeholder="e.g. 15000"
        value={price}
        error={errors.price}
        onChange={(e) => setPrice(e.target.value)}
        hint={pricePreview ? <>Shows in the shop as <strong>{pricePreview}</strong></> : "Whole naira, no kobo."}
      />

      <FormTextarea
        label="Description (optional)"
        name="description"
        maxLength={2000}
        rows={5}
        // After an error React resets the form; keep what was typed.
        defaultValue={state.values?.description ?? product?.description ?? ""}
        error={errors.description}
      />

      {/* Phone models */}
      <fieldset>
        <legend className={labelClass}>Phone models</legend>
        <p className="mt-2 text-sm text-foreground/60">
          Tick every model this case is made for. Switch off &ldquo;In stock&rdquo; to show it as sold out.
        </p>

        {phoneModelGroups.length === 0 ? (
          <p className="mt-4 border border-foreground/10 px-4 py-4 text-sm">
            No phone models yet.{" "}
            <Link href="/admin/phone-models" className="underline underline-offset-4">
              Add phone models
            </Link>{" "}
            first. You can still save this product and add them later.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            {phoneModelGroups.map((group) => {
              const allChecked = group.models.every((m) => m.id in models);
              return (
                <div key={group.brand}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-heading text-xl">{group.brand}</p>
                    <button
                      type="button"
                      onClick={() => setBrand(group, !allChecked)}
                      className="min-h-11 px-2 text-xs uppercase tracking-[0.12em] underline underline-offset-4 hover:opacity-60"
                    >
                      {allChecked ? "Clear all" : "Select all"}
                    </button>
                  </div>
                  <ul className="mt-1 divide-y divide-foreground/10 border-y border-foreground/10">
                    {group.models.map((model) => {
                      const checked = model.id in models;
                      return (
                        <li key={model.id} className="flex flex-wrap items-center justify-between gap-x-4 py-1">
                          <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              name="phoneModels"
                              value={model.id}
                              checked={checked}
                              onChange={(e) => toggleModel(model.id, e.target.checked)}
                              className="h-5 w-5 accent-foreground"
                            />
                            <span>{model.name}</span>
                          </label>
                          {checked && (
                            <div className="w-36">
                              <Toggle
                                size="sm"
                                name="inStock"
                                value={model.id}
                                label={models[model.id] ? "In stock" : "Sold out"}
                                checked={models[model.id]}
                                onChange={(on) => setModels((current) => ({ ...current, [model.id]: on }))}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Visibility */}
      <div className="flex flex-col gap-2 border-y border-foreground/10 py-4">
        <Toggle
          name="visible"
          label="Visible in the shop"
          hint={visible ? "Customers can see and order it." : "Hidden: only you can see it here."}
          checked={visible}
          onChange={setVisible}
        />
        <Toggle
          name="featured"
          label="Featured"
          hint="Highlight it as a favourite."
          checked={featured}
          onChange={setFeatured}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton disabled={uploading}>
          {uploading ? "Uploading photos…" : isEditing ? "Save changes" : "Create product"}
        </SubmitButton>
        <Link
          href="/admin/products"
          className="flex min-h-12 items-center justify-center px-6 text-sm uppercase tracking-[0.15em] text-foreground/65 hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
