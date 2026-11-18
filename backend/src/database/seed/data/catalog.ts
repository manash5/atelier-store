// Sample catalog used to seed development and preview databases.
// Moved from the storefront's former static catalog (src/lib/catalog.ts).
//
// Photography: Unsplash (https://unsplash.com/license). Only unbranded
// imagery is used so no third-party logos appear on the storefront.

import type { ImageData } from "../../schema/catalog";

export type SeedCategory = {
  slug: string;
  title: string;
  image: ImageData | null;
};

export type SeedProduct = {
  slug: string;
  name: string;
  styleNumber: string;
  /** Category slug. */
  category: string;
  /** Whole units of `currency`; the seed converts to minor units. */
  price: number;
  currency: "USD";
  color: { name: string; hex: string };
  stock: number;
  description: string;
  details: string[];
  images: [ImageData, ...ImageData[]];
  badge?: "New" | "Limited";
  gender: "women" | "men" | "unisex";
};

function unsplash(id: string, width = 2000) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80`;
}

/** A 4:5 close-up of an Unsplash photo, zoomed on a focal point (0–1). */
function unsplashDetail(id: string, x: number, y: number, zoom: number) {
  return `https://images.unsplash.com/photo-${id}?w=1200&h=1500&fit=crop&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}&q=80`;
}

/** In display order (`sort_order` follows array position). */
export const seedCategories: SeedCategory[] = [
  {
    slug: "ready-to-wear",
    title: "Ready-to-Wear",
    image: {
      src: unsplash("1558769132-cb1aea458c5e"),
      alt: "Rail of knitwear in cream, oatmeal and rust",
    },
  },
  {
    slug: "shoes",
    title: "Shoes",
    image: {
      src: unsplash("1614252235316-8c857d38b5f4"),
      alt: "Close-up of brown perforated leather lace-up shoes",
      position: "35% 50%",
    },
  },
  {
    slug: "bags",
    title: "Bags",
    image: null,
  },
  {
    slug: "jewelry",
    title: "Jewelry",
    image: {
      src: unsplash("1515562141207-7a88fb7ce338"),
      alt: "Pearl necklace resting in an open burgundy jewelry box",
    },
  },
  {
    slug: "eyewear",
    title: "Eyewear",
    image: {
      src: unsplash("1511499767150-a48a237f0083"),
      alt: "Round gold-rimmed sunglasses with green lenses on a white surface",
    },
  },
];

/** Insertion order is the catalog order (related products tie-break on it). */
export const seedProducts: SeedProduct[] = [
  {
    slug: "fringed-cotton-knit-poncho",
    gender: "women",
    name: "Fringed Cotton Knit Poncho",
    styleNumber: "741208 RTW01",
    category: "ready-to-wear",
    price: 1250,
    currency: "USD",
    color: { name: "Ivory", hex: "#ede6d6" },
    stock: 8,
    badge: "New",
    description:
      "An open-stitch poncho knitted from long-staple cotton, finished with a hand-knotted fringe that moves as you walk. Light enough for summer evenings, easy to layer over knitwear in autumn.",
    details: [
      "100% long-staple cotton",
      "Open-stitch knit with hand-knotted fringe",
      "V-neck, one size",
      "Made in Italy",
      "Dry clean or hand wash cold",
    ],
    images: [
      {
        src: unsplash("1434389677669-e08b4cac3105", 1600),
        alt: "Cream open-knit poncho with fringed hem on a wooden hanger",
      },
      {
        src: unsplashDetail("1434389677669-e08b4cac3105", 0.5, 0.78, 2.5),
        alt: "Close-up of the poncho's open-stitch knit and knotted fringe",
      },
    ],
  },
  {
    slug: "silk-blend-bomber-jacket",
    gender: "unisex",
    name: "Silk-Blend Bomber Jacket",
    styleNumber: "738114 RTW07",
    category: "ready-to-wear",
    price: 2400,
    currency: "USD",
    color: { name: "Rust", hex: "#b5633f" },
    stock: 5,
    badge: "New",
    description:
      "A lightweight bomber in a silk and cotton blend with a soft sheen. Ribbed collar, cuffs and hem keep the shape relaxed, while a two-way zip lets it sit open or closed.",
    details: [
      "70% cotton, 30% silk",
      "Lined in cupro",
      "Two-way zip, welt pockets, utility sleeve pocket",
      "Ribbed collar, cuffs and hem",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1591047139829-d91aecb6caea", 1600),
        alt: "Rust bomber jacket held up on a hanger against a grey wall",
      },
      {
        src: unsplashDetail("1591047139829-d91aecb6caea", 0.5, 0.62, 2.5),
        alt: "Close-up of the bomber's zip, welt pockets and ribbed hem",
      },
    ],
  },
  {
    slug: "leather-biker-jacket",
    gender: "men",
    name: "Leather Biker Jacket",
    styleNumber: "729560 RTW03",
    category: "ready-to-wear",
    price: 4900,
    currency: "USD",
    color: { name: "Black", hex: "#111111" },
    stock: 0,
    description:
      "Our signature biker in supple lambskin, cut close through the body with an asymmetric zip and notched lapels. It softens and takes on the shape of the wearer over years of use.",
    details: [
      "100% lambskin leather",
      "Viscose lining",
      "Asymmetric front zip, zipped cuffs and pockets",
      "Snap-down lapels",
      "Made in Italy",
      "Specialist leather clean only",
    ],
    images: [
      {
        src: unsplash("1520975954732-35dd22299614", 1600),
        alt: "Model in a black leather biker jacket and sunglasses crouching on a rooftop ledge",
        position: "50% 30%",
      },
      {
        src: unsplashDetail("1551028719-00167b16eac5", 0.62, 0.78, 2.5),
        alt: "Close-up of black lambskin leather on the jacket sleeve",
      },
    ],
  },
  {
    slug: "cotton-jersey-sweatshirt",
    gender: "unisex",
    name: "Cotton Jersey Sweatshirt",
    styleNumber: "745902 RTW11",
    category: "ready-to-wear",
    price: 890,
    currency: "USD",
    color: { name: "Optic White", hex: "#f7f7f5" },
    stock: 14,
    description:
      "A crew-neck sweatshirt in heavyweight brushed jersey, garment-washed for a broken-in feel from the first wear. Slightly dropped shoulders give an easy, relaxed fit.",
    details: [
      "100% organic cotton jersey, 450 g/m²",
      "Brushed interior",
      "Ribbed crew neck, cuffs and hem",
      "Made in Portugal",
      "Machine wash cold",
    ],
    images: [
      {
        src: unsplash("1620799140408-edc6dcb6d633", 1600),
        alt: "White crew-neck cotton sweatshirt laid flat",
      },
      {
        src: unsplashDetail("1620799140408-edc6dcb6d633", 0.5, 0.3, 2.5),
        alt: "Close-up of the sweatshirt's ribbed crew neck",
      },
    ],
  },
  {
    slug: "tapered-crepe-trousers",
    gender: "women",
    name: "Tapered Crêpe Trousers",
    styleNumber: "740376 RTW05",
    category: "ready-to-wear",
    price: 1100,
    currency: "USD",
    color: { name: "Blush", hex: "#e3b5a4" },
    stock: 2,
    badge: "Limited",
    description:
      "Fluid trousers in a matte silk crêpe with a high, elasticated waist and patch pockets. The leg tapers to a gathered cuff that sits neatly above the ankle.",
    details: [
      "100% silk crêpe de chine",
      "Elasticated waist, patch pockets",
      "Gathered ankle cuffs",
      "Made in Italy",
      "Dry clean only",
    ],
    images: [
      {
        src: unsplash("1594633312681-425c7b97ccd1", 1600),
        alt: "Model wearing blush crêpe trousers with gathered ankles",
        position: "50% 30%",
      },
      {
        src: unsplashDetail("1594633312681-425c7b97ccd1", 0.5, 0.3, 2),
        alt: "Close-up of the trousers' waistband and patch pockets",
      },
      {
        src: unsplashDetail("1594633312681-425c7b97ccd1", 0.5, 0.85, 2.5),
        alt: "Close-up of the gathered ankle cuffs worn with nude sandals",
      },
    ],
  },
  {
    slug: "cotton-poplin-shirt",
    gender: "men",
    name: "Cotton Poplin Shirt",
    styleNumber: "733015 RTW09",
    category: "ready-to-wear",
    price: 750,
    currency: "USD",
    color: { name: "White", hex: "#fafafa" },
    stock: 20,
    description:
      "A crisp shirt in tightly woven two-ply poplin with a spread collar and mother-of-pearl buttons. Tailored through the body to wear tucked, with or without a tie.",
    details: [
      "100% two-ply cotton poplin",
      "Spread collar, single-button cuffs",
      "Mother-of-pearl buttons",
      "Made in Italy",
      "Machine wash at 30°C",
    ],
    images: [
      {
        src: unsplash("1598033129183-c4f50c736f10", 1600),
        alt: "Model wearing a white poplin shirt with a brown polka-dot tie",
      },
      {
        src: unsplashDetail("1598033129183-c4f50c736f10", 0.5, 0.22, 2.5),
        alt: "Close-up of the shirt's spread collar",
      },
    ],
  },
  {
    slug: "double-monk-strap-shoe",
    gender: "men",
    name: "Double Monk Strap Shoe",
    styleNumber: "752210 SHO02",
    category: "shoes",
    price: 1150,
    currency: "USD",
    color: { name: "Cognac", hex: "#8a4b26" },
    stock: 6,
    description:
      "A double monk strap in hand-burnished calf leather, built on a Goodyear-welted leather sole that can be resoled for years of wear.",
    details: [
      "Hand-burnished calf leather upper",
      "Leather lining and sole, Goodyear welted",
      "Double buckle closure",
      "Made in Italy",
      "Supplied with dust bags and shoe trees",
    ],
    images: [
      {
        src: unsplash("1533867617858-e7b97e060509", 1600),
        alt: "Pair of brown leather double monk strap shoes on a dark background",
      },
      {
        src: unsplashDetail("1533867617858-e7b97e060509", 0.45, 0.6, 2.5),
        alt: "Close-up of the burnished toe and welted sole",
      },
    ],
  },
  {
    slug: "suede-wingtip-brogue",
    gender: "men",
    name: "Suede Wingtip Brogue",
    styleNumber: "750884 SHO05",
    category: "shoes",
    price: 980,
    currency: "USD",
    color: { name: "Jade", hex: "#3e9c88" },
    stock: 3,
    badge: "New",
    description:
      "A wingtip brogue in velvety suede with hand-punched perforations, set on a slim leather sole for a lighter take on a classic.",
    details: [
      "Calf suede upper",
      "Hand-punched broguing",
      "Leather lining and sole",
      "Made in Spain",
      "Brush regularly; protect with suede spray",
    ],
    images: [
      {
        src: unsplash("1560343090-f0409e92791a", 1600),
        alt: "Green suede wingtip brogue on a pale plinth",
      },
      {
        src: unsplashDetail("1560343090-f0409e92791a", 0.55, 0.55, 2.5),
        alt: "Close-up of the brogue's perforated suede wingtip",
      },
    ],
  },
  {
    slug: "chevron-leather-shoulder-bag",
    gender: "women",
    name: "Chevron Leather Shoulder Bag",
    styleNumber: "760431 BAG01",
    category: "bags",
    price: 2150,
    currency: "USD",
    color: { name: "Blush Pink", hex: "#edb8bc" },
    stock: 4,
    description:
      "A structured flap bag in smooth calf leather with inlaid chevron stripes. The sliding chain strap can be worn long across the body or doubled on the shoulder.",
    details: [
      "Smooth calf leather with inlaid leather stripes",
      "Suede lining, one interior slip pocket",
      "Magnetic flap closure",
      "Sliding palladium chain strap",
      "W 22 × H 15 × D 6 cm",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1566150905458-1bf1fc113f0d", 1600),
        alt: "Pink leather shoulder bag with chevron stripes and a chain strap",
        position: "35% 50%",
      },
      {
        src: unsplashDetail("1566150905458-1bf1fc113f0d", 0.33, 0.3, 3),
        alt: "Close-up of the bag's chain fixing and inlaid stripes",
      },
    ],
  },
  {
    slug: "sapphire-drop-earrings",
    gender: "women",
    name: "Sapphire Drop Earrings",
    styleNumber: "771902 JWL04",
    category: "jewelry",
    price: 3800,
    currency: "USD",
    color: { name: "Sapphire", hex: "#1f3f8f" },
    stock: 1,
    badge: "Limited",
    description:
      "Pear-cut lab-grown sapphires framed by baguette crystals in a hand-set halo. Made in a limited run of fifty pairs.",
    details: [
      "Lab-grown sapphire centre stones",
      "Hand-set crystal halo",
      "Rhodium-plated sterling silver",
      "Post back, drop length 4.5 cm",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1535632066927-ab7c9ab60908", 1600),
        alt: "Sapphire and crystal drop earrings resting on a green leaf",
      },
      {
        src: unsplashDetail("1535632066927-ab7c9ab60908", 0.5, 0.4, 2),
        alt: "Close-up of a pear-cut sapphire in its crystal halo",
      },
    ],
  },
  {
    slug: "filigree-gold-bracelet",
    gender: "women",
    name: "Filigree Gold Bracelet",
    styleNumber: "770318 JWL02",
    category: "jewelry",
    price: 2600,
    currency: "USD",
    color: { name: "Rose Gold", hex: "#d9a07a" },
    stock: 7,
    description:
      "A flexible bracelet of hand-pierced filigree links, each set with a scatter of crystals that catch the light as the wrist moves.",
    details: [
      "18k rose gold vermeil",
      "Hand-pierced filigree links with crystals",
      "Fold-over clasp, length 17 cm",
      "Made in Italy",
      "Store in the supplied pouch",
    ],
    images: [
      {
        src: unsplash("1611591437281-460bfbe1220a", 1600),
        alt: "Gold filigree bracelet set with crystals on a blush background",
      },
      {
        src: unsplashDetail("1611591437281-460bfbe1220a", 0.5, 0.5, 2.5),
        alt: "Close-up of the bracelet's crystal-set filigree links",
      },
    ],
  },
  {
    slug: "floral-satin-pumps",
    gender: "women",
    name: "Floral Satin Pumps",
    styleNumber: "754467 SHO09",
    category: "shoes",
    price: 1050,
    currency: "USD",
    color: { name: "Azure Floral", hex: "#2e6bbf" },
    stock: 0,
    description:
      "Pointed pumps in a floral-printed duchess satin on a slender 100 mm heel. Cushioned leather insoles make them easier to wear for long evenings.",
    details: [
      "Printed duchess satin upper",
      "100 mm stiletto heel",
      "Padded leather insole, leather sole",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1543163521-1bf539c55dd2", 1600),
        alt: "Pair of floral-print satin stiletto pumps against a pale blue wall",
      },
      {
        src: unsplashDetail("1543163521-1bf539c55dd2", 0.4, 0.8, 2.5),
        alt: "Close-up of the pump's printed satin heel and pointed toe",
      },
    ],
  },
  {
    slug: "cat-eye-acetate-sunglasses",
    gender: "women",
    name: "Cat-Eye Acetate Sunglasses",
    styleNumber: "781204 EYE01",
    category: "eyewear",
    price: 520,
    currency: "USD",
    color: { name: "Blush", hex: "#e9cfc0" },
    stock: 9,
    badge: "New",
    description:
      "An angular cat-eye frame in polished blush acetate with fine gold-tone temples. Gradient lenses soften bright light while keeping colours true.",
    details: [
      "Hand-polished acetate front, metal temples",
      "Gradient lenses, 100% UV protection",
      "Adjustable nose pads",
      "Made in Italy",
      "Supplied with a leather case",
    ],
    images: [
      {
        src: unsplash("1508296695146-257a814070b4", 1600),
        alt: "Blush cat-eye sunglasses with gradient lenses resting on a white surface",
      },
      {
        src: unsplashDetail("1508296695146-257a814070b4", 0.3, 0.42, 2.2),
        alt: "Close-up of the blush acetate rim and gradient lens",
      },
    ],
  },
  {
    slug: "browline-optical-frames",
    gender: "unisex",
    name: "Browline Optical Frames",
    styleNumber: "781377 EYE02",
    category: "eyewear",
    price: 460,
    currency: "USD",
    color: { name: "Tortoiseshell", hex: "#6b4a2b" },
    stock: 12,
    description:
      "A classic browline frame pairing a tortoiseshell acetate brow with a slim gold-tone wire rim. Fitted with demo lenses, ready for your prescription.",
    details: [
      "Acetate brow, titanium wire rim",
      "Demo lenses, prescription ready",
      "Spring hinges",
      "Made in Japan",
    ],
    images: [
      {
        src: unsplash("1574258495973-f010dfbb5371", 1600),
        alt: "Tortoiseshell browline glasses resting on an open white book",
      },
      {
        src: unsplashDetail("1574258495973-f010dfbb5371", 0.45, 0.48, 1.5),
        alt: "Close-up of the tortoiseshell brow and gold-tone wire rim",
      },
    ],
  },
  {
    slug: "crystal-round-sunglasses",
    gender: "unisex",
    name: "Crystal Round Sunglasses",
    styleNumber: "781590 EYE03",
    category: "eyewear",
    price: 490,
    currency: "USD",
    color: { name: "Crystal", hex: "#e6ded2" },
    stock: 2,
    badge: "New",
    description:
      "Softly rounded sunglasses in transparent crystal acetate with warm brown lenses, made for long days by the sea.",
    details: [
      "Transparent acetate frame",
      "Polarised brown lenses, 100% UV protection",
      "Five-barrel hinges",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1577803645773-f96470509666", 1600),
        alt: "Clear round sunglasses with brown lenses on a sunlit beach towel by the sea",
      },
      {
        src: unsplashDetail("1577803645773-f96470509666", 0.3, 0.55, 2.0),
        alt: "Close-up of the crystal frame and polarised brown lens",
      },
    ],
  },
  {
    slug: "top-handle-satchel",
    gender: "women",
    name: "Top-Handle Satchel",
    styleNumber: "760518 BAG02",
    category: "bags",
    price: 2450,
    currency: "USD",
    color: { name: "Teal", hex: "#0f6b70" },
    stock: 6,
    badge: "Limited",
    description:
      "A structured satchel in pebbled calfskin with a single rolled handle and a polished push-lock flap. Compact, but fits the essentials.",
    details: [
      "Pebbled calfskin, leather lining",
      "Gold-tone push-lock closure",
      "Detachable shoulder strap",
      "Interior slip pocket",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1594223274512-ad4803739b7c", 1600),
        alt: "Teal leather top-handle satchel with gold push-lock beside a pair of glasses",
      },
      {
        src: unsplashDetail("1594223274512-ad4803739b7c", 0.55, 0.6, 2.2),
        alt: "Close-up of the satchel's pebbled leather and push-lock clasp",
      },
    ],
  },
  {
    slug: "leather-bucket-tote",
    gender: "women",
    name: "Leather Bucket Tote",
    styleNumber: "760642 BAG03",
    category: "bags",
    price: 1850,
    currency: "USD",
    color: { name: "Bottle Green", hex: "#1f3d36" },
    stock: 0,
    description:
      "A soft bucket tote in smooth leather with contrasting tan handles and a striped webbing strap for wearing across the body.",
    details: [
      "Smooth calfskin with tan leather trims",
      "Removable striped cotton webbing strap",
      "Magnetic closure",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1524498250077-390f9e378fc0", 1600),
        alt: "Woman carrying a bottle green leather bucket tote with tan handles",
        position: "30% 50%",
      },
      {
        src: unsplashDetail("1524498250077-390f9e378fc0", 0.37, 0.45, 1.6),
        alt: "Close-up of the tote's green leather and tan handle",
      },
    ],
  },
  {
    slug: "bifold-leather-wallet",
    gender: "men",
    name: "Bifold Leather Wallet",
    styleNumber: "760799 BAG04",
    category: "bags",
    price: 420,
    currency: "USD",
    color: { name: "Chestnut", hex: "#7a4a2a" },
    stock: 20,
    description:
      "A slim bifold in vegetable-tanned leather that darkens and softens with use. Six card slots and a full-length note compartment.",
    details: [
      "Vegetable-tanned calfskin",
      "Six card slots, two hidden pockets",
      "Hand-painted edges",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1627123424574-724758594e93", 1600),
        alt: "Chestnut leather bifold wallet suspended against a dark background",
      },
      {
        src: unsplashDetail("1627123424574-724758594e93", 0.5, 0.38, 2.0),
        alt: "Close-up of the wallet's worn vegetable-tanned leather",
      },
    ],
  },
  {
    slug: "rose-gold-halo-ring",
    gender: "women",
    name: "Rose Gold Halo Ring",
    styleNumber: "772105 JWL05",
    category: "jewelry",
    price: 4600,
    currency: "USD",
    color: { name: "Rose Gold", hex: "#c98f7a" },
    stock: 3,
    badge: "Limited",
    description:
      "A round brilliant centre stone framed by a halo of pavé diamonds in rose gold, set on a split white gold band.",
    details: [
      "18k rose and white gold",
      "Pavé-set halo and split shank",
      "Ring sizes 48 to 58",
      "Made in Italy",
      "Supplied in a presentation box",
    ],
    images: [
      {
        src: unsplash("1605100804763-247f67b3557e", 1600),
        alt: "Rose gold halo engagement-style ring with pavé band on a dark stand",
      },
      {
        src: unsplashDetail("1605100804763-247f67b3557e", 0.5, 0.5, 2.0),
        alt: "Close-up of the ring's halo setting and centre stone",
      },
    ],
  },
  {
    slug: "layered-pendant-necklace",
    gender: "women",
    name: "Layered Pendant Necklace",
    styleNumber: "772238 JWL06",
    category: "jewelry",
    price: 1650,
    currency: "USD",
    color: { name: "Gold", hex: "#c9a24a" },
    stock: 7,
    badge: "New",
    description:
      "Two fine gold chains worn together: a faceted blue topaz drop above a crescent pendant set with small white stones.",
    details: [
      "18k gold vermeil",
      "Blue topaz and white sapphire",
      "Lengths 42 cm and 50 cm",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1599643478518-a784e5dc4c8f", 1600),
        alt: "Two layered gold necklaces with a blue gem drop and a crescent pendant",
      },
      {
        src: unsplashDetail("1599643478518-a784e5dc4c8f", 0.45, 0.3, 2.2),
        alt: "Close-up of the faceted blue topaz drop",
      },
    ],
  },
  {
    slug: "twisted-gold-hoops",
    gender: "women",
    name: "Twisted Gold Hoops",
    styleNumber: "772361 JWL07",
    category: "jewelry",
    price: 980,
    currency: "USD",
    color: { name: "Gold", hex: "#d4a94e" },
    stock: 11,
    description:
      "Chunky rope-twist hoops in polished gold, light enough for every day and bold enough for evening.",
    details: [
      "18k gold vermeil",
      "Diameter 2.5 cm",
      "Hinged click closure",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1617038220319-276d3cfab638", 1600),
        alt: "Pair of twisted gold hoop earrings beside smooth white pebbles",
      },
      {
        src: unsplashDetail("1617038220319-276d3cfab638", 0.45, 0.62, 2.2),
        alt: "Close-up of the hoops' rope-twist texture",
      },
    ],
  },
  {
    slug: "polished-leather-derby",
    gender: "men",
    name: "Polished Leather Derby",
    styleNumber: "750921 SHO06",
    category: "shoes",
    price: 1050,
    currency: "USD",
    color: { name: "Cognac", hex: "#9a4a24" },
    stock: 5,
    description:
      "A clean-lined derby in hand-burnished calfskin on a stitched leather sole. Open lacing gives an easy fit from the first wear.",
    details: [
      "Hand-burnished calfskin upper",
      "Blake-stitched leather sole",
      "Leather lining",
      "Made in Italy",
    ],
    images: [
      {
        src: unsplash("1449505278894-297fdb3edbc1", 1600),
        alt: "Pair of cognac leather derby shoes on a wooden floor",
      },
      {
        src: unsplashDetail("1449505278894-297fdb3edbc1", 0.6, 0.45, 2.0),
        alt: "Close-up of the derby's burnished toe and welt stitching",
      },
    ],
  },
  {
    slug: "lace-up-leather-boot",
    gender: "men",
    name: "Lace-Up Leather Boot",
    styleNumber: "751044 SHO07",
    category: "shoes",
    price: 1290,
    currency: "USD",
    color: { name: "Tan", hex: "#a8643a" },
    stock: 4,
    badge: "New",
    description:
      "A rugged ankle boot in waxed nubuck with speed hooks and a cushioned lug sole, built for city streets in cold weather.",
    details: [
      "Waxed nubuck upper",
      "Rubber lug sole, Goodyear welted",
      "Padded collar",
      "Made in Portugal",
    ],
    images: [
      {
        src: unsplash("1520639888713-7851133b1ed0", 1600),
        alt: "Man lacing tan nubuck ankle boots on an asphalt street",
      },
      {
        src: unsplashDetail("1520639888713-7851133b1ed0", 0.5, 0.55, 1.5),
        alt: "Close-up of the boot's waxed nubuck and lug sole",
      },
    ],
  },
  {
    slug: "belted-camel-wrap-coat",
    gender: "women",
    name: "Belted Camel Wrap Coat",
    styleNumber: "746115 RTW12",
    category: "ready-to-wear",
    price: 3200,
    currency: "USD",
    color: { name: "Camel", hex: "#b98a52" },
    stock: 3,
    badge: "New",
    description:
      "A double-faced wool and cashmere coat with wide notched lapels and a self-tie belt. Unlined, so it drapes softly.",
    details: [
      "90% wool, 10% cashmere, double-faced",
      "Self-tie belt, side seam pockets",
      "Unlined, hand-finished seams",
      "Made in Italy",
      "Dry clean only",
    ],
    images: [
      {
        src: unsplash("1539533018447-63fcce2678e3", 1600),
        alt: "Woman in a belted camel wool wrap coat on stone steps",
      },
      {
        src: unsplashDetail("1539533018447-63fcce2678e3", 0.5, 0.45, 2.0),
        alt: "Close-up of the coat's belt and double-faced wool",
      },
    ],
  },
  {
    slug: "silk-faille-ball-gown",
    gender: "women",
    name: "Silk Faille Ball Gown",
    styleNumber: "746238 RTW13",
    category: "ready-to-wear",
    price: 5400,
    currency: "USD",
    color: { name: "Scarlet", hex: "#d3121e" },
    stock: 2,
    badge: "Limited",
    description:
      "A sleeveless gown in silk faille with a fitted bodice and a full circle skirt that swings with every step.",
    details: [
      "100% silk faille",
      "Fitted bodice, full circle skirt",
      "Concealed back zip",
      "Made in Italy",
      "Dry clean only",
    ],
    images: [
      {
        src: unsplash("1595777457583-95e059d581b8", 1600),
        alt: "Woman twirling in a scarlet silk floor-length gown outdoors",
      },
      {
        src: unsplashDetail("1595777457583-95e059d581b8", 0.55, 0.6, 2.0),
        alt: "Close-up of the gown's flowing silk skirt",
      },
    ],
  },
  {
    slug: "floral-cotton-midi-dress",
    gender: "women",
    name: "Floral Cotton Midi Dress",
    styleNumber: "746361 RTW14",
    category: "ready-to-wear",
    price: 1450,
    currency: "USD",
    color: { name: "Poppy Floral", hex: "#c8232c" },
    stock: 9,
    description:
      "A full-skirted midi dress in printed cotton poplin with a wrap neckline, cinched by a raffia belt.",
    details: [
      "100% cotton poplin",
      "Wrap neckline, full skirt",
      "Removable raffia belt",
      "Made in Portugal",
    ],
    images: [
      {
        src: unsplash("1572804013309-59a88b7e92f1", 1600),
        alt: "Smiling woman in a red floral midi dress with a raffia belt",
      },
      {
        src: unsplashDetail("1572804013309-59a88b7e92f1", 0.5, 0.65, 2.0),
        alt: "Close-up of the floral print and raffia belt",
      },
    ],
  },
  {
    slug: "tailored-wool-blazer",
    gender: "men",
    name: "Tailored Wool Blazer",
    styleNumber: "738487 RTW15",
    category: "ready-to-wear",
    price: 2600,
    currency: "USD",
    color: { name: "Black", hex: "#151515" },
    stock: 6,
    description:
      "A single-breasted blazer in lightweight wool with a soft shoulder and slim peak lapels, cut to wear with tailoring or denim.",
    details: [
      "100% virgin wool",
      "Half-canvassed, soft shoulder",
      "Two-button closure, peak lapels",
      "Made in Italy",
      "Dry clean only",
    ],
    images: [
      {
        src: unsplash("1617127365659-c47fa864d8bc", 1600),
        alt: "Man in a black tailored blazer and black shirt on a city street",
      },
      {
        src: unsplashDetail("1617127365659-c47fa864d8bc", 0.5, 0.55, 2.0),
        alt: "Close-up of the blazer's lapel and shoulder",
      },
    ],
  },
];
