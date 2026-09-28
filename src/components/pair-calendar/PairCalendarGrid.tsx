import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import type { Money } from "@/lib/domain";
import type { PairCalendarDay } from "@/lib/search/searchPairCalendar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { formatCabin, formatMoney, formatPoints } from "@/components/explore/format";

function formatCellDate(date: string): string {
  return formatInTimeZone(new Date(`${date}T00:00:00Z`), "UTC", "EEE, MMM d");
}

type ScoreTier = "strong" | "good" | "fair" | "weak";

const SCORE_TIER_LABEL: Record<ScoreTier, string> = {
  strong: "Strong Pair",
  good: "Good Pair",
  fair: "Fair Pair",
  weak: "Weak Pair",
};

const SCORE_TIER_TONE: Record<ScoreTier, "success" | "primary" | "warning" | "danger"> = {
  strong: "success",
  good: "primary",
  fair: "warning",
  weak: "danger",
};

function scoreTier(score: number): ScoreTier {
  if (score >= 75) return "strong";
  if (score >= 50) return "good";
  if (score >= 25) return "fair";
  return "weak";
}

function cellNetCost(economics: { netCashCost: Money }): string {
  return formatMoney(economics.netCashCost);
}

/**
 * The Pair Calendar's whole point: each cell shows the quality of the
 * *complete Pair* for that departure date (score, cabin, points, hotel net
 * cost together), not just flight availability or hotel price in isolation.
 * Score is conveyed by badge text and tone together, never color alone.
 */
export function PairCalendarGrid({ days, from, to }: { days: PairCalendarDay[]; from: string; to: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {days.map((day) => {
        const pair = day.bestPair;
        const exploreHref = `/explore?tab=pairs&from=${from}&to=${to}&departFrom=${day.date}&departTo=${day.date}`;

        if (!pair) {
          return (
            <div
              key={day.date}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-dashed border-border bg-card/50 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{formatCellDate(day.date)}</p>
              <Badge tone="neutral">No Pairs found</Badge>
            </div>
          );
        }

        const tier = scoreTier(pair.score.value);

        return (
          <Link
            key={day.date}
            href={exploreHref}
            className="flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[0_4px_12px_rgba(20,20,30,0.04)] transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{formatCellDate(day.date)}</p>
              <span className="text-xs text-muted-foreground">
                {day.pairCount} Pair{day.pairCount === 1 ? "" : "s"}
              </span>
            </div>

            <Badge tone={SCORE_TIER_TONE[tier]} className="w-fit">
              {SCORE_TIER_LABEL[tier]} · {pair.score.value}
            </Badge>

            <dl className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <dt>Cabin</dt>
                <dd className={cn("font-medium text-foreground", pair.flight.cabin === "first" && "text-primary")}>
                  {formatCabin(pair.flight.cabin)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Points</dt>
                <dd className="font-medium text-foreground">{formatPoints(pair.flight.pointsCost)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Hotel net cash</dt>
                <dd className="font-medium text-foreground">{cellNetCost(pair.economics)}</dd>
              </div>
            </dl>

            <p className="truncate text-xs text-muted-foreground">{pair.hotelStay.hotel.name}</p>
          </Link>
        );
      })}
    </div>
  );
}
