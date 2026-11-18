// Curated product selections. Static until a CMS or collections API exists;
// the products themselves come from the catalog API.

import { unsplash } from "@/shared/lib/unsplash";
import type { Image } from "@/shared/types/image";

/** The Gift Edit, in display order: the /collections/gifts page and the
 * homepage row (which shows the first four). */
export const giftSlugs = [
  "chevron-leather-shoulder-bag",
  "sapphire-drop-earrings",
  "filigree-gold-bracelet",
  "floral-satin-pumps",
];

/**
 * An editorial edit: a curated, ordered selection of catalog products with
 * its own story and campaign image. Missing or renamed slugs are skipped by
 * the API, so an edit never breaks; it just shows fewer pieces.
 */
export type EditorialEdit = {
  eyebrow: string;
  title: string;
  description: string;
  image: Image;
  slugs: string[];
};

/**
 * Edits linked from the homepage campaign, knitwear story and featured
 * collections, served at /collections/<key>. Images reuse the homepage
 * photography for the same story.
 */
export const editorialEdits = {
  "resort-2027": {
    eyebrow: "Resort 2027",
    title: "Distant Light",
    description:
      "Cotton, crêpe and sun-washed silk, cut loose for long afternoons far from the city, with the sunglasses, gold and leather to carry them.",
    image: {
      src: unsplash("1617019114583-affb34d1b3cd", 2400),
      alt: "Model in a belted white linen shirt dress and dark sunglasses against sandstone ruins",
      position: "50% 15%",
    },
    slugs: [
      "floral-cotton-midi-dress",
      "fringed-cotton-knit-poncho",
      "tapered-crepe-trousers",
      "silk-blend-bomber-jacket",
      "cotton-poplin-shirt",
      "crystal-round-sunglasses",
      "cat-eye-acetate-sunglasses",
      "leather-bucket-tote",
      "twisted-gold-hoops",
    ],
  },
  knitwear: {
    eyebrow: "The Knitwear Story",
    title: "Knit & Layer",
    description:
      "An open-stitch cotton poncho, brushed cotton jersey and a double-faced wool coat to wear over both: textures made for cooler evenings.",
    image: {
      src: unsplash("1475180098004-ca77a66827be", 2400),
      alt: "Model in a chevron-striped knit sweater and suede boots on a rocky lakeshore",
      position: "65% 40%",
    },
    slugs: ["fringed-cotton-knit-poncho", "cotton-jersey-sweatshirt", "belted-camel-wrap-coat"],
  },
  "women-tailoring": {
    eyebrow: "Women",
    title: "The Tailoring Edit",
    description:
      "A camel wrap coat and fluid crêpe trousers, finished with structured leather and a sculpted heel.",
    image: {
      src: unsplash("1539533018447-63fcce2678e3", 2400),
      alt: "Camel wrap coat worn over black trousers on stone steps",
      position: "50% 40%",
    },
    slugs: [
      "belted-camel-wrap-coat",
      "tapered-crepe-trousers",
      "top-handle-satchel",
      "floral-satin-pumps",
    ],
  },
  "men-tailoring": {
    eyebrow: "Men",
    title: "Soft Structure",
    description:
      "An unlined wool blazer and crisp poplin, grounded by hand-finished leather shoes and a wallet that ages with you.",
    image: {
      src: unsplash("1552374196-1ab2a1c593e8", 2400),
      alt: "Seated model in a camel blazer, white tee and stone-colored trousers",
      position: "50% 35%",
    },
    slugs: [
      "tailored-wool-blazer",
      "cotton-poplin-shirt",
      "double-monk-strap-shoe",
      "polished-leather-derby",
      "suede-wingtip-brogue",
      "bifold-leather-wallet",
    ],
  },
} satisfies Record<string, EditorialEdit>;

export type EditorialEditKey = keyof typeof editorialEdits;
