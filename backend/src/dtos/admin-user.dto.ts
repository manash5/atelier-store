import { z } from "zod";

import type { User } from "../models/user";
import { UserRole } from "./auth.dto";

export const AdminUserDto = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: UserRole,
  emailVerified: z.boolean(),
  banned: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type AdminUserDto = z.infer<typeof AdminUserDto>;

export const AdminUserListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value ? value : undefined)),
  role: UserRole.optional(),
});

export const AdminUserParams = z.object({ id: z.string().trim().min(1).max(64) });

export const SetUserRoleBody = z.object({ role: UserRole });

export function toAdminUserDto(user: User): AdminUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "user",
    emailVerified: user.emailVerified,
    banned: user.banned ?? false,
    createdAt: user.createdAt.toISOString(),
  };
}
