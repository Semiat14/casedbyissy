"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  addPhoneModel,
  updatePhoneModel,
} from "@/app/admin/(protected)/phone-models/actions";
import { initialFormState } from "@/lib/admin-forms";
import FormField from "./FormField";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

/** Lets the brand field suggest existing brands while still accepting new ones. */
function BrandSuggestions({ brands }: { brands: string[] }) {
  return (
    <datalist id="brand-suggestions">
      {brands.map((brand) => (
        <option key={brand} value={brand} />
      ))}
    </datalist>
  );
}

/** Quick add, on the phone models list page. */
export function AddPhoneModelForm({ brands }: { brands: string[] }) {
  const [state, formAction] = useActionState(addPhoneModel, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    // The key remounts the fields after each successful add, so they pick up
    // the new default values (brand kept, model cleared).
    <form
      key={state.status === "success" ? state.message : "form"}
      action={formAction}
      className="flex flex-col gap-5 border border-foreground/10 bg-white/60 p-5"
    >
      <h2 className="text-2xl">Add phone model</h2>

      {state.message && (
        <FormMessage status={state.status === "success" ? "success" : "error"}>
          {state.message}
        </FormMessage>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Brand"
          name="brand"
          required
          maxLength={40}
          list="brand-suggestions"
          autoComplete="off"
          placeholder="e.g. iPhone"
          defaultValue={state.values?.brand ?? ""}
          error={errors.brand}
        />
        <FormField
          label="Model"
          name="name"
          required
          maxLength={60}
          autoComplete="off"
          placeholder="e.g. iPhone 15 Pro"
          defaultValue={state.values?.name ?? ""}
          error={errors.name}
        />
      </div>
      <BrandSuggestions brands={brands} />

      <div>
        <SubmitButton pendingLabel="Adding…">Add model</SubmitButton>
      </div>
    </form>
  );
}

/** Edit page form. */
export function EditPhoneModelForm({
  model,
  brands,
}: {
  model: { id: string; brand: string; name: string };
  brands: string[];
}) {
  const [state, formAction] = useActionState(
    updatePhoneModel.bind(null, model.id),
    initialFormState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" && state.message && (
        <FormMessage status="error">{state.message}</FormMessage>
      )}

      <FormField
        label="Brand"
        name="brand"
        required
        maxLength={40}
        list="brand-suggestions"
        autoComplete="off"
        defaultValue={state.values?.brand ?? model.brand}
        error={errors.brand}
      />
      <FormField
        label="Model"
        name="name"
        required
        maxLength={60}
        autoComplete="off"
        defaultValue={state.values?.name ?? model.name}
        error={errors.name}
      />
      <BrandSuggestions brands={brands} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton>Save changes</SubmitButton>
        <Link
          href="/admin/phone-models"
          className="flex min-h-12 items-center justify-center px-6 text-sm uppercase tracking-[0.15em] text-foreground/65 hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
