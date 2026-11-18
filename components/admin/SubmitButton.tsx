"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger" | "secondary";
  className?: string;
};

const variants = {
  primary: "bg-foreground text-background hover:opacity-85",
  danger: "bg-red-800 text-white hover:opacity-90",
  secondary: "border border-foreground/25 hover:border-foreground",
};

/** A full-width-on-mobile submit button that shows a pending label and can't be double-tapped. */
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`min-h-12 w-full px-6 py-3 text-sm uppercase tracking-[0.15em] transition-opacity disabled:opacity-50 sm:w-auto ${variants[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
