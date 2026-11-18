import type { CheckoutField, CheckoutState, ShippingAddress } from "../types";

// Checkout runs in demo mode: the card is validated for shape only, and only
// its last four digits ever leave the storefront server.

const LIMITS: Record<Exclude<CheckoutField, "cardNumber" | "cardExpiry" | "cardCvc">, number> = {
  fullName: 100,
  line1: 200,
  line2: 200,
  city: 100,
  postalCode: 20,
  country: 56,
  phone: 30,
  cardName: 100,
};

const REQUIRED: Partial<Record<CheckoutField, string>> = {
  fullName: "Enter the recipient's full name.",
  line1: "Enter a street address.",
  city: "Enter a city.",
  postalCode: "Enter a postal code.",
  country: "Enter a country.",
  cardName: "Enter the name on the card.",
};

/** Fields echoed back after a failed submit. Card details never are. */
const ECHOED: CheckoutField[] = ["fullName", "line1", "line2", "city", "postalCode", "country", "phone", "cardName"];

export type CheckoutResult =
  | {
      ok: true;
      shippingAddress: ShippingAddress;
      cardLast4: string;
      values: NonNullable<CheckoutState["values"]>;
    }
  | {
      ok: false;
      fieldErrors: NonNullable<CheckoutState["fieldErrors"]>;
      values: NonNullable<CheckoutState["values"]>;
    };

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** "MM/YY" in the current month or later. */
function validExpiry(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export function validateCheckout(formData: FormData): CheckoutResult {
  const read = (name: CheckoutField) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  const fieldErrors: NonNullable<CheckoutState["fieldErrors"]> = {};
  const values: NonNullable<CheckoutState["values"]> = {};
  for (const field of ECHOED) values[field] = read(field);

  for (const [field, message] of Object.entries(REQUIRED) as [CheckoutField, string][]) {
    if (!read(field)) fieldErrors[field] = message;
  }
  for (const [field, max] of Object.entries(LIMITS) as [CheckoutField, number][]) {
    if (read(field).length > max) fieldErrors[field] = `Use at most ${max} characters.`;
  }

  const cardNumber = read("cardNumber").replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(cardNumber) || !luhn(cardNumber)) {
    fieldErrors.cardNumber = "Enter a valid card number (for this demo, try 4242 4242 4242 4242).";
  }
  if (!validExpiry(read("cardExpiry"))) fieldErrors.cardExpiry = "Enter a future expiry date as MM/YY.";
  if (!/^\d{3,4}$/.test(read("cardCvc"))) fieldErrors.cardCvc = "Enter the 3 or 4 digit security code.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors, values };

  const optional = (value: string) => (value ? value : undefined);
  return {
    ok: true,
    shippingAddress: {
      fullName: read("fullName"),
      line1: read("line1"),
      line2: optional(read("line2")),
      city: read("city"),
      postalCode: read("postalCode"),
      country: read("country"),
      phone: optional(read("phone")),
    },
    cardLast4: cardNumber.slice(-4),
    values,
  };
}
