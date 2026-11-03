import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import BrandStory from "@/components/home/BrandStory";
import HowToOrder from "@/components/home/HowToOrder";
import InstagramCta from "@/components/home/InstagramCta";

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
