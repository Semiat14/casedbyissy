import { Suspense } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { signOut } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

// Every page in this (protected) group requires a signed-in admin.
//
// The proxy already redirects signed-out visitors, but this layout checks
// again on the server: it's the real lock, the proxy is just the fast first gate.
//
// Reading the login cookie is request-time data, so with Cache Components it
// has to happen inside <Suspense>.
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin(); // redirects to /admin/login if not signed in

  return (
    <>
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-5 pt-5 md:px-8 md:pt-6">
          <Link href="/admin" className="min-w-0">
            <span className="block font-heading text-2xl leading-tight tracking-wide">
              Cased By Issy
            </span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-foreground/60">
              Admin
            </span>
          </Link>

          <div className="flex min-w-0 flex-col items-end gap-1 text-right">
            <span className="max-w-[45vw] truncate text-xs text-foreground/60" title={user.email}>
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-60"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-14">
        {children}
      </main>
    </>
  );
}

function AdminLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-xs uppercase tracking-[0.2em] text-foreground/50">
      Loading…
    </div>
  );
}
