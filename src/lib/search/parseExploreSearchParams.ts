import type { CabinClass } from "@/lib/domain";
import type { FlightSearchInput } from "./searchFlights";

/**
 * Standalone, pure URL-param parsing for the /explore page: turns the raw
 * query string (however Next.js or a client hook hands it to us) into a
 * fully-defaulted, typed shape. Anything malformed or out of the known
 * option set silently falls back to the default rather than throwing or
 * propagating garbage into a downstream search call.
 */

export type ExploreTab = "pairs" | "flights" | "hotels";

export const EXPLORE_TABS: readonly ExploreTab[] = ["pairs", "flights", "hotels"];

/** DEMO DATA constraint: the fixture universe only has award flights from these origins. */
export const ORIGIN_AIRPORT_CODES = ["JFK", "EWR"] as const;
/** DEMO DATA constraint: the fixture universe only has award flights to these destinations. */
export const DESTINATION_AIRPORT_CODES = ["HND", "NRT"] as const;

export type OriginAirportCode = (typeof ORIGIN_AIRPORT_CODES)[number];
export type DestinationAirportCode = (typeof DESTINATION_AIRPORT_CODES)[number];

export const CABIN_CLASSES: readonly CabinClass[] = ["economy", "premium_economy", "business", "first"];

/** Matches the flight fixture window (see src/lib/fixtures/flights.ts) — the UI defaults to it and says so. */
export const DEFAULT_EXPLORE_SEARCH_PARAMS: ExploreSearchParams = {
  tab: "pairs",
  from: "JFK",
  to: "HND",
  departFrom: "2026-04-01",
  departTo: "2026-04-11",
  cabin: undefined,
  maxPoints: undefined,
  maxStops: undefined,
};

export interface ExploreSearchParams {
  tab: ExploreTab;
  from: string;
  to: string;
  /** Earliest local departure date, inclusive, YYYY-MM-DD. */
  departFrom: string;
  /** Latest local departure date, inclusive, YYYY-MM-DD. */
  departTo: string;
  cabin?: CabinClass;
  maxPoints?: number;
  maxStops?: number;
}

/** Whatever shape raw query params show up in: a plain record (Next.js `searchParams`), or a URLSearchParams instance. */
export type RawSearchParams = Record<string, string | string[] | undefined> | URLSearchParams;

function readParam(searchParams: RawSearchParams, key: string): string | undefined {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined;
  }
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  // Round-trips through Date to reject impossible calendar dates like 2026-02-30,
  // which Date silently rolls over into March.
  return parsed.toISOString().slice(0, 10) === value;
}

function parseNonNegativeInt(value: string | undefined): number | undefined {
  if (value === undefined || !/^\d+$/.test(value)) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isSafeInteger(n) ? n : undefined;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  const n = parseNonNegativeInt(value);
  return n !== undefined && n > 0 ? n : undefined;
}

/**
 * Parses the /explore page's query string into a typed, fully-defaulted
 * search shape. Pure and side-effect free so it can be unit tested directly,
 * independent of Next.js or nuqs.
 */
export function parseExploreSearchParams(searchParams: RawSearchParams): ExploreSearchParams {
  const defaults = DEFAULT_EXPLORE_SEARCH_PARAMS;

  const tabRaw = readParam(searchParams, "tab");
  const tab: ExploreTab = EXPLORE_TABS.includes(tabRaw as ExploreTab) ? (tabRaw as ExploreTab) : defaults.tab;

  const fromRaw = readParam(searchParams, "from");
  const from: string = (ORIGIN_AIRPORT_CODES as readonly string[]).includes(fromRaw ?? "") ? (fromRaw as string) : defaults.from;

  const toRaw = readParam(searchParams, "to");
  const to: string = (DESTINATION_AIRPORT_CODES as readonly string[]).includes(toRaw ?? "") ? (toRaw as string) : defaults.to;

  const departFromRaw = readParam(searchParams, "departFrom");
  const departToRaw = readParam(searchParams, "departTo");
  let departFrom = departFromRaw !== undefined && isValidIsoDate(departFromRaw) ? departFromRaw : defaults.departFrom;
  let departTo = departToRaw !== undefined && isValidIsoDate(departToRaw) ? departToRaw : defaults.departTo;
  // A reversed range is nonsensical, not merely "out of the fixture window" —
  // fall back to the whole default window rather than guessing which end was wrong.
  if (departFrom > departTo) {
    departFrom = defaults.departFrom;
    departTo = defaults.departTo;
  }

  const cabinRaw = readParam(searchParams, "cabin");
  const cabin: CabinClass | undefined = CABIN_CLASSES.includes(cabinRaw as CabinClass) ? (cabinRaw as CabinClass) : undefined;

  const maxPoints = parsePositiveInt(readParam(searchParams, "maxPoints"));
  const maxStops = parseNonNegativeInt(readParam(searchParams, "maxStops"));

  return { tab, from, to, departFrom, departTo, cabin, maxPoints, maxStops };
}

/** Maps parsed explore params onto the shape searchFlights/searchPairs expect. */
export function exploreParamsToFlightSearchInput(params: ExploreSearchParams): FlightSearchInput {
  return {
    originAirportCodes: [params.from],
    destinationAirportCodes: [params.to],
    earliestDeparture: params.departFrom,
    latestDeparture: params.departTo,
    cabin: params.cabin,
    maxPoints: params.maxPoints,
    maxStops: params.maxStops,
  };
}
