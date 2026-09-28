import Link from "next/link";
import { ArrowRight, BedDouble, Plane as PlaneIcon } from "lucide-react";
import type { Pair } from "@/lib/domain";
import { nightsBetween } from "@/lib/domain";
import { DEMO_HOTEL_PROGRAMS_BY_ID } from "@/lib/fixtures/hotels";
import { cn } from "@/lib/utils/cn";
import { ConfidenceBadge, FreshnessBadge } from "@/components/explore/StatusBadges";
import { formatCabin, formatCalendarDate, formatMoney, formatPoints, formatStops } from "@/components/explore/format";
import { PairScoreReasons } from "./PairScoreReasons";

interface PairCardProps {
  pair: Pair;
  selected?: boolean;
  onSelect?: () => void;
}

/**
 * A compact Pair summary: flight + hotel + applied benefit + economics +
 * score, legible without mentally combining separate panels, per
 * docs/product.md. Selecting it (desktop) opens the full breakdown in the
 * sticky side panel; it also links straight to /pairs/[id].
 */
export function PairCard({ pair, selected = false, onSelect }: PairCardProps) {
  const { flight, hotelStay } = pair;
  const program = DEMO_HOTEL_PROGRAMS_BY_ID[pair.programId];
  const nights = nightsBetween(hotelStay.checkInDate, hotelStay.checkOutDate);
  const topOffer = pair.applicableOffers[0];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius-lg)] border bg-card p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)] transition-colors sm:p-5",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PlaneIcon aria-hidden="true" className="h-4 w-4 text-primary" />
            {flight.originAirportCode} → {flight.destinationAirportCode}
            <span className="font-normal text-muted-foreground">· {formatCabin(flight.cabin)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {flight.marketingAirline}
            {flight.flightNumber ? ` ${flight.flightNumber}` : ""} · {formatPoints(flight.pointsCost)} + {formatMoney(flight.taxesAndFees)} ·{" "}
            {formatStops(flight.stops)}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-primary/10 px-2.5 py-1.5 text-primary">
          <span className="text-lg font-bold leading-none">{pair.score.value}</span>
          <span className="text-[10px] font-medium leading-tight">
            Pair
            <br />
            Score
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--radius-md)] bg-muted/50 p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BedDouble aria-hidden="true" className="h-4 w-4 text-primary" />
            {hotelStay.hotel.name}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCalendarDate(hotelStay.checkInDate)} – {formatCalendarDate(hotelStay.checkOutDate)} · {nights} night{nights === 1 ? "" : "s"}
          </p>
          {program ? (
            <span className="inline-flex w-fit items-center rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-foreground/75 ring-1 ring-inset ring-border">
              {program.name}
            </span>
          ) : null}
        </div>
        {topOffer ? <p className="max-w-[14rem] text-right text-xs text-success">{topOffer.description}</p> : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net cash cost</p>
          <p className="text-lg font-semibold text-foreground">{formatMoney(pair.economics.netCashCost)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Perk-adjusted (subjective)</p>
          <p className="text-sm font-medium text-foreground/80">{formatMoney(pair.economics.subjectiveNetValue)}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Why this pair ranks highly</p>
        <div className="mt-1.5">
          <PairScoreReasons reasons={pair.score.reasons} limit={3} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <ConfidenceBadge level={pair.confidence} />
        <FreshnessBadge freshness={pair.freshness} />
        <div className="ml-auto flex items-center gap-3">
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className={cn(
                "text-sm font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "text-primary" : "text-foreground/75",
              )}
            >
              {selected ? "Selected" : "View details"}
            </button>
          ) : null}
          <Link
            href={`/pairs/${pair.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Full page
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
