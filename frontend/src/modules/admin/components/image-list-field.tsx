"use client";

import { useRef, useState, useTransition } from "react";

import type { Image as ImageType } from "@/shared/types/image";

import { uploadImageAction } from "../actions";

type ImageListFieldProps = {
  /** Form field that receives the images as JSON. */
  name: string;
  label: string;
  initial: ImageType[];
  /** At most this many images (1 for categories). */
  max: number;
  error?: string;
  hint?: string;
};

const UNSPLASH = /^https:\/\/images\.unsplash\.com\/\S+$/;

/**
 * Ordered image list: upload a file (stored by the API) or paste an Unsplash
 * URL, set alt text and crop position, reorder, remove. The first image is
 * the listing image.
 */
export function ImageListField({ name, label, initial, max, error, hint }: ImageListFieldProps) {
  const [images, setImages] = useState<ImageType[]>(initial);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const full = images.length >= max;

  const update = (index: number, patch: Partial<ImageType>) =>
    setImages((current) => current.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  const move = (index: number, by: number) =>
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item!);
      return next;
    });
  const add = (src: string) => setImages((current) => [...current, { src, alt: "" }]);

  function upload(file: File) {
    setMessage(null);
    const data = new FormData();
    data.append("image", file);
    startUpload(async () => {
      const result = await uploadImageAction(data);
      if (result.url) add(result.url);
      else setMessage(result.error ?? "Upload failed.");
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  function addUrl() {
    const value = url.trim();
    if (!UNSPLASH.test(value)) {
      setMessage("Paste an images.unsplash.com URL, or upload a file.");
      return;
    }
    setMessage(null);
    add(value);
    setUrl("");
  }

  return (
    <fieldset className="flex flex-col gap-4" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="type-label">{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {images.map((image, index) => (
            <li key={`${image.src}-${index}`} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border px-3 py-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
              <div className="media-frame aspect-product">
                {/* Plain <img>: previews may be fresh uploads not yet optimized. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  style={{ objectPosition: image.position }}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <p className="truncate type-caption text-ink-muted">
                  {index === 0 && max > 1 ? "Listing image · " : ""}
                  {image.src}
                </p>
                <input
                  aria-label={`Alt text for image ${index + 1}`}
                  value={image.alt}
                  onChange={(event) => update(index, { alt: event.target.value })}
                  placeholder="Describe the image (alt text)"
                  className="input-base min-h-10"
                />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <input
                    aria-label={`Crop position for image ${index + 1}`}
                    value={image.position ?? ""}
                    onChange={(event) => update(index, { position: event.target.value })}
                    placeholder="Crop, e.g. 50% 30%"
                    className="input-base min-h-10 w-40"
                  />
                  {max > 1 ? (
                    <>
                      <button type="button" className="type-label link-muted disabled:opacity-40" disabled={index === 0} onClick={() => move(index, -1)}>
                        Up
                      </button>
                      <button
                        type="button"
                        className="type-label link-muted disabled:opacity-40"
                        disabled={index === images.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        Down
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="type-label text-sale hover:underline"
                    onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="border border-dashed px-4 py-6 text-center type-body text-ink-muted">No images yet.</p>
      )}

      {full ? null : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className={`btn btn-secondary ${uploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
            {uploading ? "Uploading…" : "Upload image"}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
              }}
            />
          </label>
          <span className="type-caption text-ink-muted">or</span>
          <div className="flex flex-1 gap-2">
            <input
              aria-label="Unsplash image URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addUrl();
                }
              }}
              placeholder="https://images.unsplash.com/…"
              className="input-base min-w-0 flex-1"
            />
            <button type="button" className="btn btn-secondary" onClick={addUrl}>
              Add
            </button>
          </div>
        </div>
      )}

      {message ? (
        <p role="alert" className="type-caption text-sale">
          {message}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="type-caption text-sale">
          {error}
        </p>
      ) : hint ? (
        <p className="type-caption text-ink-muted">{hint}</p>
      ) : null}
    </fieldset>
  );
}
