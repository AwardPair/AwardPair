import { describe, expect, it } from "vitest";
import { MockFlightAvailabilityProvider } from "./mock";

describe("MockFlightAvailabilityProvider", () => {
  const provider = new MockFlightAvailabilityProvider();

  it("only returns flights on the requested route", async () => {
    const results = await provider.search({
      originAirportCodes: ["JFK"],
      destinationAirportCodes: ["HND"],
      earliestDeparture: "2026-01-01",
      latestDeparture: "2026-12-31",
    });
    expect(results.length).toBeGreaterThan(0);
    for (const flight of results) {
      expect(flight.originAirportCode).toBe("JFK");
      expect(flight.destinationAirportCode).toBe("HND");
    }
  });

  it("filters out flights departing outside the requested date window", async () => {
    const results = await provider.search({
      originAirportCodes: ["JFK", "EWR"],
      destinationAirportCodes: ["HND", "NRT"],
      earliestDeparture: "2026-04-01",
      latestDeparture: "2026-04-01",
    });
    for (const flight of results) {
      expect(flight.departureAt.slice(0, 10)).toBe("2026-04-01");
    }
  });

  it("filters by cabin when requested", async () => {
    const results = await provider.search({
      originAirportCodes: ["JFK", "EWR"],
      destinationAirportCodes: ["HND", "NRT"],
      earliestDeparture: "2026-01-01",
      latestDeparture: "2026-12-31",
      cabin: "first",
    });
    expect(results.length).toBeGreaterThan(0);
    for (const flight of results) {
      expect(flight.cabin).toBe("first");
    }
  });

  it("filters by maxStops", async () => {
    const results = await provider.search({
      originAirportCodes: ["JFK", "EWR"],
      destinationAirportCodes: ["HND", "NRT"],
      earliestDeparture: "2026-01-01",
      latestDeparture: "2026-12-31",
      maxStops: 0,
    });
    for (const flight of results) {
      expect(flight.stops).toBe(0);
    }
  });

  it("returns no results for a route with no fixture data", async () => {
    const results = await provider.search({
      originAirportCodes: ["LAX"],
      destinationAirportCodes: ["HND"],
      earliestDeparture: "2026-01-01",
      latestDeparture: "2026-12-31",
    });
    expect(results).toHaveLength(0);
  });
});
