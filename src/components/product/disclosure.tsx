import type { ReactNode } from "react";

import { PlusIcon } from "@/components/icons";

type DisclosureProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

// Native <details> accordion row: keyboard and screen-reader support with no
// client JavaScript. Stack several inside a `border-b` wrapper.
export function Disclosure({ title, children, defaultOpen }: DisclosureProps) {
  return (
    <details className="group border-t" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 type-label [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6 type-body text-ink-muted">{children}</div>
    </details>
  );
}
