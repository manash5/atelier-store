import { z } from "zod";

import type { User } from "../models/user";
import { UserRole } from "./auth.dto";

/** The signed-in user, returned by GET /api/v1/me. */
export const MeDto = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: UserRole,
  createdAt: z.iso.datetime(),
});
export type MeDto = z.infer<typeof MeDto>;

export function toMeDto(user: User): MeDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    role: user.role === "admin" ? "admin" : "user",
    createdAt: user.createdAt.toISOString(),
  };
}
