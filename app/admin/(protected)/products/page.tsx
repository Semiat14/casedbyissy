import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl">Products</h1>
      <p className="mt-4 text-foreground/65">Coming next.</p>
    </>
  );
}
