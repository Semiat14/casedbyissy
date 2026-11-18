import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
      <div>
        <h1 className="text-5xl leading-[1.05] md:text-7xl">More than protection.</h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
          Phone cases designed to express your style — inspired by art, culture,
          beauty and feminine aesthetics.
        </p>
        <Link
          href="/collections"
          className="mt-8 inline-block bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
        >
          Shop collections
        </Link>
      </div>
      {/* Placeholder illustration until Issy's own hero photo arrives:
          replace public/images/hero.svg (or point src at the new photo). */}
      <Image
        src="/images/hero.svg"
        alt="Cased By Issy phone cases"
        width={1600}
        height={2000}
        priority
        unoptimized
        className="aspect-[4/5] h-auto w-full"
      />
    </section>
  );
}
