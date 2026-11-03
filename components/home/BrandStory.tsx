import Link from "next/link";

export default function BrandStory() {
  return (
    <section className="bg-blush">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <p className="font-heading text-3xl leading-snug md:text-4xl">
          Cased By Issy is a phone case brand built around creativity, femininity,
          elegance and self-expression.
        </p>
        <Link
          href="/about"
          className="mt-8 inline-block border-b border-foreground pb-1 text-sm uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
        >
          Our story
        </Link>
      </div>
    </section>
  );
}
