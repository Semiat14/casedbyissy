"use client";

// The only interactive part of the product page: choosing a phone model and a
// quantity, and adding to the cart. Everything else on the page is rendered
// on the server.

import { useState } from "react";
import Link from "next/link";
import QuantityStepper from "@/components/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import type { PhoneModelWithStock } from "@/lib/types";

type ProductOptionsProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    collectionName: string;
    price: number;
  };
  models: PhoneModelWithStock[];
};

export default function ProductOptions({ product, models }: ProductOptionsProps) {
  const { addItem } = useCart();
  const [modelId, setModelId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const allSoldOut = models.length > 0 && models.every((m) => !m.inStock);
  const selectedModel = models.find((m) => m.id === modelId && m.inStock);

  function chooseModel(id: string) {
    setModelId(id);
    setJustAdded(false);
  }

  function changeQuantity(value: number) {
    setQuantity(value);
    setJustAdded(false);
  }

  function handleAdd() {
    if (!selectedModel) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      collectionName: product.collectionName,
      phoneModelId: selectedModel.id,
      phoneModelName: selectedModel.name,
      unitPrice: product.price,
      quantity,
    });
    setJustAdded(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="text-xs uppercase tracking-[0.15em] text-foreground/60">
          Phone model
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {models.map((model) => {
            const selected = model.id === modelId;
            return (
              <button
                key={model.id}
                type="button"
                disabled={!model.inStock}
                aria-pressed={selected}
                onClick={() => chooseModel(model.id)}
                className={`flex flex-col items-start border px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 hover:border-foreground/50"
                } disabled:cursor-not-allowed disabled:border-foreground/10 disabled:text-foreground/35 disabled:hover:border-foreground/10`}
              >
                <span className={model.inStock ? "" : "line-through"}>{model.name}</span>
                {!model.inStock && (
                  <span className="mt-0.5 text-[11px] uppercase tracking-[0.12em]">Sold out</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">Quantity</p>
        <div className="mt-3">
          <QuantityStepper value={quantity} onChange={changeQuantity} label="Quantity" />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedModel}
          className="w-full bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allSoldOut ? "Sold out" : selectedModel ? "Add to cart" : "Select a model"}
        </button>

        {/* Announced to screen readers when it appears. */}
        <div aria-live="polite" className="mt-4 min-h-6 text-sm">
          {justAdded && (
            <p className="flex flex-wrap items-center justify-between gap-2">
              <span>✓ Added to cart</span>
              <Link
                href="/cart"
                className="uppercase tracking-[0.15em] text-xs underline underline-offset-4 hover:opacity-60"
              >
                View cart
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
