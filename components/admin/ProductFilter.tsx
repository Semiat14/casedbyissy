"use client";

import { useRouter } from "next/navigation";

/** "Show: All collections / Lace Theory / …" — changes the ?collection= filter. */
export default function ProductFilter({
  collections,
  selected,
}: {
  collections: { id: string; name: string }[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-xs uppercase tracking-[0.15em] text-foreground/65">Show</span>
      <select
        value={selected}
        onChange={(e) =>
          router.push(e.target.value ? `/admin/products?collection=${e.target.value}` : "/admin/products")
        }
        className="min-h-12 border border-foreground/20 bg-white/70 px-4 text-base outline-none focus:border-foreground sm:min-w-64"
      >
        <option value="">All collections</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
