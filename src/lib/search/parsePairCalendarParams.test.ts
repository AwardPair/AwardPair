import { describe, expect, it } from "vitest";
import { DEFAULT_PAIR_CALENDAR_PARAMS, parsePairCalendarParams } from "./parsePairCalendarParams";

describe("parsePairCalendarParams", () => {
  it("defaults when given no params", () => {
    expect(parsePairCalendarParams({})).toEqual(DEFAULT_PAIR_CALENDAR_PARAMS);
  });

  it("accepts a valid from/to pair", () => {
    expect(parsePairCalendarParams({ from: "EWR", to: "NRT" })).toEqual({ from: "EWR", to: "NRT" });
  });

  it("falls back to defaults for an airport outside the fixture set", () => {
    expect(parsePairCalendarParams({ from: "LAX", to: "NRT" })).toEqual({ from: DEFAULT_PAIR_CALENDAR_PARAMS.from, to: "NRT" });
  });

  it("reads from a URLSearchParams instance", () => {
    const params = new URLSearchParams("from=EWR&to=HND");
    expect(parsePairCalendarParams(params)).toEqual({ from: "EWR", to: "HND" });
  });

  it("takes the first value when a param repeats", () => {
    expect(parsePairCalendarParams({ from: ["EWR", "JFK"] })).toEqual({ from: "EWR", to: DEFAULT_PAIR_CALENDAR_PARAMS.to });
  });
});
