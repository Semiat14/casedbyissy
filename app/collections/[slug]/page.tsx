import { Suspense } from "react";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

// With Cache Components, params is request-time data, so it must be awaited inside <Suspense>.
async function CollectionHeading({ params }: CollectionPageProps) {
  const { slug } = await params;
  return <h1>Collection: {slug}</h1>;
}

export default function CollectionPage({ params }: CollectionPageProps) {
  return (
    <Suspense fallback={null}>
      <CollectionHeading params={params} />
    </Suspense>
  );
}
