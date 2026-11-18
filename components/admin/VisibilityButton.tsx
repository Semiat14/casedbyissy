"use client";

import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";

/** One-tap Visible/Hidden switch for a product row. */
export default function VisibilityButton({
  visible,
  action,
  productName,
}: {
  visible: boolean;
  /** Server Action with id and the new visibility already bound. */
  action: () => Promise<void>;
  productName: string;
}) {
  return (
    <form action={action} className="shrink-0">
      <Button visible={visible} productName={productName} />
    </form>
  );
}

function Button({ visible, productName }: { visible: boolean; productName: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`${productName} is ${visible ? "visible" : "hidden"}. Tap to ${visible ? "hide" : "show"} it.`}
      className={`flex min-h-11 w-24 items-center justify-center gap-1.5 border px-2 text-[11px] uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
        visible
          ? "border-foreground/20 hover:border-foreground/60"
          : "border-dashed border-foreground/30 text-foreground/60 hover:border-foreground/60"
      }`}
    >
      {visible ? <Eye size={15} strokeWidth={1.5} /> : <EyeOff size={15} strokeWidth={1.5} />}
      {pending ? "…" : visible ? "Visible" : "Hidden"}
    </button>
  );
}
