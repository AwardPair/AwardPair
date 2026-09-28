import type { CabinClass, FlightOpportunity } from "@/lib/domain";
import { mockFlightAvailabilityProvider } from "@/lib/providers/flights/mock";

export interface FlightSearchInput {
  originAirportCodes: string[];
  destinationAirportCodes: string[];
  earliestDeparture: string;
  latestDeparture: string;
  cabin?: CabinClass;
  maxPoints?: number;
  maxStops?: number;
}

export async function searchFlights(input: FlightSearchInput): Promise<FlightOpportunity[]> {
  return mockFlightAvailabilityProvider.search(input);
}
