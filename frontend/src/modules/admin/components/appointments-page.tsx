import { Suspense } from "react";

import { listAppointments } from "../api/admin.service";
import type { AppointmentStatus } from "../types";
import { AppointmentStatusButton } from "./appointment-status-button";
import { AdminPageHeader, dateFormat, dateTimeFormat, EmptyState, FilterBar, Pagination, TableSkeleton } from "./ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const preferredFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

async function AppointmentsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = one(params.q)?.trim() || undefined;
  const status = ["new", "contacted"].includes(one(params.status) ?? "")
    ? (one(params.status) as AppointmentStatus)
    : undefined;
  const page = Math.max(1, Number(one(params.page)) || 1);
  const { items, meta } = await listAppointments({ page, q, status });

  return (
    <>
      <FilterBar action="/admin/appointments">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="appointments-q" className="type-label">
            Search
          </label>
          <input id="appointments-q" name="q" defaultValue={q} placeholder="Name, email or phone" className="input-base" />
        </div>
        <div className="flex flex-col gap-2 sm:w-44">
          <label htmlFor="appointments-status" className="type-label">
            Status
          </label>
          <select id="appointments-status" name="status" defaultValue={status ?? ""} className="input-base">
            <option value="">All requests</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
          </select>
        </div>
      </FilterBar>

      {items.length === 0 ? (
        <EmptyState>No appointment requests match.</EmptyState>
      ) : (
        <ul className="border-t">
          {items.map((request) => (
            <li
              key={request.id}
              className={`grid gap-4 border-b py-5 sm:grid-cols-[minmax(0,1fr)_auto] ${request.status === "contacted" ? "text-ink-muted" : ""}`}
            >
              <div className="flex min-w-0 flex-col gap-2">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="type-body text-ink">{request.name}</span>
                  <span className="inline-flex items-center gap-2 type-caption">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${request.status === "new" ? "bg-sale" : "bg-success"}`}
                    />
                    {request.status === "new" ? "New" : "Contacted"}
                  </span>
                  {request.hasAccount ? <span className="border px-2 py-0.5 type-micro">Customer</span> : null}
                </p>
                <p className="flex flex-wrap gap-x-4 gap-y-1 type-body">
                  <a href={`mailto:${request.email}`} className="link-quiet break-all">
                    {request.email}
                  </a>
                  <a href={`tel:${request.phone.replace(/[^\d+]/g, "")}`} className="link-quiet">
                    {request.phone}
                  </a>
                </p>
                <p className="type-caption text-ink-muted">
                  {request.type === "video" ? "Video call" : "In-store"}
                  {request.preferredDate
                    ? ` · prefers ${preferredFormat.format(new Date(request.preferredDate))}`
                    : " · no date given"}
                  {` · received ${dateTimeFormat.format(new Date(request.createdAt))}`}
                </p>
                {request.note ? (
                  <p className="max-w-2xl border-l-2 border-line pl-3 type-body whitespace-pre-line">{request.note}</p>
                ) : null}
              </div>
              <div className="sm:pt-1">
                <AppointmentStatusButton id={request.id} status={request.status} />
                {request.status === "contacted" ? (
                  <p className="mt-1 text-right type-caption">
                    {dateFormat.format(new Date(request.updatedAt))}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination meta={meta} basePath="/admin/appointments" params={{ q, status }} />
    </>
  );
}

export function AdminAppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader
        eyebrow="Client services"
        title="Appointments"
        description="Requests from the booking form, newest first. Contact the client, then mark the request contacted."
      />
      <Suspense fallback={<TableSkeleton />}>
        <AppointmentsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
