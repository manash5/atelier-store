import type { Metadata } from "next";

import { EditorialCollectionPage, editorialEdits } from "@/modules/products";

const edit = editorialEdits.knitwear;

export const metadata: Metadata = {
  title: `${edit.title} · Knitwear`,
  description: edit.description,
  openGraph: { images: [{ url: edit.image.src, alt: edit.image.alt }] },
};

export default function KnitwearRoute() {
  return <EditorialCollectionPage edit="knitwear" />;
}
