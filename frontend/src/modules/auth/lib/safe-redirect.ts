/** Only same-site relative paths are allowed as post-sign-in destinations. */
export function safeRedirect(target: unknown, fallback = "/account"): string {
  if (typeof target !== "string") return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  return target;
}
