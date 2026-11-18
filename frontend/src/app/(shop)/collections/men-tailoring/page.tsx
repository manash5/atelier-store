import type { Metadata } from "next";

import { EditorialCollectionPage, editorialEdits } from "@/modules/products";

const edit = editorialEdits["men-tailoring"];

export const metadata: Metadata = {
  title: `${edit.title} · Men`,
  description: edit.description,
  openGraph: { images: [{ url: edit.image.src, alt: edit.image.alt }] },
};

export default function MenTailoringRoute() {
  return <EditorialCollectionPage edit="men-tailoring" />;
}
