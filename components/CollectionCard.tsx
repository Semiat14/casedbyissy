import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import type { Collection } from "@/lib/types";

export default function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="group block">
      {collection.coverImage ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-blush">
          <Image
            src={collection.coverImage}
            alt={collection.name}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-opacity group-hover:opacity-80"
          />
        </div>
      ) : (
        <ImagePlaceholder className="aspect-[3/4] w-full transition-opacity group-hover:opacity-80" />
      )}
      <h3 className="mt-4 text-xl md:text-2xl">{collection.name}</h3>
      <p className="mt-1 text-sm text-foreground/70">{collection.description}</p>
    </Link>
  );
}
