// Editorial imagery and copy for the account area. Photos are reused from the
// catalog and homepage, so they are already checked for logos and labels.

import { unsplash } from "@/shared/lib/unsplash";
import type { Image } from "@/shared/types/image";

export const accountWelcomeImage: Image = {
  src: unsplash("1475180098004-ca77a66827be", 1600),
  alt: "Model in a chevron-striped knit sweater and suede boots on a rocky lakeshore",
  position: "60% 18%",
};

export type AccountCardId = "profile" | "membership" | "security";

export const accountCards: Record<
  AccountCardId,
  { eyebrow: string; title: string; image: Image }
> = {
  profile: {
    eyebrow: "Profile",
    title: "Personal details",
    image: {
      src: unsplash("1539533018447-63fcce2678e3", 1200),
      alt: "Camel wrap coat worn over black trousers on stone steps",
      position: "50% 35%",
    },
  },
  membership: {
    eyebrow: "Membership",
    title: "Your Atelier",
    image: {
      src: unsplash("1441984904996-e0b6ba687e04", 1200),
      alt: "Bright boutique interior with garments on hanging rails",
      position: "50% 50%",
    },
  },
  security: {
    eyebrow: "Sign-in & security",
    title: "How you sign in",
    image: {
      src: unsplash("1558769132-cb1aea458c5e", 1200),
      alt: "Rail of knitwear in cream, oatmeal and rust",
      position: "50% 50%",
    },
  },
};

export const accountShortcuts: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  image: Image;
}[] = [
  {
    href: "/collections/new-in",
    eyebrow: "Just in",
    title: "New Arrivals",
    description: "The latest ready-to-wear, shoes, bags and jewelry.",
    image: {
      src: unsplash("1617019114583-affb34d1b3cd", 1600),
      alt: "Model in a belted white linen shirt dress and dark sunglasses against sandstone ruins",
      position: "50% 30%",
    },
  },
  {
    href: "/collections/gifts",
    eyebrow: "The Gift Edit",
    title: "Considered Gifts",
    description: "Pieces chosen to be given and kept for years.",
    image: {
      src: unsplash("1515562141207-7a88fb7ce338", 1600),
      alt: "Pearl necklace resting in an open burgundy jewelry box",
      position: "50% 50%",
    },
  },
];
