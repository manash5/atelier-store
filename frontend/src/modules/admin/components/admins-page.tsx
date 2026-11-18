import { decodeJwt } from "jose";
import { Suspense } from "react";

import { getAccessToken } from "@/shared/lib/auth-cookies";

import { listUsers } from "../api/admin.service";
import { RoleButton } from "./role-button";
import { AdminPageHeader, dateFormat, EmptyState, FilterBar, Pagination, TableSkeleton } from "./ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function AdminsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = one(params.q)?.trim() || undefined;
  const role = ["admin", "user"].includes(one(params.role) ?? "") ? one(params.role) : undefined;
  const page = Math.max(1, Number(one(params.page)) || 1);
  const [{ items, meta }, token] = await Promise.all([listUsers({ page, q, role }), getAccessToken()]);
  const selfId = token ? decodeJwt(token).sub : undefined;

  return (
    <>
      <FilterBar action="/admin/admins">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="users-q" className="type-label">
            Find a customer
          </label>
          <input id="users-q" name="q" defaultValue={q} placeholder="Name or email" className="input-base" />
        </div>
        <div className="flex flex-col gap-2 sm:w-44">
          <label htmlFor="users-role" className="type-label">
            Show
          </label>
          <select id="users-role" name="role" defaultValue={role ?? ""} className="input-base">
            <option value="">Everyone</option>
            <option value="admin">Admins</option>
            <option value="user">Customers</option>
          </select>
        </div>
      </FilterBar>

      {items.length === 0 ? (
        <EmptyState>No accounts match.</EmptyState>
      ) : (
        <ul className="border-t">
          {items.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-4 border-b py-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body">
                  <span className="truncate">{user.name}</span>
                  {user.role === "admin" ? (
                    <span className="border px-2 py-0.5 type-micro">Admin</span>
                  ) : null}
                  {user.banned ? (
                    <span className="border border-sale px-2 py-0.5 type-micro text-sale">Suspended</span>
                  ) : null}
                </p>
                <p className="truncate type-caption text-ink-muted">
                  {user.email} · joined {dateFormat.format(new Date(user.createdAt))}
                </p>
              </div>
              <RoleButton user={user} isSelf={user.id === selfId} />
            </li>
          ))}
        </ul>
      )}
      <Pagination meta={meta} basePath="/admin/admins" params={{ q, role }} />
    </>
  );
}

export function AdminAdminsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader
        eyebrow="Access"
        title="Admins"
        description="Admins can edit the catalog, change orders and manage other admins. You can't remove your own access, and the last admin can't be removed."
      />
      <Suspense fallback={<TableSkeleton />}>
        <AdminsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
