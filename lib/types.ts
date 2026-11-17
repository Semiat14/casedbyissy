// Shapes of the data the site works with. These mirror the future Supabase
// tables, so pages written against them won't change when the data source does.

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
};

export type PhoneModel = {
  id: string;
  brand: string;
  name: string;
};

export type Product = {
  id: string;
  collectionId: string;
  name: string;
  slug: string;
  description: string;
  /** Whole naira, e.g. 15000 = ₦15,000. */
  price: number;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
};

/** Join table: which phone models a product is made for, and whether each is in stock. */
export type ProductPhoneModel = {
  productId: string;
  phoneModelId: string;
  inStock: boolean;
};

/** A phone model as offered for one specific product. */
export type PhoneModelWithStock = PhoneModel & {
  inStock: boolean;
};
