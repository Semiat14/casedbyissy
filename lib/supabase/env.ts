// Reads the Supabase settings from .env.local. Both are NEXT_PUBLIC_, so they
// are also available in the browser. That's expected: the publishable key is
// safe to expose, and Row Level Security decides what it can do.
//
// The variables are written out in full (not looked up by name) so Next.js can
// inline them into browser code.

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase settings. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return { url, key };
}
