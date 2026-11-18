import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { about } from "@/lib/content";
import { getCollections } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind Cased By Issy — phone cases inspired by art, culture, beauty and feminine aesthetics, created by Issy.",
};

export default async function AboutPage() {
  const collections = await getCollections();
  const { founder } = about;

  return (
    <>
      {/* Story */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Our story</p>
        <div className="mt-5 grid gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
          <h1 className="text-5xl leading-[1.05] md:text-7xl">More than protection.</h1>
          <p className="text-lg leading-relaxed text-foreground/80 md:pt-3 md:text-xl md:leading-relaxed">
            {about.story}
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="border-y border-foreground/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[2fr_3fr] md:items-center md:gap-16 md:px-8 md:py-24">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden bg-blush">
            <Image
              src="/images/issy.jpg"
              alt="Issy, founder of Cased By Issy"
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className="object-cover object-[55%_30%]"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">
              {founder.title}
            </p>
            <h2 className="mt-4 text-4xl leading-[1.1] md:text-5xl">{founder.name}</h2>
            <p className="mt-2 font-heading text-2xl italic text-foreground/70">
              known as {founder.knownAs}
            </p>
            <p className="mt-8 max-w-xl leading-relaxed text-foreground/80">{founder.bio}</p>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
        {/* flex-wrap lets the names flow onto new lines on small screens */}
        {collections.length > 0 && (
          <p className="mb-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-heading text-xl leading-relaxed text-foreground/60 md:text-2xl">
            {collections.map((c, i) => (
              <span key={c.id} className="flex items-center gap-x-3">
                {i > 0 && (
                  <span aria-hidden="true" className="text-base">
                    ✦
                  </span>
                )}
                <span className="whitespace-nowrap">{c.name}</span>
              </span>
            ))}
          </p>
        )}
        <Link
          href="/collections"
          className="inline-block bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
        >
          Explore the collections
        </Link>
      </section>
    </>
  );
}
