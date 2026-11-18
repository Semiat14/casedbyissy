"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  error: string | null;
  email: string;
};

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Keep it friendly, and don't reveal whether the email exists.
    const isNetwork = !error.status || error.status >= 500;
    return {
      error: isNetwork
        ? "We couldn't reach the sign-in service. Please try again in a moment."
        : "That email and password don't match. Please try again.",
      email,
    };
  }

  // Signing in set the login cookies on this response; go to the dashboard.
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
