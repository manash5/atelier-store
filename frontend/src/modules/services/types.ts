// Hand-written mirrors of docs/api/api-contracts.md (appointments).

export type AppointmentType = "in_store" | "video";

/** POST /api/v1/appointments body. */
export type AppointmentInput = {
  name: string;
  email: string;
  phone: string;
  type: AppointmentType;
  preferredDate?: string;
  note?: string;
};

/** POST /api/v1/appointments response: a reference, not the client's details. */
export type AppointmentReceipt = {
  id: number;
  type: AppointmentType;
  preferredDate: string | null;
  createdAt: string;
};

export type AppointmentField = "name" | "email" | "phone" | "type" | "preferredDate" | "note";

/** State of the booking form's server action. */
export type AppointmentFormState = {
  error?: string;
  fieldErrors?: Partial<Record<AppointmentField, string>>;
  /** Echoed back after a failure so the form keeps what was typed. */
  values?: Partial<Record<AppointmentField, string>>;
  /** Set once the request is stored. */
  receipt?: AppointmentReceipt & { name: string; email: string };
};
