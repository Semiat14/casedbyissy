import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const [mainImage] = product.images;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      {mainImage ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-blush">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-opacity group-hover:opacity-80"
          />
        </div>
      ) : (
        <ImagePlaceholder className="aspect-[3/4] w-full transition-opacity group-hover:opacity-80" />
      )}
      <h3 className="mt-4 text-lg leading-snug md:text-xl">{product.name}</h3>
      <p className="mt-1 text-sm text-foreground/70">{formatPrice(product.price)}</p>
    </Link>
  );
}
