import type { Metadata } from "next";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { contact } from "@/lib/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Cased By Issy on WhatsApp, Instagram or Snapchat to order or ask a question.",
};

const cards = [
  {
    label: "WhatsApp",
    detail: "Fastest way to order or ask a question",
    href: buildWhatsAppUrl(),
    primary: true,
  },
  {
    label: "Instagram",
    detail: contact.instagram.handle,
    href: contact.instagram.url,
    primary: false,
  },
  {
    label: "Snapchat",
    detail: contact.snapchat.handle,
    href: contact.snapchat.url,
    primary: false,
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="text-5xl leading-[1.05] md:text-7xl">Say hello.</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
        {contact.intro}
      </p>

      <ul className="mt-12 flex flex-col gap-4 md:mt-16">
        {cards.map((card) => (
          <li key={card.label}>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between gap-6 px-6 py-7 transition-opacity md:px-10 md:py-9 ${
                card.primary
                  ? "bg-foreground text-background hover:opacity-90"
                  : "border border-foreground/15 hover:border-foreground/50"
              }`}
            >
              <span className="flex items-center gap-5">
                {card.primary && <WhatsAppIcon size={28} />}
                <span>
                  <span className="block font-heading text-3xl md:text-4xl">{card.label}</span>
                  <span
                    className={`mt-1 block text-sm ${
                      card.primary ? "text-background/75" : "text-foreground/65"
                    }`}
                  >
                    {card.detail}
                  </span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-xl transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
