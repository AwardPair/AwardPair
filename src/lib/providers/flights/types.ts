import type { CabinClass, FlightOpportunity } from "@/lib/domain";

export interface FlightSearchParams {
  originAirportCodes: string[];
  destinationAirportCodes: string[];
  earliestDeparture: string;
  latestDeparture: string;
  cabin?: CabinClass;
  maxPoints?: number;
  maxStops?: number;
}

/**
 * The only seam through which AwardPair obtains award-flight availability.
 * Every implementation normalizes its own data into FlightOpportunity — the
 * rest of the app never sees a provider's raw shape.
 */
export interface FlightAvailabilityProvider {
  readonly name: string;
  search(params: FlightSearchParams): Promise<FlightOpportunity[]>;
}
