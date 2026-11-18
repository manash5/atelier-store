import { ConflictError, NotFoundError } from "../exceptions";
import type { User } from "../models/user";
import { type AdminUserFilter, adminUserRepository } from "../repositories/admin-user.repository";
import { userRepository } from "../repositories/user.repository";
import type { Page } from "../types/pagination";

export type Role = "admin" | "user";

export const adminUserService = {
  async list(params: AdminUserFilter & { page: number; limit: number }): Promise<Page<User>> {
    const { page, limit, ...filter } = params;
    const [items, total] = await Promise.all([
      adminUserRepository.findPage((page - 1) * limit, limit, filter),
      adminUserRepository.count(filter),
    ]);
    return { items, meta: { page, limit, total } };
  },

  /**
   * Grants or removes admin access. Admins can't remove their own access, and
   * the last admin can never be demoted, so the store is never left without
   * one. The change applies to the target's next admin request (admin routes
   * re-check the database).
   */
  async setRole(actorId: string, targetId: string, role: Role): Promise<User> {
    const target = await userRepository.findById(targetId);
    if (!target) throw new NotFoundError("User not found");

    const isAdmin = target.role === "admin";
    if ((role === "admin") === isAdmin) return target;

    if (role === "admin" && target.banned) {
      throw new ConflictError("Suspended accounts can't be made admins");
    }
    if (role === "user") {
      if (target.id === actorId) {
        throw new ConflictError("You can't remove your own admin access");
      }
      if ((await adminUserRepository.countAdmins()) <= 1) {
        throw new ConflictError("The store needs at least one admin");
      }
    }

    await userRepository.setRole(target.id, role);
    const updated = await userRepository.findById(target.id);
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  },

  async adminCount(): Promise<number> {
    return adminUserRepository.countAdmins();
  },
};
