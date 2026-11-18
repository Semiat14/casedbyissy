"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { navLinks } from "./navLinks";
import { useCart } from "./cart/CartProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const closeMenu = () => setIsOpen(false);

  // Stop the page behind the menu from scrolling while it's open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="relative z-60 border-b border-foreground/10 bg-background">
      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8 md:py-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="font-heading text-2xl tracking-wide md:text-3xl"
        >
          Cased By Issy
        </Link>

        <div className="flex items-center gap-2 md:gap-10">
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/cart"
            onClick={closeMenu}
            aria-label={
              itemCount > 0 ? `Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}` : "Cart"
            }
            className="relative p-2 transition-opacity hover:opacity-60"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] leading-none font-medium text-background tabular-nums"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="p-2 md:hidden"
          >
            {isOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {isOpen && (
        <ul
          id="mobile-menu"
          className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background md:hidden"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={closeMenu}
                className="block py-2 font-heading text-3xl"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
