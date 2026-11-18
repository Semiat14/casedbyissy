import type { Metadata } from "next";
import Link from "next/link";
import CollectionForm from "@/components/admin/CollectionForm";

export const metadata: Metadata = {
  title: "New collection",
};

export default function NewCollectionPage() {
  return (
    <div className="max-w-xl">
      <Link
        href="/admin/collections"
        className="text-xs uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground"
      >
        ← Collections
      </Link>
      <h1 className="mt-4 text-4xl md:text-5xl">New collection</h1>
      <div className="mt-8">
        <CollectionForm />
      </div>
    </div>
  );
}
