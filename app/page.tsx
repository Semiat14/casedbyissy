import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import BrandStory from "@/components/home/BrandStory";
import HowToOrder from "@/components/home/HowToOrder";
import InstagramCta from "@/components/home/InstagramCta";

// The layout's title template doesn't apply to the homepage (same route
// segment as the layout), so the full title is set here with `absolute`.
export const metadata: Metadata = {
  title: { absolute: "Cased By Issy · Phone cases that feel like you" },
  description:
    "Phone cases designed to express your style — inspired by art, culture, beauty and feminine aesthetics. Order easily on WhatsApp.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <CollectionsGrid />
      <BrandStory />
      <HowToOrder />
      <InstagramCta />
    </>
  );
}
