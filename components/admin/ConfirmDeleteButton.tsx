"use client";

import { useActionState, useState } from "react";
import { initialFormState, type FormState } from "@/lib/admin-forms";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

type ConfirmDeleteButtonProps = {
  /** A Server Action with the id already bound, e.g. deleteCollection.bind(null, id). */
  action: () => Promise<FormState>;
  /** e.g. "Delete collection" */
  label: string;
  /** What will happen, shown in the confirmation step. */
  warning: React.ReactNode;
};

/**
 * Two-step delete: the first tap asks "Are you sure?", the second deletes.
 * If the server refuses (e.g. the collection still has products), the reason
 * is shown here.
 */
export default function ConfirmDeleteButton({ action, label, warning }: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <div className="flex flex-col gap-4">
      {state.status === "error" && state.message && (
        <FormMessage status="error">{state.message}</FormMessage>
      )}

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="min-h-12 w-full border border-red-800/40 px-6 py-3 text-sm uppercase tracking-[0.15em] text-red-800 transition-colors hover:border-red-800 sm:w-auto"
        >
          {label}
        </button>
      ) : (
        <form action={formAction} className="flex flex-col gap-4 border border-red-800/30 bg-red-50/60 p-5">
          <p className="font-medium">Are you sure?</p>
          <div className="text-sm leading-relaxed text-foreground/80">{warning}</div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SubmitButton variant="danger" pendingLabel="Deleting…">
              Yes, delete
            </SubmitButton>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-12 w-full border border-foreground/25 px-6 py-3 text-sm uppercase tracking-[0.15em] hover:border-foreground sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
