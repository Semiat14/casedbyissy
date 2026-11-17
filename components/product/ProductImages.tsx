import ImagePlaceholder from "@/components/ImagePlaceholder";

type ProductImagesProps = {
  images: string[];
  alt: string;
};

// Shows the main image large, with any extra images in a row beneath it.
// With no images yet, it shows the placeholder. When real images arrive from
// Supabase Storage, switch <img> to next/image and add the storage host to
// images.remotePatterns in next.config.ts.
export default function ProductImages({ images, alt }: ProductImagesProps) {
  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-[4/5] w-full" />;
  }

  const [main, ...rest] = images;

  return (
    <div className="flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={main} alt={alt} className="aspect-[4/5] w-full bg-blush object-cover" />
      {rest.length > 0 && (
        <ul className="grid grid-cols-4 gap-3">
          {rest.map((src, i) => (
            <li key={src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} — view ${i + 2}`}
                className="aspect-square w-full bg-blush object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
