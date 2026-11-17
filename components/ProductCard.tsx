import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <ImagePlaceholder className="aspect-[3/4] w-full transition-opacity group-hover:opacity-80" />
      <h3 className="mt-4 text-lg leading-snug md:text-xl">{product.name}</h3>
      <p className="mt-1 text-sm text-foreground/70">{formatPrice(product.price)}</p>
    </Link>
  );
}
