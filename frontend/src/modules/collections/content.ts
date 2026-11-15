// Featured collections are editorial and static until a collections API exists.

import { unsplash } from "@/shared/lib/unsplash";

import type { Collection } from "./types";

export const featuredCollections: Collection[] = [
  {
    slug: "women-tailoring",
    eyebrow: "Women",
    title: "The Tailoring Edit",
    description: "Wrap coats and sharp trousers in wool and camel hair.",
    image: {
      src: unsplash("1539533018447-63fcce2678e3"),
      alt: "Camel wrap coat worn over black trousers on stone steps",
      position: "50% 40%",
    },
  },
  {
    slug: "men-tailoring",
    eyebrow: "Men",
    title: "Soft Structure",
    description: "Unlined blazers and relaxed cotton, made to be lived in.",
    image: {
      src: unsplash("1552374196-1ab2a1c593e8"),
      alt: "Seated model in a camel blazer, white tee and stone-colored trousers",
      position: "50% 35%",
    },
  },
];
