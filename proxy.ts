// Runs before every /admin request (see `config.matcher` below); the shop is
// never touched.
//
// 1. Keeps the admin's Supabase login fresh: if the short-lived access token
//    has expired, Supabase swaps it for a new one using the refresh token, and
//    the new cookies are written onto the response.
// 2. Sends signed-out visitors to /admin/login, and sends a signed-in admin
//    who opens /admin/login straight to the dashboard.
//
// This is a fast first gate only. The admin layout checks the login again on
// the server before showing anything (see lib/auth.ts).

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

const LOGIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Pass refreshed cookies on to the page being rendered…
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        // …and back to the browser, so it stores them.
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Stop CDNs caching a response that carries someone's login cookies.
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  // Don't put any code between createServerClient and getClaims: getClaims
  // is what triggers the token refresh above.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!isSignedIn && !isLoginPage) return redirectTo(request, LOGIN_PATH, response);
  if (isSignedIn && isLoginPage) return redirectTo(request, "/admin", response);

  return response;
}

/** Redirects while keeping any refreshed login cookies. */
function redirectTo(request: NextRequest, pathname: string, from: NextResponse) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = "";
  const redirect = NextResponse.redirect(target);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  from.headers.forEach((value, name) => {
    if (name.toLowerCase() === "cache-control") redirect.headers.set(name, value);
  });
  return redirect;
}

export const config = {
  // /admin and everything under it. Nothing else.
  matcher: ["/admin/:path*"],
};
