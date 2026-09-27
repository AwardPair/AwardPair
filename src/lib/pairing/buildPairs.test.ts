import { describe, expect, it } from "vitest";
import type { Airport, FlightOpportunity, HotelStayOpportunity, HotelProgramMembership } from "@/lib/domain";
import { assessRateConfidence } from "@/lib/domain";
import { buildPairs, type PairingContext } from "./buildPairs";

const HND: Airport = { iataCode: "HND", name: "Haneda", city: "Tokyo", countryCode: "JP", timeZone: "Asia/Tokyo" };

const FULL_COMPARABILITY = {
  propertyMatch: true, datesMatch: true, roomTypeKnown: true, occupancyKnown: true,
  refundabilityKnown: true, mealInclusionKnown: true, taxesAndFeesKnown: true,
};

function flight(id: string, arrivalAt: string): FlightOpportunity {
  return {
    id, provider: "mock", mileageProgram: { id: "prog", name: "Test" }, marketingAirline: "Test Air",
    originAirportCode: "JFK", destinationAirportCode: "HND",
    departureAt: "2026-04-01T00:00:00Z", arrivalAt,
    cabin: "business", pointsCost: 88000, taxesAndFees: { amount: 187, currency: "USD" },
    availableSeats: 2, stops: 0, freshness: { observedAt: "2026-03-01T00:00:00Z", source: "MOCK" },
  };
}

const MEMBERSHIP: HotelProgramMembership = {
  id: "mem-1", hotelId: "hotel-1", programId: "prog-1", validFrom: "2024-01-01",
  firstSeenAt: "2024-01-01T00:00:00Z", lastVerifiedAt: "2026-01-01T00:00:00Z", verificationMethod: "UNVERIFIED_DEMO",
};

function stay(checkInDate: string): HotelStayOpportunity {
  const checkOut = new Date(`${checkInDate}T00:00:00Z`);
  checkOut.setUTCDate(checkOut.getUTCDate() + 3);
  return {
    id: `stay-${checkInDate}`,
    hotel: { id: "hotel-1", name: "Test Hotel", city: "Tokyo", countryCode: "JP" },
    checkInDate,
    checkOutDate: checkOut.toISOString().slice(0, 10),
    rate: {
      id: `rate-${checkInDate}`, hotelId: "hotel-1", checkInDate, checkOutDate: checkOut.toISOString().slice(0, 10),
      nights: [0, 1, 2].map((i) => {
        const d = new Date(`${checkInDate}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + i);
        return { stayDate: d.toISOString().slice(0, 10), roomRate: { amount: 400, currency: "USD" } };
      }),
      taxes: { amount: 100, currency: "USD" }, mandatoryFees: { amount: 0, currency: "USD" },
      refundable: true, mealInclusion: "none", provenance: "MOCK_RATE",
      confidence: assessRateConfidence("MOCK_RATE", FULL_COMPARABILITY),
      freshness: { observedAt: "2026-03-01T00:00:00Z", source: "MOCK" },
    },
    activeMemberships: [MEMBERSHIP],
  };
}

const CONTEXT: PairingContext = {
  programBenefits: [], propertyBenefits: [], offers: [], walletCardBenefits: [],
  preferences: { userId: "u1", breakfastValuePerPerson: { value: 25, currency: "USD" }, propertyCreditUsableFraction: 0.75 },
  partySize: 2, today: "2026-03-01", isPrepaidBooking: true,
};

describe("buildPairs", () => {
  it("matches a hotel stay whose check-in date equals the flight's local arrival date", () => {
    // Arrives 2026-04-02T03:00:00Z -> 2026-04-02 12:00 in Tokyo (UTC+9).
    const pairs = buildPairs({
      flights: [flight("fl-1", "2026-04-02T03:00:00Z")],
      hotelStays: [stay("2026-04-02"), stay("2026-04-05")],
      destinationAirports: { HND: HND },
      context: CONTEXT,
    });
    expect(pairs).toHaveLength(1);
    expect(pairs[0].hotelStay.checkInDate).toBe("2026-04-02");
  });

  it("uses the destination-local date, not the UTC date, near the International Date Line boundary", () => {
    // 2026-04-01T16:00:00Z is 2026-04-02 01:00 in Tokyo — a UTC-date
    // truncation would incorrectly look for a 2026-04-01 check-in.
    const pairs = buildPairs({
      flights: [flight("fl-2", "2026-04-01T16:00:00Z")],
      hotelStays: [stay("2026-04-01"), stay("2026-04-02")],
      destinationAirports: { HND: HND },
      context: CONTEXT,
    });
    expect(pairs).toHaveLength(1);
    expect(pairs[0].hotelStay.checkInDate).toBe("2026-04-02");
  });

  it("produces no pair when no hotel stay matches the arrival date", () => {
    const pairs = buildPairs({
      flights: [flight("fl-3", "2026-04-10T03:00:00Z")],
      hotelStays: [stay("2026-04-02")],
      destinationAirports: { HND: HND },
      context: CONTEXT,
    });
    expect(pairs).toHaveLength(0);
  });

  it("sorts resulting pairs by score descending", () => {
    const pairs = buildPairs({
      flights: [flight("fl-4", "2026-04-02T03:00:00Z"), flight("fl-5", "2026-04-05T03:00:00Z")],
      hotelStays: [stay("2026-04-02"), stay("2026-04-05")],
      destinationAirports: { HND: HND },
      context: CONTEXT,
    });
    expect(pairs.length).toBeGreaterThan(0);
    const scores = pairs.map((p) => p.score.value);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
