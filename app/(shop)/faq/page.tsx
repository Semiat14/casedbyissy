import type { Metadata } from "next";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { faq } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about ordering on WhatsApp, payment, delivery and returns at Cased By Issy.",
};

const toId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="text-5xl leading-[1.05] md:text-7xl">Questions, answered.</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
        Everything you need to know about ordering, delivery and returns.
      </p>

      <div className="mt-14 flex flex-col gap-14 md:mt-20 md:gap-20">
        {faq.map((group) => {
          const id = toId(group.title);
          return (
            <section key={group.title} aria-labelledby={id}>
              <h2 id={id} className="text-3xl md:text-4xl">
                {group.title}
              </h2>
              <div className="mt-6 border-t border-foreground/10">
                {group.items.map((item) => (
                  <details key={item.question} className="group border-b border-foreground/10">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
                      <span className="text-base leading-snug md:text-lg">{item.question}</span>
                      {/* "+" turns into "−" by hiding its vertical bar when open. */}
                      <span aria-hidden="true" className="relative mt-1.5 h-3 w-3 shrink-0">
                        <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-foreground" />
                        <span className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-foreground transition-transform duration-300 group-open:scale-y-0" />
                      </span>
                    </summary>
                    <p className="max-w-xl pb-6 leading-relaxed text-foreground/75">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-20 bg-blush px-6 py-12 text-center md:mt-28 md:py-16">
        <h2 className="text-3xl md:text-4xl">Still have a question?</h2>
        <p className="mt-3 text-foreground/75">Send us a message — we&rsquo;re happy to help.</p>
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
        >
          <WhatsAppIcon size={20} />
          Ask on WhatsApp
        </a>
      </div>
    </section>
  );
}
