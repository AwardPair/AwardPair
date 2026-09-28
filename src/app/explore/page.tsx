import type { Metadata } from "next";
import { CalendarRange, Hotel as HotelIcon, Plane } from "lucide-react";
import { DEMO_AIRPORTS } from "@/lib/fixtures/airports";
import { createClient } from "@/lib/supabase/server";
import { searchFlights } from "@/lib/search/searchFlights";
import { searchHotels } from "@/lib/search/searchHotels";
import { searchPairs } from "@/lib/search/searchPairs";
import { exploreParamsToFlightSearchInput, parseExploreSearchParams, type ExploreSearchParams } from "@/lib/search/parseExploreSearchParams";
import { ExploreControls } from "@/components/explore/ExploreControls";
import { ExploreEmptyState } from "@/components/explore/EmptyState";
import { FlightsTable } from "@/components/explore/FlightsTable";
import { HotelsResults } from "@/components/explore/HotelsResults";
import { SaveSearchForm } from "@/components/explore/SaveSearchForm";
import { PairsResults } from "@/components/pairs/PairsResults";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search award-flight and premium-hotel Pairs, or browse Flights and Hotels on their own.",
};

const NO_RESULTS_COPY =
  "No results for this search. Sample data only covers JFK/EWR ↔ HND/NRT departing Apr 1–Apr 11, 2026 — try widening your dates or picking a different route.";

async function PairsTabContent({ params }: { params: ExploreSearchParams }) {
  const pairs = await searchPairs(exploreParamsToFlightSearchInput(params));
  if (pairs.length === 0) {
    return <ExploreEmptyState icon={CalendarRange} title="No award-flight + hotel pairs found" description={NO_RESULTS_COPY} />;
  }
  return <PairsResults pairs={pairs} />;
}

async function FlightsTabContent({ params }: { params: ExploreSearchParams }) {
  const flights = await searchFlights(exploreParamsToFlightSearchInput(params));
  if (flights.length === 0) {
    return <ExploreEmptyState icon={Plane} title="No award flights found" description={NO_RESULTS_COPY} />;
  }
  return <FlightsTable flights={flights} />;
}

async function HotelsTabContent({ params }: { params: ExploreSearchParams }) {
  const destinationCity = DEMO_AIRPORTS[params.to]?.city;
  const hotels = destinationCity
    ? await searchHotels({ destinationCity, checkInDate: params.departFrom, checkOutDate: params.departTo })
    : [];
  if (hotels.length === 0) {
    return (
      <ExploreEmptyState
        icon={HotelIcon}
        title="No hotel stays found"
        description="No demo hotel rates overlap this destination and date range. Try HND or NRT with dates between Apr 1–Apr 11, 2026."
      />
    );
  }
  return <HotelsResults hotels={hotels} />;
}

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const rawParams = await searchParams;
  const params = parseExploreSearchParams(rawParams);

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pairs is AwardPair&apos;s primary view — the full economics of a flight and hotel together. Flights and Hotels let you browse each on its own.
        </p>
      </div>

      <ExploreControls current={params} />

      {params.tab === "pairs" ? <SaveSearchForm params={params} signedIn={Boolean(authData.user)} /> : null}

      {params.tab === "pairs" ? <PairsTabContent params={params} /> : null}
      {params.tab === "flights" ? <FlightsTabContent params={params} /> : null}
      {params.tab === "hotels" ? <HotelsTabContent params={params} /> : null}
    </div>
  );
}
