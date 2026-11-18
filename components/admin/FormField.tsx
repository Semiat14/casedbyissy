import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  name: string;
  /** Small help text under the field. */
  hint?: React.ReactNode;
  /** Error from the server; shown in red and linked to the input for screen readers. */
  error?: string;
};

const baseClass =
  "mt-2 w-full border bg-white/70 px-4 py-3 text-base outline-none transition-colors focus:border-foreground";

/** Ids and aria attributes shared by inputs and textareas. */
function fieldAttributes({ name, hint, error }: FieldProps) {
  const id = `field-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    className: `${baseClass} ${error ? "border-red-700" : "border-foreground/20"}`,
  };
}

function FieldFrame({ label, name, hint, error, children }: FieldProps & { children: React.ReactNode }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-[0.15em] text-foreground/65">
        {label}
      </label>
      {children}
      {hint && (
        <div id={`${id}-hint`} className="mt-2 text-sm text-foreground/60">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

/** A labelled text input with optional hint and error. */
export default function FormField({
  label,
  name,
  hint,
  error,
  ...inputProps
}: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  const field = { label, name, hint, error };
  return (
    <FieldFrame {...field}>
      <input type="text" {...inputProps} {...fieldAttributes(field)} />
    </FieldFrame>
  );
}

/** A labelled textarea with optional hint and error. */
export function FormTextarea({
  label,
  name,
  hint,
  error,
  ...textareaProps
}: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const field = { label, name, hint, error };
  const attributes = fieldAttributes(field);
  return (
    <FieldFrame {...field}>
      <textarea
        rows={4}
        {...textareaProps}
        {...attributes}
        className={`${attributes.className} resize-y`}
      />
    </FieldFrame>
  );
}
