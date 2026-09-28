import { BedDouble } from "lucide-react";
import type { HotelStayOpportunity, Money } from "@/lib/domain";
import { addMoney, nightsBetween, zeroMoney } from "@/lib/domain";
import { DEMO_HOTEL_PROGRAMS_BY_ID } from "@/lib/fixtures/hotels";
import { DEMO_PROGRAM_BENEFITS, DEMO_PROPERTY_BENEFITS } from "@/lib/fixtures/benefits";
import { resolveActiveHotelBenefits } from "@/lib/economics/benefitResolution";
import { ConfidenceBadge, FreshnessBadge } from "./StatusBadges";
import { RATE_PROVENANCE_LABELS, formatCalendarDate, formatMoney } from "./format";

function grossReferenceCost(stay: HotelStayOpportunity): Money {
  const { rate } = stay;
  const roomTotal = rate.nights.reduce((sum, night) => addMoney(sum, night.roomRate), zeroMoney(rate.taxes.currency));
  return addMoney(addMoney(roomTotal, rate.taxes), rate.mandatoryFees);
}

export function HotelCard({ stay }: { stay: HotelStayOpportunity }) {
  const nights = nightsBetween(stay.checkInDate, stay.checkOutDate);
  const gross = grossReferenceCost(stay);

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BedDouble aria-hidden="true" className="h-4 w-4 text-primary" />
            {stay.hotel.name}
          </div>
          <p className="text-xs text-muted-foreground">
            {stay.hotel.city} · {formatCalendarDate(stay.checkInDate)} – {formatCalendarDate(stay.checkOutDate)} · {nights} night{nights === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gross reference cost</p>
          <p className="text-lg font-semibold text-foreground">{formatMoney(gross)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ConfidenceBadge level={stay.rate.confidence.level} />
        <FreshnessBadge freshness={stay.rate.freshness} />
      </div>

      <p className="text-xs text-muted-foreground">
        {RATE_PROVENANCE_LABELS[stay.rate.provenance]}. {stay.rate.confidence.reason}
      </p>

      {stay.activeMemberships.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          {stay.activeMemberships.map((membership) => {
            const program = DEMO_HOTEL_PROGRAMS_BY_ID[membership.programId];
            const benefits = resolveActiveHotelBenefits({
              programBenefits: DEMO_PROGRAM_BENEFITS,
              propertyBenefits: DEMO_PROPERTY_BENEFITS,
              programId: membership.programId,
              hotelId: stay.hotel.id,
              onDate: stay.checkInDate,
            });
            return (
              <div key={membership.id} className="flex flex-col gap-1">
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {program?.name ?? membership.programId}
                </span>
                {benefits.length > 0 ? (
                  <ul className="ml-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    {benefits.map((benefit) => (
                      <li key={benefit.id}>· {benefit.description}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ml-1 text-xs text-muted-foreground">No documented benefits for this property/program.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="border-t border-border pt-3 text-xs text-muted-foreground">No active premium hotel program membership found for these dates.</p>
      )}
    </div>
  );
}
