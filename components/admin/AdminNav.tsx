"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/phone-models", label: "Phone models" },
];

// Client component only so it can highlight the current page.
export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className="flex gap-6 whitespace-nowrap pt-5">
        {adminLinks.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 pb-3 text-sm transition-colors ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
