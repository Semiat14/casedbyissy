import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import FormMessage from "@/components/admin/FormMessage";
import ProductForm from "@/components/admin/ProductForm";
import {
  getAdminCollections,
  getAdminPhoneModels,
  getAdminProduct,
  groupByBrand,
} from "@/lib/admin-data";
import { deleteProduct } from "../actions";

export const metadata: Metadata = {
  title: "Edit product",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditProductPage({ params }: PageProps) {
  return (
    <div className="max-w-xl">
      <Link
        href="/admin/products"
        className="text-xs uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground"
      >
        ← Products
      </Link>
      <Suspense fallback={<div className="mt-4 h-96" aria-busy="true" />}>
        <EditProduct params={params} />
      </Suspense>
    </div>
  );
}

async function EditProduct({ params }: PageProps) {
  const { id } = await params;
  const [product, collections, models] = await Promise.all([
    getAdminProduct(id),
    getAdminCollections(),
    getAdminPhoneModels(),
  ]);

  if (!product) {
    return (
      <>
        <h1 className="mt-4 text-4xl md:text-5xl">Product not found</h1>
        <p className="mt-4 text-foreground/70">It may have been deleted.</p>
      </>
    );
  }

  if (collections === null || models === null) {
    return (
      <FormMessage status="error" className="mt-8">
        This form couldn&rsquo;t be loaded right now. Please refresh the page in a moment.
      </FormMessage>
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-4xl md:text-5xl">{product.name}</h1>
        {product.isActive ? (
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-60"
          >
            View on shop ↗
          </a>
        ) : (
          <span className="text-xs uppercase tracking-[0.15em] text-foreground/50">
            Hidden from the shop
          </span>
        )}
      </div>

      <div className="mt-8">
        <ProductForm
          product={product}
          collections={collections.map((c) => ({ id: c.id, name: c.name }))}
          phoneModelGroups={groupByBrand(models)}
        />
      </div>

      <section className="mt-16 border-t border-foreground/10 pt-8">
        <h2 className="text-2xl">Delete product</h2>
        <p className="mt-2 mb-5 text-sm text-foreground/65">
          To take it off the shop for now, switch off &ldquo;Visible&rdquo; instead.
        </p>
        <ConfirmDeleteButton
          action={deleteProduct.bind(null, product.id)}
          label="Delete product"
          warning={
            <>
              This removes &ldquo;{product.name}&rdquo;
              {product.images.length > 0 &&
                ` and its ${product.images.length === 1 ? "photo" : `${product.images.length} photos`}`}{" "}
              for good. Its link will stop working. This can&rsquo;t be undone.
            </>
          }
        />
      </section>
    </>
  );
}
