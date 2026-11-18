// BROWSER CLIENT — for the admin area (coming later), e.g. uploading product
// images straight from the browser to Supabase Storage.
//
// Only use it in "use client" components. It shares the admin's login with
// the server client through cookies.

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
