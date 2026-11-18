import type { Metadata } from "next";

import { EditorialCollectionPage, editorialEdits } from "@/modules/products";

const edit = editorialEdits["women-tailoring"];

export const metadata: Metadata = {
  title: `${edit.title} · Women`,
  description: edit.description,
  openGraph: { images: [{ url: edit.image.src, alt: edit.image.alt }] },
};

export default function WomenTailoringRoute() {
  return <EditorialCollectionPage edit="women-tailoring" />;
}
