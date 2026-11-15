import type { Image } from "@/shared/types/image";

export type Collection = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: Image;
};
