import type { Collection } from "@/lib/types";
import { getCollections } from "@/lib/data";

function MarqueeRow({
  collections,
  hidden = false,
}: {
  collections: Collection[];
  hidden?: boolean;
}) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {collections.map((collection) => (
        <li key={collection.id} className="flex items-center">
          <span className="px-6 font-heading text-lg">{collection.name}</span>
          <span aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );
}

export default async function Marquee() {
  const collections = await getCollections();
  if (collections.length === 0) return null; // hide the strip until there's something to show

  return (
    <div className="overflow-hidden border-y border-foreground/10 py-3">
      {/* Two identical rows slide left together; when the first has moved fully out, the loop restarts seamlessly. */}
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <MarqueeRow collections={collections} />
        <MarqueeRow collections={collections} hidden />
      </div>
    </div>
  );
}
