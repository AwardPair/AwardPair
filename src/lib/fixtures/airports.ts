import type { Airport } from "@/lib/domain";

/** DEMO DATA: a minimal airport reference table covering the NYC<->Tokyo demo scenario. */
export const DEMO_AIRPORTS: Record<string, Airport> = {
  JFK: { iataCode: "JFK", name: "John F. Kennedy International", city: "New York", countryCode: "US", timeZone: "America/New_York" },
  EWR: { iataCode: "EWR", name: "Newark Liberty International", city: "Newark", countryCode: "US", timeZone: "America/New_York" },
  HND: { iataCode: "HND", name: "Tokyo Haneda", city: "Tokyo", countryCode: "JP", timeZone: "Asia/Tokyo" },
  NRT: { iataCode: "NRT", name: "Tokyo Narita", city: "Tokyo", countryCode: "JP", timeZone: "Asia/Tokyo" },
};
