/** An art-directed image (same shape as the API's ImageDto). */
export type Image = {
  src: string;
  alt: string;
  /** CSS object-position for art-directed crops. Defaults to center. */
  position?: string;
};
