import type { Freshness, Iso8601, Money } from "./common";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

/**
 * A mileage/rewards program in which award space is denominated (e.g.
 * "United MileagePlus", "Virgin Atlantic Flying Club"). Not a database enum
 * — new programs are added as data, not schema changes.
 */
export interface MileageProgram {
  id: string;
  name: string;
  transferableFrom?: string[];
}

/**
 * One observed unit of bookable award-flight space, normalized from a
 * provider's raw response. Fields the provider did not supply are left
 * undefined rather than guessed.
 */
export interface FlightOpportunity {
  id: string;
  provider: string;
  mileageProgram: MileageProgram;
  marketingAirline: string;
  operatingAirline?: string;
  flightNumber?: string;
  originAirportCode: string;
  destinationAirportCode: string;
  /** UTC instant. Local time is derived via the airport's timeZone. */
  departureAt: Iso8601;
  arrivalAt: Iso8601;
  cabin: CabinClass;
  pointsCost: number;
  taxesAndFees: Money;
  availableSeats?: number;
  stops: number;
  /** Present only for multi-stop itineraries. */
  layoverAirportCodes?: string[];
  freshness: Freshness;
}
