import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your Cased By Issy cart and send your order on WhatsApp.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="text-5xl leading-[1.05] md:text-7xl">Your cart</h1>
      <CartView />
    </section>
  );
}
