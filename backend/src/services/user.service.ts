import { ForbiddenError, UnauthorizedError } from "../exceptions";
import type { User } from "../models/user";
import { userRepository } from "../repositories/user.repository";

export const userService = {
  /** The user behind a verified token. 401 if the account no longer exists. */
  async getCurrent(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError("Account no longer exists");
    if (user.banned) throw new UnauthorizedError("Account is suspended");
    return user;
  },

  /**
   * Admin routes re-check the database on every request, so demoting or
   * banning an admin takes effect immediately instead of when their
   * 15-minute access token expires.
   */
  async assertActiveAdmin(userId: string): Promise<User> {
    const user = await this.getCurrent(userId);
    if (user.role !== "admin") throw new ForbiddenError("Admin access required");
    return user;
  },
};
