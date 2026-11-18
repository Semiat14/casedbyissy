import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { contact } from "@/lib/content";
import { getCollectionBySlug, getProductsByCollection } from "@/lib/data";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.name,
    description: `${collection.description} Shop the ${collection.name} collection at Cased By Issy.`,
  };
}

// With Cache Components, params is request-time data, so it must be awaited inside <Suspense>.
async function CollectionContent({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getProductsByCollection(collection.id);

  return (
    <>
      <h1 className="text-5xl leading-[1.05] md:text-7xl">{collection.name}</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
        {collection.description}
      </p>

      {products.length > 0 ? (
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-16 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 border-t border-foreground/10 pt-12 md:mt-16">
          <p className="font-heading text-3xl md:text-4xl">New pieces coming soon ✦</p>
          <a
            href={contact.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
          >
            See the latest on Instagram {contact.instagram.handle} →
          </a>
        </div>
      )}
    </>
  );
}

export default function CollectionPage({ params }: CollectionPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <Link
        href="/collections"
        className="text-xs uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
      >
        ← All collections
      </Link>
      <div className="mt-8">
        <Suspense fallback={null}>
          <CollectionContent params={params} />
        </Suspense>
      </div>
    </section>
  );
}
