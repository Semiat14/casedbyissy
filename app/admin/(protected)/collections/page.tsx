import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import FormMessage from "@/components/admin/FormMessage";
import MoveButtons from "@/components/admin/MoveButtons";
import { getAdminCollections } from "@/lib/admin-data";
import { moveCollection } from "./actions";

export const metadata: Metadata = {
  title: "Collections",
};

const SAVED_MESSAGES: Record<string, string> = {
  created: "Collection created. It's live in the shop.",
  updated: "Changes saved. The shop is updated.",
  deleted: "Collection deleted.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminCollectionsPage({ searchParams }: PageProps) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl md:text-5xl">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="flex min-h-12 items-center bg-foreground px-6 text-sm uppercase tracking-[0.15em] text-background hover:opacity-85"
        >
          + New collection
        </Link>
      </div>

      <Suspense fallback={<ListLoading />}>
        <CollectionsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CollectionsList({ searchParams }: PageProps) {
  const [{ saved }, collections] = await Promise.all([searchParams, getAdminCollections()]);
  const savedMessage = typeof saved === "string" ? SAVED_MESSAGES[saved] : undefined;

  return (
    <div className="mt-8">
      {savedMessage && (
        <FormMessage status="success" className="mb-6">
          {savedMessage}
        </FormMessage>
      )}

      {collections === null ? (
        <FormMessage status="error">
          Collections couldn&rsquo;t be loaded right now. Please refresh the page in a moment.
        </FormMessage>
      ) : collections.length === 0 ? (
        <p className="border border-foreground/10 px-5 py-8 text-center text-foreground/70">
          No collections yet. Tap &ldquo;New collection&rdquo; to add your first one.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-foreground/60">
            Use the arrows to change the order collections appear in the shop.
          </p>
          <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
            {collections.map((collection, index) => (
              <li key={collection.id} className="flex items-center gap-3 py-4">
                <MoveButtons
                  moveUp={moveCollection.bind(null, collection.id, "up")}
                  moveDown={moveCollection.bind(null, collection.id, "down")}
                  isFirst={index === 0}
                  isLast={index === collections.length - 1}
                  itemLabel={collection.name}
                />

                <Link
                  href={`/admin/collections/${collection.id}`}
                  className="min-w-0 flex-1 py-1 hover:opacity-70"
                >
                  <span className="block truncate font-heading text-xl leading-snug md:text-2xl">
                    {collection.name}
                  </span>
                  <span className="block truncate text-sm text-foreground/60">
                    /{collection.slug} · {collection.productCount}{" "}
                    {collection.productCount === 1 ? "product" : "products"}
                  </span>
                </Link>

                <div className="flex shrink-0 flex-col items-end gap-1 text-xs uppercase tracking-[0.12em] sm:flex-row sm:gap-5">
                  <Link
                    href={`/admin/collections/${collection.id}`}
                    className="flex min-h-11 items-center underline underline-offset-4 hover:opacity-60"
                  >
                    Edit
                  </Link>
                  <a
                    href={`/collections/${collection.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden min-h-11 items-center text-foreground/60 hover:text-foreground sm:flex"
                  >
                    View ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ListLoading() {
  return (
    <ul className="mt-8 divide-y divide-foreground/10 border-y border-foreground/10" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-20" />
      ))}
    </ul>
  );
}
