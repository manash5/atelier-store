import { sql } from "drizzle-orm";

import { db } from "../database";

export const healthRepository = {
  async ping(): Promise<void> {
    await db.execute(sql`select 1`);
  },
};
