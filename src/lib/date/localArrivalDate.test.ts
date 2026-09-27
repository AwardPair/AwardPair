import { describe, expect, it } from "vitest";
import { defaultHotelCheckInDate, localArrivalDate } from "./localArrivalDate";

describe("localArrivalDate", () => {
  it("uses the destination's local calendar date, not the UTC date", () => {
    // Depart JFK 2026-03-12 23:10 EDT (2026-03-13T03:10:00Z), arrive HND
    // 2026-03-14T14:35:00Z, which is 2026-03-14 23:35 local Tokyo time.
    const arrivalUtc = "2026-03-14T14:35:00Z";
    expect(localArrivalDate(arrivalUtc, "Asia/Tokyo")).toBe("2026-03-14");
  });

  it("rolls the date forward across the International Date Line", () => {
    // 2026-06-01T10:00:00Z is 2026-06-01 00:00 in Auckland (UTC+14 in NZ
    // daylight time / DST period does not apply in June, NZ standard is
    // UTC+12) — use a case that unambiguously crosses midnight forward.
    // 23:30 UTC on 2026-01-05 is 12:30 the *next* day in Auckland (UTC+13 in
    // NZ summer time).
    const arrivalUtc = "2026-01-05T23:30:00Z";
    expect(localArrivalDate(arrivalUtc, "Pacific/Auckland")).toBe("2026-01-06");
    // The same instant is still the earlier date in a timezone behind UTC.
    expect(localArrivalDate(arrivalUtc, "Pacific/Honolulu")).toBe("2026-01-05");
  });

  it("rolls the date backward for timezones behind UTC near midnight", () => {
    // 2026-07-01T02:00:00Z is 2026-06-30 16:00 in Honolulu (UTC-10).
    const arrivalUtc = "2026-07-01T02:00:00Z";
    expect(localArrivalDate(arrivalUtc, "Pacific/Honolulu")).toBe("2026-06-30");
  });

  it("never derives the date by truncating the UTC timestamp", () => {
    // 2026-03-14T14:35:00Z's UTC date is 2026-03-14, which happens to match
    // Tokyo here — pick a timezone where truncating UTC would be wrong.
    const arrivalUtc = "2026-03-14T01:00:00Z"; // 2026-03-14 10:00 in Tokyo, but 2026-03-13 15:00 in New York.
    expect(localArrivalDate(arrivalUtc, "America/New_York")).toBe("2026-03-13");
    expect(localArrivalDate(arrivalUtc, "Asia/Tokyo")).toBe("2026-03-14");
  });
});

describe("defaultHotelCheckInDate", () => {
  it("defaults to the local arrival date", () => {
    expect(defaultHotelCheckInDate("2026-03-14T14:35:00Z", "Asia/Tokyo")).toBe("2026-03-14");
  });

  it("respects an explicit user override", () => {
    expect(defaultHotelCheckInDate("2026-03-14T14:35:00Z", "Asia/Tokyo", "2026-03-15")).toBe("2026-03-15");
  });
});
