// Hand-written mirrors of docs/api/api-contracts.md (auth section).

export type UserRole = "user" | "admin";

/** GET /api/v1/me */
export type Me = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
};

/** POST /api/v1/admin/uploads */
export type Upload = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};

/** State returned by the sign-in and sign-up server actions. */
export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  /** Echoed back so the form keeps what the visitor typed. */
  values?: { name?: string; email?: string };
};

/** State returned by the admin upload server action. */
export type UploadFormState = { error?: string; upload?: Upload };
