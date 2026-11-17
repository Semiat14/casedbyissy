// PLACEHOLDER DATA — replace with Supabase
//
// Nothing outside lib/data.ts should import this file.

import type { Collection, PhoneModel, Product, ProductPhoneModel } from "./types";

export const collections: Collection[] = [
  {
    id: "col-1",
    name: "Persian Princess",
    slug: "persian-princess",
    description: "Ornate patterns with a regal touch.",
    coverImage: null,
  },
  {
    id: "col-2",
    name: "Persian Princess 2.0",
    slug: "persian-princess-2",
    description: "The original, reimagined.",
    coverImage: null,
  },
  {
    id: "col-3",
    name: "Lace Theory",
    slug: "lace-theory",
    description: "Delicate lace, softly romantic.",
    coverImage: null,
  },
  {
    id: "col-4",
    name: "Hijabi Bloom",
    slug: "hijabi-bloom",
    description: "Modest, floral and graceful.",
    coverImage: null,
  },
  {
    id: "col-5",
    name: "Leopelle",
    slug: "leopelle",
    description: "Bold prints with quiet confidence.",
    coverImage: null,
  },
  {
    id: "col-6",
    name: "Ambelle",
    slug: "ambelle",
    description: "Warm tones, timeless beauty.",
    coverImage: null,
  },
];

export const phoneModels: PhoneModel[] = [
  { id: "pm-1", brand: "iPhone", name: "iPhone 15" },
  { id: "pm-2", brand: "iPhone", name: "iPhone 15 Pro Max" },
  { id: "pm-3", brand: "iPhone", name: "iPhone 16" },
  { id: "pm-4", brand: "iPhone", name: "iPhone 16 Pro Max" },
  { id: "pm-5", brand: "Samsung", name: "Galaxy S24" },
  { id: "pm-6", brand: "Samsung", name: "Galaxy S24 Ultra" },
];

const sampleDescription =
  "Placeholder description. The real product copy will go here — what it's made of, how it feels in the hand, and what inspired the design.";

function sample(
  id: string,
  collectionId: string,
  collectionName: string,
  collectionSlug: string,
  n: number,
  price: number,
  isFeatured = false,
): Product {
  return {
    id,
    collectionId,
    name: `${collectionName} — Sample ${n}`,
    slug: `${collectionSlug}-sample-${n}`,
    description: sampleDescription,
    price,
    images: [],
    isFeatured,
    isActive: true,
  };
}

export const products: Product[] = [
  sample("prod-1", "col-1", "Persian Princess", "persian-princess", 1, 15000, true),
  sample("prod-2", "col-1", "Persian Princess", "persian-princess", 2, 15000),
  sample("prod-3", "col-1", "Persian Princess", "persian-princess", 3, 17500),

  sample("prod-4", "col-2", "Persian Princess 2.0", "persian-princess-2", 1, 18000, true),
  sample("prod-5", "col-2", "Persian Princess 2.0", "persian-princess-2", 2, 18000),

  sample("prod-6", "col-3", "Lace Theory", "lace-theory", 1, 16000, true),
  sample("prod-7", "col-3", "Lace Theory", "lace-theory", 2, 16000),
  sample("prod-8", "col-3", "Lace Theory", "lace-theory", 3, 16500),

  sample("prod-9", "col-4", "Hijabi Bloom", "hijabi-bloom", 1, 14000),
  sample("prod-10", "col-4", "Hijabi Bloom", "hijabi-bloom", 2, 14500, true),

  sample("prod-11", "col-5", "Leopelle", "leopelle", 1, 17000, true),
  sample("prod-12", "col-5", "Leopelle", "leopelle", 2, 17000),
  sample("prod-13", "col-5", "Leopelle", "leopelle", 3, 19000),

  sample("prod-14", "col-6", "Ambelle", "ambelle", 1, 15500),
  sample("prod-15", "col-6", "Ambelle", "ambelle", 2, 15500, true),
];

// Which models each product is made for. Models listed in `soldOut` are
// still offered but currently out of stock.
const soldOut: Record<string, string[]> = {
  "prod-1": ["pm-2"],
  "prod-3": ["pm-5", "pm-6"],
  "prod-4": ["pm-4"],
  "prod-6": ["pm-1"],
  "prod-8": ["pm-3", "pm-6"],
  "prod-10": ["pm-2"],
  "prod-11": ["pm-5"],
  "prod-14": ["pm-4", "pm-6"],
};

export const productPhoneModels: ProductPhoneModel[] = products.flatMap((product) =>
  phoneModels.map((model) => ({
    productId: product.id,
    phoneModelId: model.id,
    inStock: !soldOut[product.id]?.includes(model.id),
  })),
);
