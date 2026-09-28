import { DEMO_OUTBOUND_FLIGHTS } from "@/lib/fixtures/flights";
import type { FlightOpportunity } from "@/lib/domain";
import type { FlightAvailabilityProvider, FlightSearchParams } from "./types";

/**
 * Returns fixture award-flight data. No network access, no scraping — see
 * docs/data-sources.md for why a real provider isn't integrated yet.
 */
export class MockFlightAvailabilityProvider implements FlightAvailabilityProvider {
  readonly name = "mock-award-search";

  async search(params: FlightSearchParams): Promise<FlightOpportunity[]> {
    return DEMO_OUTBOUND_FLIGHTS.filter((flight) => {
      if (!params.originAirportCodes.includes(flight.originAirportCode)) return false;
      if (!params.destinationAirportCodes.includes(flight.destinationAirportCode)) return false;
      const departureDate = flight.departureAt.slice(0, 10);
      if (departureDate < params.earliestDeparture || departureDate > params.latestDeparture) return false;
      if (params.cabin && flight.cabin !== params.cabin) return false;
      if (params.maxPoints && flight.pointsCost > params.maxPoints) return false;
      if (params.maxStops !== undefined && flight.stops > params.maxStops) return false;
      return true;
    });
  }
}

export const mockFlightAvailabilityProvider = new MockFlightAvailabilityProvider();
