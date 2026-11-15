import Link from "next/link";

type SectionHeadingProps = {
  id: string;
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
};

export function SectionHeading({ id, title, eyebrow, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        {eyebrow ? (
          <p className="mb-3 type-label text-ink-muted">{eyebrow}</p>
        ) : null}
        <h2 id={id} className="type-heading">
          {title}
        </h2>
      </div>
      {action ? (
        <Link href={action.href} className="mb-1 shrink-0 type-label link">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
