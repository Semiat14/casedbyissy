import type { Metadata } from "next";
import CollectionCard from "@/components/CollectionCard";
import { getCollections } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse every Cased By Issy collection — from Persian Princess to Ambelle.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="text-5xl leading-[1.05] md:text-7xl">Collections</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
        Each collection tells its own story. Find the one that feels like you.
      </p>
      {collections.length > 0 ? (
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-16 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
          {collections.map((collection) => (
            <li key={collection.id}>
              <CollectionCard collection={collection} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-12 border-t border-foreground/10 pt-12 font-heading text-3xl md:mt-16 md:text-4xl">
          New collections coming soon ✦
        </p>
      )}
    </section>
  );
}
