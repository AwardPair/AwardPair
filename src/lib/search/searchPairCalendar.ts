import type { CabinClass, Pair } from "@/lib/domain";
import { searchPairs } from "./searchPairs";

export interface PairCalendarDay {
  /** The flight's departure date (YYYY-MM-DD) this calendar cell represents. */
  date: string;
  /** The single strongest Pair departing on this date, if any exist. */
  bestPair?: Pair;
  /** How many viable Pairs exist for this date (bestPair is the highest-scoring of these). */
  pairCount: number;
}

export interface PairCalendarInput {
  originAirportCodes: string[];
  destinationAirportCodes: string[];
  startDate: string;
  endDate: string;
  cabin?: CabinClass;
  maxPoints?: number;
  maxStops?: number;
}

function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/**
 * For each departure date in the requested range, finds the strongest
 * compatible Pair (not just the best flight or the best hotel in
 * isolation) — the Pair Calendar's whole point per the product spec.
 * Each date is searched independently so the local-arrival-date-based
 * flight/hotel matching in buildPairs is applied per day, not approximated.
 */
export async function searchPairCalendar(input: PairCalendarInput): Promise<PairCalendarDay[]> {
  const dates = dateRange(input.startDate, input.endDate);

  const days = await Promise.all(
    dates.map(async (date): Promise<PairCalendarDay> => {
      const pairs = await searchPairs({
        originAirportCodes: input.originAirportCodes,
        destinationAirportCodes: input.destinationAirportCodes,
        earliestDeparture: date,
        latestDeparture: date,
        cabin: input.cabin,
        maxPoints: input.maxPoints,
        maxStops: input.maxStops,
      });
      return { date, bestPair: pairs[0], pairCount: pairs.length };
    }),
  );

  return days;
}
