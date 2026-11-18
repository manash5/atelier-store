"use client";

import { useActionState } from "react";

import { uploadImageAction } from "../actions";
import type { UploadFormState } from "../types";
import { FormAlert } from "./form-alert";

const initialState: UploadFormState = {};

export function AdminUploadForm() {
  const [state, formAction, pending] = useActionState(uploadImageAction, initialState);

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-6">
        <FormAlert message={state.error} />
        <div className="flex flex-col gap-2">
          <label htmlFor="admin-image" className="type-label">
            Image
          </label>
          <input
            id="admin-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            aria-describedby="admin-image-hint"
            className="input-base py-3"
          />
          <p id="admin-image-hint" className="type-caption text-ink-muted">
            JPEG, PNG, WebP or AVIF, up to 5 MB.
          </p>
        </div>
        <button type="submit" className="btn btn-primary sm:self-start" disabled={pending}>
          {pending ? "Uploading…" : "Upload image"}
        </button>
      </form>

      {state.upload ? (
        <figure className="flex flex-col gap-3 border-t pt-8">
          {/* Plain <img>: uploads are served by the backend through the /uploads rewrite. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.upload.url}
            alt="Uploaded image preview"
            className="max-h-96 w-auto max-w-full self-start"
          />
          <figcaption className="type-caption text-ink-muted break-all">
            Saved as <code>{state.upload.url}</code> ({Math.ceil(state.upload.size / 1024)} KB)
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}
