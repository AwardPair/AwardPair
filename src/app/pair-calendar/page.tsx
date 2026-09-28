import type { Metadata } from "next";
import { DEFAULT_EXPLORE_SEARCH_PARAMS } from "@/lib/search/parseExploreSearchParams";
import { parsePairCalendarParams } from "@/lib/search/parsePairCalendarParams";
import { searchPairCalendar } from "@/lib/search/searchPairCalendar";
import { PairCalendarFilterBar } from "@/components/pair-calendar/PairCalendarFilterBar";
import { PairCalendarGrid } from "@/components/pair-calendar/PairCalendarGrid";

export const metadata: Metadata = {
  title: "Pair Calendar",
  description: "See the strongest complete award-flight + hotel Pair for each departure date, not just flight availability or hotel price alone.",
};

export default async function PairCalendarPage({ searchParams }: PageProps<"/pair-calendar">) {
  const rawParams = await searchParams;
  const params = parsePairCalendarParams(rawParams);

  const days = await searchPairCalendar({
    originAirportCodes: [params.from],
    destinationAirportCodes: [params.to],
    startDate: DEFAULT_EXPLORE_SEARCH_PARAMS.departFrom,
    endDate: DEFAULT_EXPLORE_SEARCH_PARAMS.departTo,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pair Calendar</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every date shows the strongest complete Pair for that departure — the flight, the hotel, and the economics together — not just which
          flights have award space. Pick a date to see its best Pairs.
        </p>
      </div>

      <PairCalendarFilterBar current={params} />

      <p className="text-xs text-muted-foreground">
        Sample data only spans <strong className="font-medium text-foreground">Apr 1 – Apr 11, 2026</strong>.
      </p>

      <PairCalendarGrid days={days} from={params.from} to={params.to} />
    </div>
  );
}
