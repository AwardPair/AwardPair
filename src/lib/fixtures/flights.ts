import type { CabinClass, FlightOpportunity, MileageProgram } from "@/lib/domain";
import { DEMO_AIRPORTS } from "./airports";

/**
 * DEMO DATA — illustrative award-flight observations for the NYC<->Tokyo
 * fixture scenario. Prices, availability, and programs are not live and
 * must not be treated as current. See docs/data-sources.md.
 */

const UNITED: MileageProgram = { id: "united-mileageplus", name: "United MileagePlus", transferableFrom: ["Chase Ultimate Rewards"] };
const ANA: MileageProgram = { id: "ana-mileage-club", name: "ANA Mileage Club", transferableFrom: ["Amex Membership Rewards", "Marriott Bonvoy"] };
const VIRGIN: MileageProgram = { id: "virgin-flying-club", name: "Virgin Atlantic Flying Club", transferableFrom: ["Amex Membership Rewards", "Chase Ultimate Rewards"] };
const AA: MileageProgram = { id: "aadvantage", name: "American AAdvantage" };

const OBSERVED_AT = "2026-09-27T12:00:00Z";

interface FixtureFlightInput {
  id: string;
  provider: string;
  mileageProgram: MileageProgram;
  marketingAirline: string;
  operatingAirline?: string;
  flightNumber: string;
  origin: "JFK" | "EWR";
  destination: "HND" | "NRT";
  departureLocal: string;
  arrivalUtc: string;
  cabin: CabinClass;
  pointsCost: number;
  taxesUsd: number;
  availableSeats: number;
  stops: number;
}

function buildFlight(input: FixtureFlightInput): FlightOpportunity {
  const origin = DEMO_AIRPORTS[input.origin];
  const departureUtc = new Date(`${input.departureLocal}:00-04:00`).toISOString();
  return {
    id: input.id,
    provider: "mock-award-search",
    mileageProgram: input.mileageProgram,
    marketingAirline: input.marketingAirline,
    operatingAirline: input.operatingAirline,
    flightNumber: input.flightNumber,
    originAirportCode: origin.iataCode,
    destinationAirportCode: DEMO_AIRPORTS[input.destination].iataCode,
    departureAt: departureUtc,
    arrivalAt: input.arrivalUtc,
    cabin: input.cabin,
    pointsCost: input.pointsCost,
    taxesAndFees: { amount: input.taxesUsd, currency: "USD" },
    availableSeats: input.availableSeats,
    stops: input.stops,
    freshness: { observedAt: OBSERVED_AT, source: "MOCK" },
  };
}

/**
 * Ten JFK/EWR -> HND/NRT award opportunities spread across a two-week demo
 * window, deliberately varied across cabin, program, and stops so the
 * Pairs/Flights/Calendar views have something meaningful to differentiate.
 */
export const DEMO_OUTBOUND_FLIGHTS: FlightOpportunity[] = [
  buildFlight({
    id: "fl-001", provider: "mock-award-search", mileageProgram: ANA, marketingAirline: "ANA", flightNumber: "NH010",
    origin: "JFK", destination: "HND", departureLocal: "2026-04-01T00:10", arrivalUtc: "2026-04-02T03:35:00Z",
    cabin: "first", pointsCost: 110000, taxesUsd: 235, availableSeats: 1, stops: 0,
  }),
  buildFlight({
    id: "fl-002", provider: "mock-award-search", mileageProgram: UNITED, marketingAirline: "United", flightNumber: "UA079",
    origin: "EWR", destination: "HND", departureLocal: "2026-04-01T13:25", arrivalUtc: "2026-04-02T16:50:00Z",
    cabin: "business", pointsCost: 88000, taxesUsd: 187, availableSeats: 2, stops: 0,
  }),
  buildFlight({
    id: "fl-003", provider: "mock-award-search", mileageProgram: VIRGIN, marketingAirline: "ANA", operatingAirline: "ANA", flightNumber: "NH108",
    origin: "JFK", destination: "NRT", departureLocal: "2026-04-02T11:00", arrivalUtc: "2026-04-03T14:15:00Z",
    cabin: "business", pointsCost: 60000, taxesUsd: 210, availableSeats: 3, stops: 0,
  }),
  buildFlight({
    id: "fl-004", provider: "mock-award-search", mileageProgram: AA, marketingAirline: "Japan Airlines", operatingAirline: "Japan Airlines", flightNumber: "JL005",
    origin: "JFK", destination: "HND", departureLocal: "2026-04-03T12:35", arrivalUtc: "2026-04-04T15:55:00Z",
    cabin: "first", pointsCost: 140000, taxesUsd: 260, availableSeats: 1, stops: 0,
  }),
  buildFlight({
    id: "fl-005", provider: "mock-award-search", mileageProgram: UNITED, marketingAirline: "United", flightNumber: "UA803",
    origin: "EWR", destination: "NRT", departureLocal: "2026-04-04T09:15", arrivalUtc: "2026-04-05T12:40:00Z",
    cabin: "premium_economy", pointsCost: 42000, taxesUsd: 165, availableSeats: 4, stops: 0,
  }),
  buildFlight({
    id: "fl-006", provider: "mock-award-search", mileageProgram: ANA, marketingAirline: "United", operatingAirline: "United", flightNumber: "UA837",
    origin: "EWR", destination: "HND", departureLocal: "2026-04-05T10:05", arrivalUtc: "2026-04-06T13:30:00Z",
    cabin: "business", pointsCost: 85000, taxesUsd: 178, availableSeats: 2, stops: 0,
  }),
  buildFlight({
    id: "fl-007", provider: "mock-award-search", mileageProgram: AA, marketingAirline: "American", operatingAirline: "American", flightNumber: "AA171",
    origin: "JFK", destination: "NRT", departureLocal: "2026-04-06T13:45", arrivalUtc: "2026-04-07T17:05:00Z",
    cabin: "economy", pointsCost: 32000, taxesUsd: 132, availableSeats: 6, stops: 1,
  }),
  buildFlight({
    id: "fl-008", provider: "mock-award-search", mileageProgram: VIRGIN, marketingAirline: "ANA", operatingAirline: "ANA", flightNumber: "NH010",
    origin: "JFK", destination: "HND", departureLocal: "2026-04-07T00:10", arrivalUtc: "2026-04-08T03:35:00Z",
    cabin: "first", pointsCost: 120000, taxesUsd: 235, availableSeats: 1, stops: 0,
  }),
  buildFlight({
    id: "fl-009", provider: "mock-award-search", mileageProgram: UNITED, marketingAirline: "United", flightNumber: "UA079",
    origin: "EWR", destination: "HND", departureLocal: "2026-04-08T13:25", arrivalUtc: "2026-04-09T16:50:00Z",
    cabin: "business", pointsCost: 88000, taxesUsd: 187, availableSeats: 5, stops: 0,
  }),
  buildFlight({
    id: "fl-010", provider: "mock-award-search", mileageProgram: ANA, marketingAirline: "ANA", flightNumber: "NH108",
    origin: "JFK", destination: "NRT", departureLocal: "2026-04-10T11:00", arrivalUtc: "2026-04-11T14:15:00Z",
    cabin: "business", pointsCost: 65000, taxesUsd: 210, availableSeats: 2, stops: 0,
  }),
];
