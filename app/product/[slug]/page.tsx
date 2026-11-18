import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImages from "@/components/product/ProductImages";
import ProductOptions from "@/components/product/ProductOptions";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getCollectionById, getPhoneModelsForProduct, getProductBySlug } from "@/lib/data";
import { formatPrice } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.name} — ${formatPrice(product.price)}. ${product.description}`,
  };
}

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
            {models.length > 0 ? (
              <ProductOptions
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  collectionName: collection?.name ?? "",
                  price: product.price,
                }}
                models={models}
              />
            ) : (
              <div>
                <p className="leading-relaxed text-foreground/75">
                  Message us on WhatsApp to check availability for your phone.
                </p>
                <a
                  href={buildWhatsAppUrl(
                    `Hi Issy! 💕 Is ${product.name} available for my phone? My phone is: `,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-3 bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
                >
                  <WhatsAppIcon size={20} />
                  Ask on WhatsApp
                </a>
              </div>
            )}
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
