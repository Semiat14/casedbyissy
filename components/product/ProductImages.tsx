import Image from "next/image";
import ImagePlaceholder from "@/components/ImagePlaceholder";

type ProductImagesProps = {
  images: string[];
  alt: string;
};

// Shows the main image large, with any extra images in a row beneath it.
// With no images, it shows the placeholder.
export default function ProductImages({ images, alt }: ProductImagesProps) {
  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-[4/5] w-full" />;
  }

  const [main, ...rest] = images;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-blush">
        <Image
          src={main}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {rest.length > 0 && (
        <ul className="grid grid-cols-4 gap-3">
          {rest.map((src, i) => (
            <li key={src} className="relative aspect-square overflow-hidden bg-blush">
              <Image
                src={src}
                alt={`${alt} — view ${i + 2}`}
                fill
                sizes="(min-width: 768px) 12vw, 25vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
