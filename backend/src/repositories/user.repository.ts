import { eq } from "drizzle-orm";

import { db } from "../database";
import { user } from "../database/schema";
import type { User } from "../models/user";

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const row = await db.query.user.findFirst({ where: (table, { eq }) => eq(table.id, id) });
    return row ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const row = await db.query.user.findFirst({
      where: (table, { eq }) => eq(table.email, email.toLowerCase()),
    });
    return row ?? null;
  },

  async setRole(id: string, role: string): Promise<void> {
    await db.update(user).set({ role }).where(eq(user.id, id));
  },
};
