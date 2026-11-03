import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { collections } from "@/lib/collections";

export default function CollectionsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <h2 className="text-4xl md:text-5xl">The collections</h2>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link href={`/collections/${collection.slug}`} className="group block">
              <ImagePlaceholder className="aspect-[3/4] w-full transition-opacity group-hover:opacity-80" />
              <h3 className="mt-4 text-xl md:text-2xl">{collection.name}</h3>
              <p className="mt-1 text-sm text-foreground/70">{collection.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
