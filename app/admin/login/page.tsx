import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

// Outside the (protected) group, so signed-out visitors can reach it.
// A signed-in admin who opens it is sent to /admin by the proxy.
export default function AdminLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-heading text-3xl tracking-wide">
          Cased By Issy
        </Link>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.2em] text-foreground/60">
          Admin
        </p>

        <div className="mt-10 border border-foreground/10 bg-white/60 px-6 py-8">
          <h1 className="text-3xl">Sign in</h1>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Forgot your password? Ask Semiat to reset it.
        </p>
      </div>
    </div>
  );
}
