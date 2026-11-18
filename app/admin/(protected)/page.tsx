import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogCounts } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl">Dashboard</h1>
      <Suspense fallback={<CountsLoading />}>
        <Counts />
      </Suspense>

      <h2 className="mt-14 text-2xl md:text-3xl">Quick links</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/admin/collections/new", label: "Add a collection" },
          { href: "/admin/phone-models", label: "Add phone models" },
          { href: "/admin/products", label: "Manage products" },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between border border-foreground/15 px-5 py-4 transition-colors hover:border-foreground/50"
            >
              {link.label}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
        <li>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-foreground/15 px-5 py-4 transition-colors hover:border-foreground/50"
          >
            View the shop
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </>
  );
}

async function Counts() {
  const counts = await getCatalogCounts();

  if (!counts) {
    return (
      <p className="mt-8 border border-foreground/15 px-5 py-4 text-sm text-foreground/75">
        The numbers couldn&rsquo;t be loaded right now. Please refresh the page in a moment.
      </p>
    );
  }

  const cards = [
    {
      label: "Collections",
      value: counts.collections,
      href: "/admin/collections",
      empty: "No collections yet. Add your first one.",
    },
    {
      label: "Products",
      value: counts.products,
      href: "/admin/products",
      empty: "No products yet. Add your first case.",
      note: counts.hiddenProducts > 0 ? `${counts.hiddenProducts} hidden from the shop` : null,
    },
    {
      label: "Phone models",
      value: counts.phoneModels,
      href: "/admin/phone-models",
      empty: "No phone models yet. Add the models you make cases for.",
    },
  ];

  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <li key={card.label}>
          <Link
            href={card.href}
            className="block h-full border border-foreground/10 bg-white/60 px-5 py-5 transition-colors hover:border-foreground/40"
          >
            <span className="block text-xs uppercase tracking-[0.15em] text-foreground/60">
              {card.label}
            </span>
            <span className="mt-2 block font-heading text-5xl tabular-nums">{card.value}</span>
            {card.value === 0 ? (
              <span className="mt-2 block text-sm text-foreground/65">{card.empty}</span>
            ) : (
              card.note && (
                <span className="mt-2 block text-sm text-foreground/65">{card.note}</span>
              )
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CountsLoading() {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-32 border border-foreground/10 bg-white/40" />
      ))}
    </ul>
  );
}
