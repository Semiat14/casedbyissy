import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartProvider from "@/components/cart/CartProvider";

// The storefront frame: cart, navbar, footer and the floating WhatsApp button.
// Used by app/(shop)/layout.tsx, and by app/not-found.tsx so unknown URLs
// still look like the shop.
export default function ShopChrome({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </CartProvider>
  );
}
