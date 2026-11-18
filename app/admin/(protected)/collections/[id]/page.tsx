import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import CollectionForm from "@/components/admin/CollectionForm";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { getAdminCollection } from "@/lib/admin-data";
import { deleteCollection } from "../actions";

export const metadata: Metadata = {
  title: "Edit collection",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditCollectionPage({ params }: PageProps) {
  return (
    <div className="max-w-xl">
      <Link
        href="/admin/collections"
        className="text-xs uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground"
      >
        ← Collections
      </Link>
      <Suspense fallback={<div className="mt-4 h-96" aria-busy="true" />}>
        <EditCollection params={params} />
      </Suspense>
    </div>
  );
}

async function EditCollection({ params }: PageProps) {
  const { id } = await params;
  const collection = await getAdminCollection(id);

  if (!collection) {
    return (
      <>
        <h1 className="mt-4 text-4xl md:text-5xl">Collection not found</h1>
        <p className="mt-4 text-foreground/70">It may have been deleted.</p>
      </>
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-4xl md:text-5xl">{collection.name}</h1>
        <a
          href={`/collections/${collection.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-60"
        >
          View on shop ↗
        </a>
      </div>

      <div className="mt-8">
        <CollectionForm collection={collection} />
      </div>

      <section className="mt-16 border-t border-foreground/10 pt-8">
        <h2 className="text-2xl">Delete collection</h2>
        <p className="mt-2 mb-5 text-sm text-foreground/65">
          {collection.productCount > 0
            ? `It has ${collection.productCount} ${collection.productCount === 1 ? "product" : "products"}. Move or delete ${collection.productCount === 1 ? "it" : "them"} first.`
            : "It has no products, so it can be deleted."}
        </p>
        <ConfirmDeleteButton
          action={deleteCollection.bind(null, collection.id)}
          label="Delete collection"
          warning={
            <>
              &ldquo;{collection.name}&rdquo; will be removed from the shop for good, and its
              link will stop working. This can&rsquo;t be undone.
            </>
          }
        />
      </section>
    </>
  );
}
