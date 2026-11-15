// Homepage editorial content. Static until a CMS exists; product data comes
// from the catalog API.

import { unsplash } from "@/shared/lib/unsplash";
import type { Image } from "@/shared/types/image";

/** Hand-picked "New Arrivals" rail, in display order. */
export const newArrivalSlugs = [
  "fringed-cotton-knit-poncho",
  "silk-blend-bomber-jacket",
  "leather-biker-jacket",
  "cotton-jersey-sweatshirt",
  "tapered-crepe-trousers",
  "cotton-poplin-shirt",
  "double-monk-strap-shoe",
  "suede-wingtip-brogue",
];

/** Hand-picked "Gift Edit" row, in display order. */
export const giftEditSlugs = [
  "chevron-leather-shoulder-bag",
  "sapphire-drop-earrings",
  "filigree-gold-bracelet",
  "floral-satin-pumps",
];

export const heroCampaign = {
  eyebrow: "Resort 2027",
  title: "Distant Light",
  description:
    "Linen, voile and sun-washed silk, cut loose for long afternoons far from the city.",
  href: "/collections/resort-2027",
  images: [
    {
      src: unsplash("1617019114583-affb34d1b3cd", 2400),
      alt: "Model in a belted white linen shirt dress and dark sunglasses against sandstone ruins",
      position: "50% 30%",
    },
    {
      src: unsplash("1581044777550-4cfa60707c03", 2400),
      alt: "Model in a voluminous pink polka-dot blouse standing in a golden field",
      position: "40% 30%",
    },
  ],
} satisfies {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  images: [Image, Image];
};

type Feature = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: Image;
};

export const editorialStory = {
  eyebrow: "The Knitwear Story",
  title: "Made to be worn for decades",
  body: "Each sweater is knitted slowly on traditional frames from undyed and naturally dyed yarns, then hand-finished at the seams. The result is softer with every wear and built to outlast the season it was made for.",
  href: "/collections/knitwear",
  cta: "Discover knitwear",
  image: {
    src: unsplash("1475180098004-ca77a66827be"),
    alt: "Model in a chevron-striped knit sweater and suede boots on a rocky lakeshore",
    position: "65% 40%",
  },
} satisfies Feature;

export const appointmentFeature = {
  eyebrow: "Atelier Services",
  title: "Private appointments",
  body: "Shop with a client advisor in-store or by video call, with pieces selected for you in advance.",
  href: "/services/appointments",
  cta: "Book an appointment",
  image: {
    src: unsplash("1441984904996-e0b6ba687e04", 2400),
    alt: "Bright boutique interior with garments on hanging rails",
  },
} satisfies Feature;

export const services = [
  {
    title: "Complimentary shipping",
    body: "Free express delivery on every order, in signature packaging.",
  },
  {
    title: "Returns & exchanges",
    body: "Return or exchange within 30 days, collected from your door.",
  },
  {
    title: "Personalization",
    body: "Hot-stamped initials on selected leather goods.",
  },
  {
    title: "Client advisors",
    body: "Styling and product advice by phone, chat or appointment.",
  },
] as const;
