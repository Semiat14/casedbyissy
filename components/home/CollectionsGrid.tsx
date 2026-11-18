import CollectionCard from "@/components/CollectionCard";
import { getCollections } from "@/lib/data";

export default async function CollectionsGrid() {
  const collections = await getCollections();
  if (collections.length === 0) return null; // hide the section until there's something to show

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <h2 className="text-4xl md:text-5xl">The collections</h2>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </section>
  );
}
