"use client";

import Link from "next/link";
import QuantityStepper from "@/components/QuantityStepper";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import OrderForm from "./OrderForm";

export default function CartView() {
  const { items, subtotal, isReady, updateQuantity, removeItem } = useCart();

  // Before the saved cart is read, render a quiet placeholder rather than
  // briefly flashing the "empty" message.
  if (!isReady) return <div className="mt-12 min-h-64" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="mt-12 max-w-md">
        <p className="text-base leading-relaxed text-foreground/75 md:text-lg">
          Your cart is empty for now. Find a case that feels like you.
        </p>
        <Link
          href="/collections"
          className="mt-8 inline-block bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
        >
          Browse collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-14 md:mt-16 md:grid-cols-[1fr_minmax(0,380px)] md:gap-16">
      <div>
        <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
          {items.map((item) => (
            <li
              key={`${item.productId}:${item.phoneModelId}`}
              className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">
                  {item.collectionName}
                </p>
                <Link
                  href={`/product/${item.slug}`}
                  className="mt-1 block font-heading text-xl leading-snug hover:opacity-70 md:text-2xl"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-foreground/70">{item.phoneModelName}</p>
                <p className="mt-1 text-sm text-foreground/70">
                  {formatPrice(item.unitPrice)} each
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                <QuantityStepper
                  size="sm"
                  value={item.quantity}
                  onChange={(q) => updateQuantity(item.productId, item.phoneModelId, q)}
                  label={`Quantity for ${item.name}, ${item.phoneModelName}`}
                />
                <div className="flex items-center gap-5">
                  <span className="text-sm tabular-nums">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.phoneModelId)}
                    aria-label={`Remove ${item.name}, ${item.phoneModelName}`}
                    className="text-xs uppercase tracking-[0.15em] text-foreground/60 underline underline-offset-4 hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-[0.15em] text-foreground/60">Subtotal</span>
          <span className="font-heading text-3xl tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-right text-sm text-foreground/60">
          Delivery fee confirmed on WhatsApp.
        </p>
      </div>

      <OrderForm />
    </div>
  );
}
