import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center md:py-32">
      <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Page not found</p>
      <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">This one slipped away.</h1>
      <p className="mt-6 leading-relaxed text-foreground/75">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Our collections
        are still right where we left them.
      </p>
      <Link
        href="/collections"
        className="mt-10 inline-block bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
      >
        Browse collections
      </Link>
    </section>
  );
}
