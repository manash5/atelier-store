import type { Metadata } from "next";

import { EditorialCollectionPage, editorialEdits } from "@/modules/products";

const edit = editorialEdits["resort-2027"];

export const metadata: Metadata = {
  title: `${edit.title} · ${edit.eyebrow}`,
  description: edit.description,
  openGraph: { images: [{ url: edit.image.src, alt: edit.image.alt }] },
};

export default function ResortRoute() {
  return <EditorialCollectionPage edit="resort-2027" />;
}
