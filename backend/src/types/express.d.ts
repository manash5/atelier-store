// Augments Express's Request with data attached by our middleware.
declare global {
  namespace Express {
    interface Request {
      /** Parsed output of the route's Zod schemas (set by `validate`). */
      validated: {
        params?: unknown;
        query?: unknown;
        body?: unknown;
      };
    }
  }
}

export {};
