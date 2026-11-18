// The cart's single source of truth, kept in sync with localStorage.
//
// React reads it through useSyncExternalStore (see CartProvider). That hook
// lets the server render, and the browser's first render, both use an empty
// cart, and only then switch to the saved one. Both renders produce
// identical HTML, so there is no hydration mismatch.

import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "casedbyissy:cart:v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] | null = null; // null = not read from storage yet
const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productId === "string" &&
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.collectionName === "string" &&
    typeof v.phoneModelId === "string" &&
    typeof v.phoneModelName === "string" &&
    typeof v.unitPrice === "number" &&
    typeof v.quantity === "number" &&
    v.quantity > 0
  );
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    // Ignore anything that doesn't look like a cart (old format, hand-edited, etc.).
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY;
  } catch {
    // Storage blocked (e.g. some private modes) or corrupted JSON: start empty.
    return EMPTY;
  }
}

function writeStorage(next: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the cart still works for this visit.
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSnapshot(): CartItem[] {
  if (items === null) items = readStorage();
  return items;
}

export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Keep several open tabs in step: another tab changed the cart.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    items = readStorage();
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setItems(update: (current: CartItem[]) => CartItem[]) {
  items = update(getSnapshot());
  writeStorage(items);
  emit();
}

export function lineId(item: Pick<CartItem, "productId" | "phoneModelId">): string {
  return `${item.productId}:${item.phoneModelId}`;
}
