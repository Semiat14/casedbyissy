import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    // Pages set a short title like "About"; this turns it into "About · Cased By Issy".
    template: "%s · Cased By Issy",
    // Used by any page that doesn't set its own title.
    default: "Cased By Issy",
  },
  description: "Handpicked phone cases that feel like you.",
};

// The root layout only sets up the document, fonts and global styles.
// The shop frame lives in app/(shop)/layout.tsx; the admin frame in app/admin/layout.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
