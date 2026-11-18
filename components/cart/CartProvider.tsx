"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { MAX_QUANTITY } from "@/components/QuantityStepper";
import type { CartItem } from "@/lib/types";
import { getServerSnapshot, getSnapshot, lineId, setItems, subscribe } from "./cartStore";

type CartContextValue = {
  items: CartItem[];
  /** Total number of cases across all lines. */
  itemCount: number;
  /** Whole naira. */
  subtotal: number;
  /**
   * False on the server and during the browser's first render, before the
   * saved cart has been read. Use it to avoid flashing "your cart is empty".
   */
  isReady: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, phoneModelId: string, quantity: number) => void;
  removeItem: (productId: string, phoneModelId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(n)));

// Actions don't depend on React state, so they're defined once, outside the component.
const actions = {
  addItem(item: CartItem) {
    setItems((current) => {
      const id = lineId(item);
      const existing = current.find((line) => lineId(line) === id);
      if (!existing) return [...current, { ...item, quantity: clamp(item.quantity) }];
      // Same product + same phone model: add to the existing line.
      return current.map((line) =>
        lineId(line) === id ? { ...line, quantity: clamp(line.quantity + item.quantity) } : line,
      );
    });
  },
  updateQuantity(productId: string, phoneModelId: string, quantity: number) {
    const id = lineId({ productId, phoneModelId });
    setItems((current) =>
      current.map((line) => (lineId(line) === id ? { ...line, quantity: clamp(quantity) } : line)),
    );
  },
  removeItem(productId: string, phoneModelId: string) {
    const id = lineId({ productId, phoneModelId });
    setItems((current) => current.filter((line) => lineId(line) !== id));
  },
  clearCart() {
    setItems(() => []);
  },
};

// A store that never changes, used only to tell "server/first render" from "after hydration".
const noopSubscribe = () => () => {};

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isReady = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      isReady,
      ...actions,
    }),
    [items, isReady],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>.");
  return context;
}
