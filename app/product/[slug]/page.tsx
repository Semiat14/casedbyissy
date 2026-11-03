import { Suspense } from "react";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// With Cache Components, params is request-time data, so it must be awaited inside <Suspense>.
async function ProductHeading({ params }: ProductPageProps) {
  const { slug } = await params;
  return <h1>Product: {slug}</h1>;
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={null}>
      <ProductHeading params={params} />
    </Suspense>
  );
}
