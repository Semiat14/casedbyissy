import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import FormMessage from "@/components/admin/FormMessage";
import { getAdminCollections, getAdminPhoneModels, groupByBrand } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "New product",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewProductPage({ searchParams }: PageProps) {
  return (
    <div className="max-w-xl">
      <Link
        href="/admin/products"
        className="text-xs uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground"
      >
        ← Products
      </Link>
      <h1 className="mt-4 text-4xl md:text-5xl">New product</h1>
      <Suspense fallback={<div className="mt-8 h-96" aria-busy="true" />}>
        <NewProduct searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NewProduct({ searchParams }: PageProps) {
  const [{ collection }, collections, models] = await Promise.all([
    searchParams,
    getAdminCollections(),
    getAdminPhoneModels(),
  ]);

  if (collections === null || models === null) {
    return (
      <FormMessage status="error" className="mt-8">
        This form couldn&rsquo;t be loaded right now. Please refresh the page in a moment.
      </FormMessage>
    );
  }

  return (
    <div className="mt-8">
      <ProductForm
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
        phoneModelGroups={groupByBrand(models)}
        defaultCollectionId={
          typeof collection === "string" && collections.some((c) => c.id === collection)
            ? collection
            : undefined
        }
      />
    </div>
  );
}
