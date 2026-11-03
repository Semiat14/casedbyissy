import Link from "next/link";
import { navLinks } from "./navLinks";

const socialLinks = [
  { href: "https://www.instagram.com/casedbyissy_", label: "Instagram" },
  { href: "https://www.snapchat.com/add/isyyy.y", label: "Snapchat" },
  { href: "https://wa.me/2349048333331", label: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 pt-8 pb-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <p className="font-heading text-2xl">Cased By Issy</p>
          <p className="mt-2 text-sm text-foreground/70">
            Phone cases that feel like you.
          </p>
        </div>

        <div className="flex gap-16">
          <ul className="space-y-3 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:opacity-60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="space-y-3 text-sm">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="border-t border-foreground/10 px-5 py-6 text-center text-xs tracking-wide text-foreground/60">
        © 2026 Cased By Issy
      </p>
    </footer>
  );
}
