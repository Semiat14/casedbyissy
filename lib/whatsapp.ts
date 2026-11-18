import { formatPrice } from "./format";
import type { CartItem } from "./types";

/** Issy's WhatsApp number in international format, without "+" or spaces. */
export const WHATSAPP_NUMBER = "2349048333331";

export type OrderDetails = {
  fullName: string;
  phone: string;
  delivery: string;
  note: string;
};

/** The order as a friendly, readable WhatsApp message. */
export function buildOrderMessage(
  items: CartItem[],
  subtotal: number,
  details: OrderDetails,
): string {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. ${item.name} — ${item.phoneModelName} × ${item.quantity} — ${formatPrice(
        item.unitPrice * item.quantity,
      )}`,
  );

  const note = details.note.trim();

  return [
    "Hi Issy! 💕 I'd like to order:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    `Name: ${details.fullName.trim()}`,
    `Phone: ${details.phone.trim()}`,
    `Delivery: ${details.delivery.trim()}`,
    ...(note ? [`Note: ${note}`] : []),
  ].join("\n");
}

/** A wa.me link that opens a chat with Issy, with `message` pre-typed. */
export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
