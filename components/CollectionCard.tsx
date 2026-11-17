import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import type { Collection } from "@/lib/types";

export default function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="group block">
      <ImagePlaceholder className="aspect-[3/4] w-full transition-opacity group-hover:opacity-80" />
      <h3 className="mt-4 text-xl md:text-2xl">{collection.name}</h3>
      <p className="mt-1 text-sm text-foreground/70">{collection.description}</p>
    </Link>
  );
}
