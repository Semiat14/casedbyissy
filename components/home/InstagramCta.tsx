import { contact } from "@/lib/content";

export default function InstagramCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 text-center md:px-8 md:pb-28">
      <a
        href={contact.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-block"
      >
        <span className="font-heading text-3xl md:text-4xl">
          See the latest drops on Instagram
        </span>
        <span className="mt-3 block text-sm uppercase tracking-[0.15em] text-foreground/60 transition-colors group-hover:text-foreground">
          {contact.instagram.handle} →
        </span>
      </a>
    </section>
  );
}
