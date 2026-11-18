// Server-side login checks for the admin.
//
// Uses the cookie-based server client, so it reads the visitor's request:
// never call these inside "use cache".

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * The signed-in admin, or null. getUser() asks Supabase's auth server to
 * confirm the login cookie is genuine and still valid, rather than trusting
 * the cookie as-is. Wrapped in React's cache() so it only runs once per
 * request, however many components ask.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
});

/** The signed-in admin; sends anyone else to the login page. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
