import { DEFAULT_EXPLORE_SEARCH_PARAMS, DESTINATION_AIRPORT_CODES, ORIGIN_AIRPORT_CODES, type RawSearchParams } from "./parseExploreSearchParams";

export interface PairCalendarParams {
  from: string;
  to: string;
}

/** Mirrors the fixture window's default route (see parseExploreSearchParams.ts). */
export const DEFAULT_PAIR_CALENDAR_PARAMS: PairCalendarParams = {
  from: DEFAULT_EXPLORE_SEARCH_PARAMS.from,
  to: DEFAULT_EXPLORE_SEARCH_PARAMS.to,
};

function readParam(searchParams: RawSearchParams, key: string): string | undefined {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined;
  }
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Parses /pair-calendar's From/To query params the same way
 * parseExploreSearchParams does — same validation, same defaults —
 * without pulling in the tab/date-range/cabin fields the calendar
 * doesn't use (it always covers the full fixture window).
 */
export function parsePairCalendarParams(searchParams: RawSearchParams): PairCalendarParams {
  const fromRaw = readParam(searchParams, "from");
  const from = (ORIGIN_AIRPORT_CODES as readonly string[]).includes(fromRaw ?? "") ? (fromRaw as string) : DEFAULT_PAIR_CALENDAR_PARAMS.from;

  const toRaw = readParam(searchParams, "to");
  const to = (DESTINATION_AIRPORT_CODES as readonly string[]).includes(toRaw ?? "") ? (toRaw as string) : DEFAULT_PAIR_CALENDAR_PARAMS.to;

  return { from, to };
}
