import { describe, expect, it } from "vitest";
import type { ComputeHotelEconomicsParams } from "@/lib/economics/computeHotelEconomics";
import { computeHotelEconomics } from "@/lib/economics/computeHotelEconomics";
import type { FlightOpportunity } from "@/lib/domain";
import { assessRateConfidence } from "@/lib/domain";
import { computePairScore } from "./pairScore";

const FLIGHT: FlightOpportunity = {
  id: "fl-test",
  provider: "mock",
  mileageProgram: { id: "prog", name: "Test Program" },
  marketingAirline: "Test Air",
  originAirportCode: "JFK",
  destinationAirportCode: "HND",
  departureAt: "2026-04-01T00:00:00Z",
  arrivalAt: "2026-04-02T03:00:00Z",
  cabin: "business",
  pointsCost: 88000,
  taxesAndFees: { amount: 187, currency: "USD" },
  availableSeats: 2,
  stops: 0,
  freshness: { observedAt: "2026-03-01T00:00:00Z", source: "MOCK" },
};

const ECONOMICS_PARAMS: ComputeHotelEconomicsParams = {
  rate: {
    id: "rate-test",
    hotelId: "hotel-test",
    checkInDate: "2026-04-02",
    checkOutDate: "2026-04-05",
    nights: [
      { stayDate: "2026-04-02", roomRate: { amount: 400, currency: "USD" } },
      { stayDate: "2026-04-03", roomRate: { amount: 400, currency: "USD" } },
      { stayDate: "2026-04-04", roomRate: { amount: 400, currency: "USD" } },
    ],
    taxes: { amount: 120, currency: "USD" },
    mandatoryFees: { amount: 0, currency: "USD" },
    refundable: true,
    mealInclusion: "breakfast",
    provenance: "MOCK_RATE",
    confidence: assessRateConfidence("MOCK_RATE", {
      propertyMatch: true, datesMatch: true, roomTypeKnown: true, occupancyKnown: true,
      refundabilityKnown: true, mealInclusionKnown: true, taxesAndFeesKnown: true,
    }),
    freshness: { observedAt: "2026-03-01T00:00:00Z", source: "MOCK" },
  },
  candidateOffers: [],
  activeBenefits: [],
  preferences: { userId: "u1", breakfastValuePerPerson: { value: 25, currency: "USD" }, propertyCreditUsableFraction: 0.75 },
  partySize: 2,
  today: "2026-03-01",
};

describe("computePairScore", () => {
  it("is deterministic for identical inputs", () => {
    const economics = computeHotelEconomics(ECONOMICS_PARAMS);
    const first = computePairScore({ flight: FLIGHT, economics, confidence: "high", applicableOffers: [] });
    const second = computePairScore({ flight: FLIGHT, economics, confidence: "high", applicableOffers: [] });
    expect(second).toEqual(first);
  });

  it("stays within 0-100", () => {
    const economics = computeHotelEconomics(ECONOMICS_PARAMS);
    const score = computePairScore({ flight: FLIGHT, economics, confidence: "high", applicableOffers: [] });
    expect(score.value).toBeGreaterThanOrEqual(0);
    expect(score.value).toBeLessThanOrEqual(100);
  });

  it("sorts reasons by descending contribution", () => {
    const economics = computeHotelEconomics(ECONOMICS_PARAMS);
    const score = computePairScore({ flight: FLIGHT, economics, confidence: "high", applicableOffers: [] });
    const weights = score.reasons.map((r) => r.weight);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });

  it("scores low confidence lower than high confidence, all else equal", () => {
    const economics = computeHotelEconomics(ECONOMICS_PARAMS);
    const high = computePairScore({ flight: FLIGHT, economics, confidence: "high", applicableOffers: [] });
    const low = computePairScore({ flight: FLIGHT, economics, confidence: "low", applicableOffers: [] });
    expect(low.value).toBeLessThan(high.value);
  });

  it("scores a nonstop flight higher than a two-stop flight, all else equal", () => {
    const economics = computeHotelEconomics(ECONOMICS_PARAMS);
    const nonstop = computePairScore({ flight: FLIGHT, economics, confidence: "high", applicableOffers: [] });
    const twoStop = computePairScore({ flight: { ...FLIGHT, stops: 2 }, economics, confidence: "high", applicableOffers: [] });
    expect(twoStop.value).toBeLessThan(nonstop.value);
  });
});
