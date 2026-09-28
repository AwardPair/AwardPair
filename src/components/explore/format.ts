import { formatInTimeZone } from "date-fns-tz";
import type { CabinClass, IanaTimeZone, Iso8601, Money, RateProvenance } from "@/lib/domain";

/** `$1,234` — always whole dollars; AwardPair's fixture money is USD-only. */
export function formatMoney(money: Money): string {
  return money.amount.toLocaleString("en-US", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  });
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString("en-US")} pts`;
}

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

export function formatCabin(cabin: CabinClass): string {
  return CABIN_LABELS[cabin];
}

export function formatStops(stops: number): string {
  if (stops === 0) return "Nonstop";
  return `${stops} stop${stops === 1 ? "" : "s"}`;
}

/** A UTC instant rendered as a local date + time string in the given airport's timezone. */
export function formatLocalDateTime(instant: Iso8601, timeZone: IanaTimeZone): string {
  return formatInTimeZone(new Date(instant), timeZone, "MMM d, h:mm a");
}

export function formatLocalDate(instant: Iso8601, timeZone: IanaTimeZone): string {
  return formatInTimeZone(new Date(instant), timeZone, "MMM d, yyyy");
}

/** `2026-04-03` -> `Apr 3, 2026`, for calendar-date strings (hotel check-in/out) that have no timezone of their own. */
export function formatCalendarDate(dateStr: string): string {
  return formatInTimeZone(new Date(`${dateStr}T00:00:00Z`), "UTC", "MMM d, yyyy");
}

/**
 * Copy for a rate's provenance, written so it never overstates confidence —
 * only LIVE_PROGRAM_RATE/USER_VERIFIED_RATE describe an actual booking price.
 */
export const RATE_PROVENANCE_LABELS: Record<RateProvenance, string> = {
  LIVE_PROGRAM_RATE: "Live program rate",
  REFERENCE_RATE: "Reference rate — not a live booking price",
  USER_VERIFIED_RATE: "User-verified rate",
  CACHED_OBSERVATION: "Cached observation",
  MOCK_RATE: "DEMO DATA — reference rate, not a live booking price",
};
