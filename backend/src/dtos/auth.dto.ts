import { z } from "zod";

export const UserRole = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

/**
 * Claims of the JWT access tokens minted by Better Auth's jwt plugin
 * (see `definePayload` in lib/auth.ts). `sub` is the user id.
 */
export const AccessTokenPayload = z.object({
  sub: z.string().min(1),
  email: z.email(),
  name: z.string(),
  role: UserRole.catch("user"),
});
export type AccessTokenPayload = z.infer<typeof AccessTokenPayload>;
