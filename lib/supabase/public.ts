// PUBLIC CLIENT — for reading the shop catalog (collections, products, phone
// models) on the server.
//
// It never reads or writes cookies, so every visitor gets exactly the same
// answer. That's what lets lib/data.ts cache the results with "use cache":
// nothing about the request (who's visiting, are they signed in) affects them.
// It always acts as a signed-out visitor, so Row Level Security only lets it
// see public data (e.g. active products only).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let client: SupabaseClient | null = null;

export function createPublicClient(): SupabaseClient {
  if (!client) {
    const { url, key } = getSupabaseEnv();
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
