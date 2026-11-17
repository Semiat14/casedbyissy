import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImages from "@/components/product/ProductImages";
import ProductOptions from "@/components/product/ProductOptions";
import { getCollectionById, getPhoneModelsForProduct, getProductBySlug } from "@/lib/data";
import { formatPrice } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// With Cache Components, params is request-time data, so it must be awaited inside <Suspense>.
async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [collection, models] = await Promise.all([
    getCollectionById(product.collectionId),
    getPhoneModelsForProduct(product.id),
  ]);

  return (
    <>
      {collection && (
        <Link
          href={`/collections/${collection.slug}`}
          className="text-xs uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
        >
          ← Back to {collection.name}
        </Link>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductImages images={product.images} alt={product.name} />

        <div className="md:pt-4">
          <h1 className="text-4xl leading-[1.1] md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg">{formatPrice(product.price)}</p>
          <p className="mt-6 max-w-md leading-relaxed text-foreground/75">{product.description}</p>

          <div className="mt-10 border-t border-foreground/10 pt-10">
            <ProductOptions models={models} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <Suspense fallback={null}>
        <ProductContent params={params} />
      </Suspense>
    </section>
  );
}
