import { collections } from "@/lib/collections";

function MarqueeRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {collections.map((collection) => (
        <li key={collection.slug} className="flex items-center">
          <span className="px-6 font-heading text-lg">{collection.name}</span>
          <span aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-foreground/10 py-3">
      {/* Two identical rows slide left together; when the first has moved fully out, the loop restarts seamlessly. */}
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  );
}
