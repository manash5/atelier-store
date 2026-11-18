import { AdminUploadForm } from "./admin-upload-form";

// Access is checked three times: proxy.ts (admin role in the verified JWT),
// uploadImageAction (token present) and the backend (authorize + authorizeAdmin).
export function AdminPage() {
  return (
    <section className="container-content py-section">
      <p className="type-label text-ink-muted">Admin</p>
      <h1 className="mt-4 type-display">Upload images</h1>
      <p className="mt-4 type-body-lg text-ink-muted">
        Upload product or editorial imagery. Files are stored by the API and served from
        /uploads.
      </p>
      <div className="mt-10">
        <AdminUploadForm />
      </div>
    </section>
  );
}
