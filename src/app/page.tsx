import { AppointmentBanner } from "@/components/home/appointment-banner";
import { CategoryGrid } from "@/components/home/category-grid";
import { EditorialStory } from "@/components/home/editorial-story";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { GiftEdit } from "@/components/home/gift-edit";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { ServicesStrip } from "@/components/home/services-strip";

export default function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <FeaturedCollections />
      <CategoryGrid />
      <EditorialStory />
      <GiftEdit />
      <AppointmentBanner />
      <ServicesStrip />
    </>
  );
}
