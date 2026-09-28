import { describe, expect, it } from "vitest";
import { searchPairs } from "./searchPairs";

describe("searchPairs (end-to-end demo wiring)", () => {
  it("produces at least one Pair for the NYC -> Tokyo demo scenario", async () => {
    const pairs = await searchPairs({
      originAirportCodes: ["JFK", "EWR"],
      destinationAirportCodes: ["HND", "NRT"],
      earliestDeparture: "2026-04-01",
      latestDeparture: "2026-04-11",
    });
    expect(pairs.length).toBeGreaterThan(0);
    for (const pair of pairs) {
      expect(pair.economics.netCashCost.amount).toBeGreaterThanOrEqual(0);
      expect(pair.score.value).toBeGreaterThanOrEqual(0);
      expect(pair.score.value).toBeLessThanOrEqual(100);
    }
  });

  it("returns no pairs for a route/date window with no fixture flights", async () => {
    const pairs = await searchPairs({
      originAirportCodes: ["JFK"],
      destinationAirportCodes: ["HND"],
      earliestDeparture: "2030-01-01",
      latestDeparture: "2030-01-05",
    });
    expect(pairs).toHaveLength(0);
  });
});
