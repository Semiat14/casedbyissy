import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";

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
      <ImagePlaceholder className="aspect-[4/5] w-full" />
    </section>
  );
}
