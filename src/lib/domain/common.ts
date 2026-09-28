/** ISO 8601 timestamp string, always UTC (`...Z`). */
export type Iso8601 = string;

/** IANA timezone identifier, e.g. "Asia/Tokyo". */
export type IanaTimeZone = string;

/** ISO 4217 currency code, e.g. "USD". */
export type CurrencyCode = string;

/**
 * Where a piece of data ultimately came from. Distinct from rate
 * provenance (see hotel.ts): this tags any observation, not just prices.
 */
export type DataSourceKind = "MOCK" | "LIVE_PROVIDER" | "USER_INPUT" | "MANUAL_VERIFICATION";

/** How stale an observation is, for UI freshness badges. */
export interface Freshness {
  observedAt: Iso8601;
  source: DataSourceKind;
  /** Present when the observation is known to expire (e.g. a quoted fare). */
  expiresAt?: Iso8601;
}

export function freshnessLabel(freshness: Freshness, now: Date = new Date()): string {
  const observed = new Date(freshness.observedAt);
  const ms = now.getTime() - observed.getTime();
  const minutes = Math.round(ms / 60_000);
  if (freshness.expiresAt && new Date(freshness.expiresAt) < now) return "Stale";
  if (minutes < 1) return "Observed just now";
  if (minutes < 60) return `Observed ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Observed ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `Observed ${days} day${days === 1 ? "" : "s"} ago${days > 3 ? " — needs verification" : ""}`;
}

/** A monetary amount in a specific currency; never mixed across currencies without conversion. */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add mismatched currencies: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract mismatched currencies: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount - b.amount, currency: a.currency };
}

export function zeroMoney(currency: CurrencyCode): Money {
  return { amount: 0, currency };
}
