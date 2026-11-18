import type { Metadata } from "next";

// The frame for everything under /admin, including the login page.
// No shop navbar or footer. Login protection is in (protected)/layout.tsx.
export const metadata: Metadata = {
  title: {
    template: "%s · Admin · Cased By Issy",
    default: "Admin · Cased By Issy",
  },
  // Keep the admin out of search engines.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-background">{children}</div>;
}
