"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/admin/actions";

const initialState: SignInState = { error: null, email: "" };

const fieldClass =
  "mt-2 w-full border border-foreground/15 bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-foreground";
const labelClass = "text-xs uppercase tracking-[0.15em] text-foreground/60";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          defaultValue={state.email}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </label>

      <p aria-live="polite" className="min-h-5 text-sm text-red-800">
        {state.error}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
