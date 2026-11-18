// SERVER CLIENT — for the admin area (coming later).
//
// Reads the visitor's Supabase login cookies, so queries run as the signed-in
// admin and Row Level Security allows editing. Because the result depends on
// who's asking, never use it inside "use cache" — use createPublicClient()
// for public catalog reads instead.
//
// Create a new one per request (don't share it between requests).

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Cookies can't be set while a Server Component is rendering; only in
          // Server Actions and Route Handlers. Safe to ignore here: the
          // session refresh will be handled by the auth proxy added with the admin.
        }
      },
    },
  });
}
