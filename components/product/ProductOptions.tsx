"use client";

// The only interactive part of the product page: choosing a phone model and a
// quantity. Everything else on the page is rendered on the server.

import { useState } from "react";
import type { PhoneModelWithStock } from "@/lib/types";

const MAX_QUANTITY = 10;

export default function ProductOptions({ models }: { models: PhoneModelWithStock[] }) {
  const [modelId, setModelId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const allSoldOut = models.length > 0 && models.every((m) => !m.inStock);

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
                onClick={() => setModelId(model.id)}
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
        <span id="quantity-label" className="text-xs uppercase tracking-[0.15em] text-foreground/60">
          Quantity
        </span>
        <div
          role="group"
          aria-labelledby="quantity-label"
          className="mt-3 inline-flex items-center border border-foreground/15"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="h-11 w-11 text-lg disabled:text-foreground/25"
          >
            −
          </button>
          <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            disabled={quantity >= MAX_QUANTITY}
            className="h-11 w-11 text-lg disabled:text-foreground/25"
          >
            +
          </button>
        </div>
      </div>

      {/* Not wired up yet — the cart comes in a later step. */}
      <button
        type="button"
        disabled={!modelId}
        className="w-full bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {allSoldOut ? "Sold out" : modelId ? "Add to cart" : "Select a model"}
      </button>
    </div>
  );
}
