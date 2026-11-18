// Copy and imagery for client services. The photo matches the homepage
// "Private appointments" banner that links here.

import { unsplash } from "@/shared/lib/unsplash";
import type { Image } from "@/shared/types/image";

export const appointmentHero = {
  eyebrow: "Atelier Services",
  title: "Private appointments",
  body: "Shop with a client advisor in-store or by video call, with pieces selected for you in advance.",
  image: {
    src: unsplash("1441984904996-e0b6ba687e04", 2400),
    alt: "Bright boutique interior with garments on hanging rails",
  } satisfies Image,
};

export const appointmentSteps = [
  {
    title: "Tell us about you",
    body: "Leave your details and, if you like, a date and what you are looking for.",
  },
  {
    title: "We call you back",
    body: "A client advisor contacts you within one business day to arrange a time.",
  },
  {
    title: "Your appointment",
    body: "Pieces are prepared in your size before you arrive, in-store or on a video call.",
  },
];

export const appointmentTypes = [
  {
    value: "in_store",
    label: "In-store",
    description: "A private fitting room and an advisor at our boutique.",
  },
  {
    value: "video",
    label: "Video call",
    description: "Browse together from wherever you are, about 45 minutes.",
  },
] as const;
