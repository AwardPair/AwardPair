import { describe, expect, it } from "vitest";
import {
  DEFAULT_EXPLORE_SEARCH_PARAMS,
  exploreParamsToFlightSearchInput,
  parseExploreSearchParams,
} from "./parseExploreSearchParams";

describe("parseExploreSearchParams", () => {
  it("returns the default window/airports/tab when given no params", () => {
    expect(parseExploreSearchParams({})).toEqual(DEFAULT_EXPLORE_SEARCH_PARAMS);
  });

  it("parses a fully-specified, valid set of params", () => {
    const result = parseExploreSearchParams({
      tab: "flights",
      from: "EWR",
      to: "NRT",
      departFrom: "2026-04-03",
      departTo: "2026-04-09",
      cabin: "business",
      maxPoints: "90000",
      maxStops: "1",
    });
    expect(result).toEqual({
      tab: "flights",
      from: "EWR",
      to: "NRT",
      departFrom: "2026-04-03",
      departTo: "2026-04-09",
      cabin: "business",
      maxPoints: 90000,
      maxStops: 1,
    });
  });

  it("accepts a URLSearchParams instance directly", () => {
    const params = new URLSearchParams("tab=hotels&from=EWR&to=NRT");
    const result = parseExploreSearchParams(params);
    expect(result.tab).toBe("hotels");
    expect(result.from).toBe("EWR");
    expect(result.to).toBe("NRT");
  });

  it("takes the first value when a param is repeated (array form)", () => {
    const result = parseExploreSearchParams({ from: ["EWR", "JFK"], to: ["NRT", "HND"] });
    expect(result.from).toBe("EWR");
    expect(result.to).toBe("NRT");
  });

  it("falls back to the default tab for an unknown tab value", () => {
    const result = parseExploreSearchParams({ tab: "not-a-real-tab" });
    expect(result.tab).toBe("pairs");
  });

  it("falls back to the default airports for codes outside the fixture universe", () => {
    const result = parseExploreSearchParams({ from: "LAX", to: "JFK" });
    expect(result.from).toBe("JFK");
    expect(result.to).toBe("HND");
  });

  it("falls back to the default window for a malformed date", () => {
    const result = parseExploreSearchParams({ departFrom: "not-a-date", departTo: "2026-13-40" });
    expect(result.departFrom).toBe("2026-04-01");
    expect(result.departTo).toBe("2026-04-11");
  });

  it("rejects an impossible calendar date (e.g. Feb 30) instead of silently rolling it over", () => {
    const result = parseExploreSearchParams({ departFrom: "2026-02-30" });
    expect(result.departFrom).toBe("2026-04-01");
  });

  it("falls back to the default window when the range is reversed", () => {
    const result = parseExploreSearchParams({ departFrom: "2026-04-10", departTo: "2026-04-02" });
    expect(result.departFrom).toBe("2026-04-01");
    expect(result.departTo).toBe("2026-04-11");
  });

  it("accepts a valid date range outside the fixture window without altering it (so search can legitimately return empty)", () => {
    const result = parseExploreSearchParams({ departFrom: "2026-05-01", departTo: "2026-05-05" });
    expect(result.departFrom).toBe("2026-05-01");
    expect(result.departTo).toBe("2026-05-05");
  });

  it("drops an invalid cabin value instead of defaulting to a fixed cabin", () => {
    const result = parseExploreSearchParams({ cabin: "suite" });
    expect(result.cabin).toBeUndefined();
  });

  it("accepts every valid cabin class", () => {
    for (const cabin of ["economy", "premium_economy", "business", "first"]) {
      expect(parseExploreSearchParams({ cabin }).cabin).toBe(cabin);
    }
  });

  it("drops a non-numeric or non-positive maxPoints", () => {
    expect(parseExploreSearchParams({ maxPoints: "abc" }).maxPoints).toBeUndefined();
    expect(parseExploreSearchParams({ maxPoints: "-5" }).maxPoints).toBeUndefined();
    expect(parseExploreSearchParams({ maxPoints: "0" }).maxPoints).toBeUndefined();
  });

  it("parses a valid maxPoints", () => {
    expect(parseExploreSearchParams({ maxPoints: "50000" }).maxPoints).toBe(50000);
  });

  it("drops a non-numeric or negative maxStops but allows zero", () => {
    expect(parseExploreSearchParams({ maxStops: "abc" }).maxStops).toBeUndefined();
    expect(parseExploreSearchParams({ maxStops: "-1" }).maxStops).toBeUndefined();
    expect(parseExploreSearchParams({ maxStops: "0" }).maxStops).toBe(0);
    expect(parseExploreSearchParams({ maxStops: "2" }).maxStops).toBe(2);
  });
});

describe("exploreParamsToFlightSearchInput", () => {
  it("maps explore params onto the FlightSearchInput shape", () => {
    const input = exploreParamsToFlightSearchInput({
      tab: "pairs",
      from: "JFK",
      to: "HND",
      departFrom: "2026-04-01",
      departTo: "2026-04-11",
      cabin: "business",
      maxPoints: 90000,
      maxStops: 1,
    });
    expect(input).toEqual({
      originAirportCodes: ["JFK"],
      destinationAirportCodes: ["HND"],
      earliestDeparture: "2026-04-01",
      latestDeparture: "2026-04-11",
      cabin: "business",
      maxPoints: 90000,
      maxStops: 1,
    });
  });
});
