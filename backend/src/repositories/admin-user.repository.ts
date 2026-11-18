import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "../database";
import { user } from "../database/schema";
import type { User } from "../models/user";

export type AdminUserFilter = {
  /** Partial match on name or email. */
  search?: string | undefined;
  /** `admin`: admins only; `user`: everyone else. */
  role?: "admin" | "user" | undefined;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function userWhere({ search, role }: AdminUserFilter): SQL | undefined {
  const pattern = search ? `%${escapeLike(search)}%` : undefined;
  return and(
    pattern ? or(ilike(user.name, pattern), ilike(user.email, pattern)) : undefined,
    role === "admin" ? eq(user.role, "admin") : undefined,
    role === "user" ? sql`coalesce(${user.role}, 'user') <> 'admin'` : undefined,
  );
}

export const adminUserRepository = {
  /** Admins first, then newest accounts. */
  async findPage(offset: number, limit: number, filter: AdminUserFilter): Promise<User[]> {
    return db
      .select()
      .from(user)
      .where(userWhere(filter))
      .orderBy(
        sql`case when ${user.role} = 'admin' then 0 else 1 end`,
        desc(user.createdAt),
        asc(user.id),
      )
      .offset(offset)
      .limit(limit);
  },

  async count(filter: AdminUserFilter): Promise<number> {
    return db.$count(user, userWhere(filter));
  },

  async countAdmins(): Promise<number> {
    return db.$count(user, eq(user.role, "admin"));
  },
};
