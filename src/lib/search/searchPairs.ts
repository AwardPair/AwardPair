import type { Pair } from "@/lib/domain";
import { DEMO_AIRPORTS } from "@/lib/fixtures/airports";
import { buildPairs } from "@/lib/pairing/buildPairs";
import { demoPairingContext } from "./demoContext";
import { buildHotelStayOpportunities } from "./hotelStays";
import { searchFlights, type FlightSearchInput } from "./searchFlights";
import { demoHotelsForCity } from "@/lib/fixtures/hotels";

export type PairSearchInput = FlightSearchInput;

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function searchPairs(input: PairSearchInput): Promise<Pair[]> {
  const flights = await searchFlights(input);
  if (flights.length === 0) return [];

  const destinationCities = new Set(
    input.destinationAirportCodes.map((code) => DEMO_AIRPORTS[code]?.city).filter((city): city is string => Boolean(city)),
  );
  const hotelIds = [...destinationCities].flatMap((city) => demoHotelsForCity(city).map((h) => h.id));
  if (hotelIds.length === 0) return [];

  const hotelStays = await buildHotelStayOpportunities({
    hotelIds,
    checkInDate: input.earliestDeparture,
    checkOutDate: addDays(input.latestDeparture, 20),
  });

  return buildPairs({
    flights,
    hotelStays,
    destinationAirports: DEMO_AIRPORTS,
    context: demoPairingContext(),
  });
}
