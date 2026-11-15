// Sample storefront content used until products and collections live in the
// database. Shapes are deliberately close to what a real catalog query would
// return so components won't need to change when the data source does.
//
// Photography: Unsplash (https://unsplash.com/license). Only unbranded
// imagery is used so no third-party logos appear on the storefront.

export type CatalogImage = {
  src: string;
  alt: string;
  /** CSS object-position for art-directed crops. Defaults to center. */
  position?: string;
};

export type CategorySlug = "ready-to-wear" | "shoes" | "bags" | "jewelry" | "eyewear";

export const categoryTitles: Record<CategorySlug, string> = {
  "ready-to-wear": "Ready-to-Wear",
  shoes: "Shoes",
  bags: "Bags",
  jewelry: "Jewelry",
  eyewear: "Eyewear",
};

export type Product = {
  slug: string;
  name: string;
  styleNumber: string;
  category: CategorySlug;
  /** Whole units of `currency`. */
  price: number;
  currency: "USD";
  color: { name: string; hex: string };
  /** Units available to sell. Drives the stock status shown to shoppers. */
  stock: number;
  description: string;
  details: string[];
  /** First image is the primary/listing image. */
  images: [CatalogImage, ...CatalogImage[]];
  badge?: "New" | "Limited";
};

export type Collection = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: CatalogImage;
};

export type Category = {
  slug: CategorySlug;
  image: CatalogImage;
};

function unsplash(id: string, width = 2000) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80`;
}

/** A 4:5 close-up of an Unsplash photo, zoomed on a focal point (0–1). */
function unsplashDetail(id: string, x: number, y: number, zoom: number) {
  return `https://images.unsplash.com/photo-${id}?w=1200&h=1500&fit=crop&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}&q=80`;
}

/* --------------------------------------------------------------------------
   Stock
   -------------------------------------------------------------------------- */

export type StockStatus = "in-stock" | "low-stock" | "sold-out";

/** At or below this many units, shoppers see a "only N left" message. */
export const LOW_STOCK_THRESHOLD = 3;

export function getStockStatus(product: Pick<Product, "stock">): StockStatus {
  if (product.stock <= 0) return "sold-out";
  if (product.stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

/* --------------------------------------------------------------------------
   Products
   -------------------------------------------------------------------------- */

export const products: Product[] = [
  {
    slug: "fringed-cotton-knit-poncho",
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
];

const productsBySlug = new Map(products.map((product) => [product.slug, product]));

export function getProduct(slug: string): Product | undefined {
  return productsBySlug.get(slug);
}

function pick(slugs: string[]): Product[] {
  return slugs.map((slug) => {
    const product = productsBySlug.get(slug);
    if (!product) throw new Error(`Unknown product slug: ${slug}`);
    return product;
  });
}

/** Same-category products first, then the rest of the catalog. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const others = products.filter((candidate) => candidate.slug !== product.slug);
  return [
    ...others.filter((candidate) => candidate.category === product.category),
    ...others.filter((candidate) => candidate.category !== product.category),
  ].slice(0, limit);
}

export const newArrivals = pick([
  "fringed-cotton-knit-poncho",
  "silk-blend-bomber-jacket",
  "leather-biker-jacket",
  "cotton-jersey-sweatshirt",
  "tapered-crepe-trousers",
  "cotton-poplin-shirt",
  "double-monk-strap-shoe",
  "suede-wingtip-brogue",
]);

export const giftEdit = pick([
  "chevron-leather-shoulder-bag",
  "sapphire-drop-earrings",
  "filigree-gold-bracelet",
  "floral-satin-pumps",
]);

/* --------------------------------------------------------------------------
   Editorial content
   -------------------------------------------------------------------------- */

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
  images: [CatalogImage, CatalogImage];
};

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
} satisfies {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: CatalogImage;
};

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
} satisfies {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: CatalogImage;
};

export const categories: Category[] = [
  {
    slug: "ready-to-wear",
    image: {
      src: unsplash("1558769132-cb1aea458c5e"),
      alt: "Rail of knitwear in cream, oatmeal and rust",
    },
  },
  {
    slug: "shoes",
    image: {
      src: unsplash("1614252235316-8c857d38b5f4"),
      alt: "Close-up of brown perforated leather lace-up shoes",
      position: "35% 50%",
    },
  },
  {
    slug: "jewelry",
    image: {
      src: unsplash("1515562141207-7a88fb7ce338"),
      alt: "Pearl necklace resting in an open burgundy jewelry box",
    },
  },
  {
    slug: "eyewear",
    image: {
      src: unsplash("1511499767150-a48a237f0083"),
      alt: "Round gold-rimmed sunglasses with green lenses on a white surface",
    },
  },
];

export const navigation = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Shoes", href: "/collections/shoes" },
  { label: "Jewelry", href: "/collections/jewelry" },
  { label: "Eyewear", href: "/collections/eyewear" },
  { label: "Gifts", href: "/collections/gifts" },
] as const;

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

const priceFormatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(amount: number, currency: Product["currency"]) {
  let formatter = priceFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    priceFormatters.set(currency, formatter);
  }
  return formatter.format(amount);
}
