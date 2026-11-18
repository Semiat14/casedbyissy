import Link from "next/link";
import Image from "next/image";

// On phones: a smaller headline, tighter spacing and a shorter image, so the
// whole hero (text, button and a good slice of the picture) fits the first screen.
// On desktop: text and image side by side, as before.
export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 pt-10 pb-12 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
      <div>
        <h1 className="text-[2.75rem] leading-[1.05] md:text-7xl">More than protection.</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75 md:mt-6 md:text-lg">
          Phone cases designed to express your style — inspired by art, culture,
          beauty and feminine aesthetics.
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-block bg-foreground px-7 py-3.5 text-xs uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85 md:mt-8 md:px-8 md:py-4 md:text-sm"
        >
          Shop collections
        </Link>
      </div>

      {/* Placeholder illustration until Issy's own hero photo arrives:
          replace public/images/hero.svg (or point src at the new photo).
          Shorter crop on phones (4:3), full portrait on desktop (4:5). */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-blush md:aspect-[4/5]">
        <Image
          src="/images/hero.svg"
          alt="Cased By Issy phone cases"
          fill
          priority
          unoptimized
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[50%_60%]"
        />
      </div>
    </section>
  );
}
