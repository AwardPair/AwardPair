import type { HotelEconomics } from "@/lib/domain";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/components/explore/format";

interface RowProps {
  label: string;
  value: string;
  emphasize?: boolean;
  muted?: boolean;
}

function Row({ label, value, emphasize, muted }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <dt className={cn("text-sm", muted ? "text-muted-foreground" : "text-foreground")}>{label}</dt>
      <dd className={cn("text-sm tabular-nums", emphasize ? "font-semibold text-foreground" : muted ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </dd>
    </div>
  );
}

/**
 * Full cash/perk economics breakdown, always as distinct labeled rows —
 * never a single blended number. Mirrors docs/architecture.md's economics
 * pipeline: gross -> promo-adjusted -> credit applied -> net cash cost, then
 * a clearly separate perk-adjusted section.
 */
export function PairEconomicsBreakdown({ economics }: { economics: HotelEconomics }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cash economics</h4>
        <dl className="mt-2 divide-y divide-border rounded-[var(--radius-md)] border border-border">
          <Row label="Reference / gross hotel cost" value={formatMoney(economics.grossHotelCost)} />
          <Row label="After verified promotion" value={formatMoney(economics.promoAdjustedCost)} />
          <Row
            label="Card statement credit applied"
            value={economics.eligibleStatementCredit.amount > 0 ? `− ${formatMoney(economics.eligibleStatementCredit)}` : formatMoney(economics.eligibleStatementCredit)}
            muted={economics.eligibleStatementCredit.amount === 0}
          />
          <Row label="Net cash cost" value={formatMoney(economics.netCashCost)} emphasize />
        </dl>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perk-adjusted value (subjective — not cash)</h4>
        <dl className="mt-2 divide-y divide-border rounded-[var(--radius-md)] border border-dashed border-border">
          <Row
            label="Soft benefit value (breakfast, usable credit, etc.)"
            value={economics.softBenefitValue.amount > 0 ? `− ${formatMoney(economics.softBenefitValue)}` : formatMoney(economics.softBenefitValue)}
            muted={economics.softBenefitValue.amount === 0}
          />
          <Row label="Perk-adjusted net value" value={formatMoney(economics.subjectiveNetValue)} emphasize />
          <Row
            label={`Perk-adjusted rate / night (${economics.numberOfNights} night${economics.numberOfNights === 1 ? "" : "s"})`}
            value={formatMoney(economics.subjectiveEffectiveNightlyRate)}
          />
        </dl>
      </div>

      <p className="text-xs text-muted-foreground">
        Perk-adjusted figures reflect your own valuation of soft benefits — they are never combined with the net cash cost above, only shown alongside it.
      </p>
    </div>
  );
}
