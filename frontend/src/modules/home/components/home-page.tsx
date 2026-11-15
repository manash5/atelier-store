import { CategoryGrid } from "@/modules/categories";
import { FeaturedCollections } from "@/modules/collections";

import { AppointmentBanner } from "./appointment-banner";
import { EditorialStory } from "./editorial-story";
import { GiftEdit } from "./gift-edit";
import { Hero } from "./hero";
import { NewArrivals } from "./new-arrivals";
import { ServicesStrip } from "./services-strip";

export function HomePage() {
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
