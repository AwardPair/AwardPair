import { describe, expect, it } from "vitest";
import { searchPairCalendar } from "./searchPairCalendar";
import { searchPairs } from "./searchPairs";

describe("searchPairCalendar", () => {
  it("returns one calendar day per date in the requested range", async () => {
    const days = await searchPairCalendar({
      originAirportCodes: ["JFK", "EWR"],
      destinationAirportCodes: ["HND", "NRT"],
      startDate: "2026-04-01",
      endDate: "2026-04-05",
    });
    expect(days.map((d) => d.date)).toEqual([
      "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05",
    ]);
  });

  it("picks the highest-scoring Pair for each date as bestPair", async () => {
    const days = await searchPairCalendar({
      originAirportCodes: ["JFK", "EWR"],
      destinationAirportCodes: ["HND", "NRT"],
      startDate: "2026-04-01",
      endDate: "2026-04-11",
    });
    for (const day of days) {
      const pairsThatDay = await searchPairs({
        originAirportCodes: ["JFK", "EWR"],
        destinationAirportCodes: ["HND", "NRT"],
        earliestDeparture: day.date,
        latestDeparture: day.date,
      });
      expect(day.pairCount).toBe(pairsThatDay.length);
      if (pairsThatDay.length > 0) {
        expect(day.bestPair?.score.value).toBe(Math.max(...pairsThatDay.map((p) => p.score.value)));
      } else {
        expect(day.bestPair).toBeUndefined();
      }
    }
  });

  it("leaves bestPair undefined for dates with no viable Pair", async () => {
    const days = await searchPairCalendar({
      originAirportCodes: ["JFK"],
      destinationAirportCodes: ["HND"],
      startDate: "2030-01-01",
      endDate: "2030-01-02",
    });
    for (const day of days) {
      expect(day.bestPair).toBeUndefined();
      expect(day.pairCount).toBe(0);
    }
  });
});
