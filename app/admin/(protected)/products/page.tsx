import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FormMessage from "@/components/admin/FormMessage";
import ProductFilter from "@/components/admin/ProductFilter";
import VisibilityButton from "@/components/admin/VisibilityButton";
import { getAdminCollections, getAdminProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import { setProductVisibility } from "./actions";

export const metadata: Metadata = {
  title: "Products",
};

const SAVED_MESSAGES: Record<string, string> = {
  created: "Product created.",
  updated: "Changes saved. The shop is updated.",
  deleted: "Product and its photos deleted.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminProductsPage({ searchParams }: PageProps) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl md:text-5xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex min-h-12 items-center bg-foreground px-6 text-sm uppercase tracking-[0.15em] text-background hover:opacity-85"
        >
          + New product
        </Link>
      </div>
      <Suspense fallback={<div className="mt-8 h-64" aria-busy="true" />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductsList({ searchParams }: PageProps) {
  const { saved, collection } = await searchParams;
  const filter = typeof collection === "string" ? collection : "";
  const [products, collections] = await Promise.all([
    getAdminProducts(filter || undefined),
    getAdminCollections(),
  ]);
  const savedMessage = typeof saved === "string" ? SAVED_MESSAGES[saved] : undefined;

  if (products === null) {
    return (
      <FormMessage status="error" className="mt-8">
        Products couldn&rsquo;t be loaded right now. Please refresh the page in a moment.
      </FormMessage>
    );
  }

  return (
    <div className="mt-8">
      {savedMessage && (
        <FormMessage status="success" className="mb-6">
          {savedMessage}
        </FormMessage>
      )}

      {(collections?.length ?? 0) > 0 && (
        <ProductFilter
          collections={(collections ?? []).map((c) => ({ id: c.id, name: c.name }))}
          selected={filter}
        />
      )}

      {products.length === 0 ? (
        <div className="mt-6 border border-foreground/10 px-5 py-10 text-center">
          <p className="text-foreground/70">
            {filter ? "No products in this collection yet." : "No products yet."}
          </p>
          <Link
            href={filter ? `/admin/products/new?collection=${filter}` : "/admin/products/new"}
            className="mt-5 inline-flex min-h-12 items-center bg-foreground px-6 text-sm uppercase tracking-[0.15em] text-background hover:opacity-85"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-3 py-3 sm:gap-4">
              <Link
                href={`/admin/products/${product.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-75 sm:gap-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-blush">
                  {product.mainImage ? (
                    <Image
                      src={publicImageUrl(product.mainImage)}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[9px] uppercase tracking-widest text-foreground/40">
                      No photo
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-heading text-lg leading-snug md:text-xl">
                    {product.name}
                  </span>
                  <span className="block truncate text-sm text-foreground/60">
                    {product.collectionName} · {formatPrice(product.price)}
                  </span>
                  <span className="mt-1 flex gap-1.5">
                    {!product.isActive && <Badge>Hidden</Badge>}
                    {product.isFeatured && <Badge>Featured</Badge>}
                  </span>
                </div>
              </Link>

              <VisibilityButton
                visible={product.isActive}
                action={setProductVisibility.bind(null, product.id, product.isActive ? "hide" : "show")}
                productName={product.name}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-foreground/20 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-foreground/70">
      {children}
    </span>
  );
}
