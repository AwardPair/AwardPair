import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import type { Pair } from "@/lib/domain";
import { searchPairs } from "@/lib/search/searchPairs";
import { DEFAULT_EXPLORE_SEARCH_PARAMS, DESTINATION_AIRPORT_CODES, ORIGIN_AIRPORT_CODES } from "@/lib/search/parseExploreSearchParams";
import { PairDetailPanel } from "@/components/pairs/PairDetailPanel";

/**
 * Pairs are computed on demand from the fixture data rather than persisted
 * with stable database rows, but Pair.id (`${flightId}__${stayId}__${programId}`)
 * is deterministic given the fixed fixtures. To resolve /pairs/[id] we
 * re-run the full-universe search (every origin x every destination across
 * the entire fixture window) and find the matching id.
 */
const resolvePair = cache(async function resolvePair(id: string): Promise<Pair | undefined> {
  const pairs = await searchPairs({
    originAirportCodes: [...ORIGIN_AIRPORT_CODES],
    destinationAirportCodes: [...DESTINATION_AIRPORT_CODES],
    earliestDeparture: DEFAULT_EXPLORE_SEARCH_PARAMS.departFrom,
    latestDeparture: DEFAULT_EXPLORE_SEARCH_PARAMS.departTo,
  });
  return pairs.find((pair) => pair.id === id);
});

const BACK_LINK_CLASSES =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export async function generateMetadata({ params }: PageProps<"/pairs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pair = await resolvePair(id);
  if (!pair) return { title: "Pair not found" };
  return {
    title: `${pair.flight.originAirportCode} → ${pair.flight.destinationAirportCode} + ${pair.hotelStay.hotel.name}`,
    description: `Award-flight and hotel Pair: ${pair.flight.marketingAirline} to ${pair.hotelStay.hotel.name}, ${pair.hotelStay.hotel.city}.`,
  };
}

export default async function PairDetailPage({ params }: PageProps<"/pairs/[id]">) {
  const { id } = await params;
  const pair = await resolvePair(id);

  if (!pair) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10">
          <SearchX aria-hidden="true" className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pair not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn&apos;t find a Pair matching this link. It may reference a route or date outside the current demo data, or the link may be malformed.
        </p>
        <Link href="/explore" className={BACK_LINK_CLASSES}>
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Back to Explore
      </Link>
      <div className="mt-4 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(20,20,30,0.06)] sm:p-6">
        <PairDetailPanel pair={pair} headingLevel={1} />
      </div>
    </div>
  );
}
