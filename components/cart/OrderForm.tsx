"use client";

import WhatsAppIcon from "@/components/WhatsAppIcon";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";

const fieldClass =
  "mt-2 w-full border border-foreground/15 bg-transparent px-4 py-3 text-base outline-none transition-colors placeholder:text-foreground/35 focus:border-foreground";
const labelClass = "text-xs uppercase tracking-[0.15em] text-foreground/60";

export default function OrderForm() {
  const { items, subtotal } = useCart();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // The browser has already checked the required fields before this runs.
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "");

    const message = buildOrderMessage(items, subtotal, {
      fullName: field("fullName"),
      phone: field("phone"),
      delivery: field("delivery"),
      note: field("note"),
    });

    // The cart is deliberately kept, in case WhatsApp didn't open or they want to change something.
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl">Your details</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          We&rsquo;ll send your order to Issy on WhatsApp to confirm delivery and payment.
        </p>
      </div>

      <label className="block">
        <span className={labelClass}>Full name</span>
        <input name="fullName" required autoComplete="name" className={fieldClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Phone number</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="e.g. 0803 000 0000"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Delivery address or area</span>
        <textarea
          name="delivery"
          required
          rows={2}
          autoComplete="street-address"
          className={`${fieldClass} resize-y`}
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          Note <span className="normal-case tracking-normal">(optional)</span>
        </span>
        <textarea name="note" rows={2} className={`${fieldClass} resize-y`} />
      </label>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
      >
        <WhatsAppIcon size={20} />
        Order on WhatsApp
      </button>
    </form>
  );
}
