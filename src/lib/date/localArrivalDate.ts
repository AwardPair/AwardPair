import { formatInTimeZone } from "date-fns-tz";
import type { IanaTimeZone, Iso8601 } from "@/lib/domain/common";

/**
 * The calendar date (YYYY-MM-DD) on which a traveler arrives, in the
 * destination airport's own timezone. This is the only correct basis for a
 * hotel check-in date — never derive it from a UTC-truncated timestamp,
 * which silently shifts the date across the International Date Line and
 * around midnight UTC.
 */
export function localArrivalDate(arrivalAtUtc: Iso8601, destinationTimeZone: IanaTimeZone): string {
  return formatInTimeZone(new Date(arrivalAtUtc), destinationTimeZone, "yyyy-MM-dd");
}

/**
 * The default hotel check-in date for a flight: the local arrival date,
 * unless the caller (the user) has explicitly chosen a different date.
 */
export function defaultHotelCheckInDate(
  arrivalAtUtc: Iso8601,
  destinationTimeZone: IanaTimeZone,
  userOverride?: string,
): string {
  return userOverride ?? localArrivalDate(arrivalAtUtc, destinationTimeZone);
}
