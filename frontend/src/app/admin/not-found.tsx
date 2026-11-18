import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-section-sm">
      <p className="type-label text-ink-muted">Not found</p>
      <h1 className="type-heading">This record doesn&rsquo;t exist</h1>
      <p className="type-body text-ink-muted">It may have been renamed, or the link is wrong.</p>
      <Link href="/admin" className="btn btn-primary">
        Back to overview
      </Link>
    </section>
  );
}
