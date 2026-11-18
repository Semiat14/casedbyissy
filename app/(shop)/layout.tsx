import ShopChrome from "@/components/ShopChrome";

// (shop) is a route group: the folder name in brackets doesn't appear in URLs,
// so app/(shop)/about/page.tsx is still /about. It lets every storefront page
// share this layout while the admin uses its own.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopChrome>{children}</ShopChrome>;
}
