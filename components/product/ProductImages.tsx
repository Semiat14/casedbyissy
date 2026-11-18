"use client";

import { useState } from "react";
import Image from "next/image";
import ImagePlaceholder from "@/components/ImagePlaceholder";

type ProductImagesProps = {
  images: string[];
  alt: string;
};

// The main photo large, with every photo as a thumbnail underneath; tapping a
// thumbnail shows it as the main photo. With no photos, the placeholder.
export default function ProductImages({ images, alt }: ProductImagesProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-[4/5] w-full" />;
  }

  const current = Math.min(selected, images.length - 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-blush">
        <Image
          key={images[current]}
          src={images[current]}
          alt={images.length > 1 ? `${alt} — photo ${current + 1} of ${images.length}` : alt}
          fill
          priority={current === 0}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                className={`relative block aspect-square w-full overflow-hidden bg-blush transition-opacity ${
                  i === current
                    ? "outline outline-1 outline-offset-2 outline-foreground"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="(min-width: 768px) 10vw, 25vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
