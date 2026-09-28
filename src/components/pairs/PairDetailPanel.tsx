import Link from "next/link";
import { ArrowRight, BedDouble, Plane as PlaneIcon } from "lucide-react";
import type { CardBenefitRule, HotelOffer, HotelProgramBenefit, HotelPropertyBenefit, Pair } from "@/lib/domain";
import { nightsBetween } from "@/lib/domain";
import { DEMO_AIRPORTS } from "@/lib/fixtures/airports";
import { DEMO_HOTEL_PROGRAMS_BY_ID } from "@/lib/fixtures/hotels";
import { buildVerificationHandoff } from "@/lib/handoff/hotelVerification";
import { ConfidenceBadge, FreshnessBadge } from "@/components/explore/StatusBadges";
import {
  RATE_PROVENANCE_LABELS,
  formatCabin,
  formatCalendarDate,
  formatLocalDateTime,
  formatMoney,
  formatPoints,
  formatStops,
} from "@/components/explore/format";
import { PairEconomicsBreakdown } from "./PairEconomicsBreakdown";
import { PairScoreReasons } from "./PairScoreReasons";
import { VerificationHandoffActions } from "./VerificationHandoffActions";

type AppliedBenefit = HotelProgramBenefit | HotelPropertyBenefit | CardBenefitRule;

function isDescribedBenefit(benefit: AppliedBenefit): benefit is HotelProgramBenefit | HotelPropertyBenefit {
  return "description" in benefit;
}

function describeAppliedBenefit(benefit: AppliedBenefit): string {
  if (isDescribedBenefit(benefit)) return benefit.description;
  const maxAmount = formatMoney({ amount: benefit.maxAmount.value, currency: benefit.maxAmount.currency });
  return `Card statement credit — up to ${maxAmount} per ${benefit.period.replace(/_/g, " ")}${benefit.minimumNights ? `, ${benefit.minimumNights}+ nights` : ""}.`;
}

function describeOffer(offer: HotelOffer): string {
  return offer.description;
}

interface PairDetailPanelProps {
  pair: Pair;
  /** h1 on the standalone /pairs/[id] page, h2 inside the side panel/sheet. */
  headingLevel?: 1 | 2;
  /** Shows a "View full details" link to /pairs/[id] — omit on the page itself. */
  showPageLink?: boolean;
}

export function PairDetailPanel({ pair, headingLevel = 2, showPageLink = false }: PairDetailPanelProps) {
  const { flight, hotelStay } = pair;
  const originAirport = DEMO_AIRPORTS[flight.originAirportCode];
  const destinationAirport = DEMO_AIRPORTS[flight.destinationAirportCode];
  const program = DEMO_HOTEL_PROGRAMS_BY_ID[pair.programId];
  const nights = nightsBetween(hotelStay.checkInDate, hotelStay.checkOutDate);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  const handoff = buildVerificationHandoff({
    programId: pair.programId,
    hotelName: hotelStay.hotel.name,
    city: hotelStay.hotel.city,
    checkInDate: hotelStay.checkInDate,
    checkOutDate: hotelStay.checkOutDate,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Heading className="text-xl font-semibold tracking-tight text-foreground">
              {flight.originAirportCode} → {flight.destinationAirportCode} + {hotelStay.hotel.name}
            </Heading>
            <p className="mt-1 text-sm text-muted-foreground">
              {originAirport?.city ?? flight.originAirportCode} to {destinationAirport?.city ?? flight.destinationAirportCode} ·{" "}
              {formatCalendarDate(hotelStay.checkInDate)} – {formatCalendarDate(hotelStay.checkOutDate)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-[var(--radius-lg)] bg-primary/10 px-3 py-2 text-primary">
            <span className="text-2xl font-bold leading-none">{pair.score.value}</span>
            <span className="text-xs font-medium leading-tight">
              Pair
              <br />
              Score
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ConfidenceBadge level={pair.confidence} />
          <FreshnessBadge freshness={pair.freshness} />
          {showPageLink ? (
            <Link
              href={`/pairs/${pair.id}`}
              className="ml-auto inline-flex items-center gap-1 rounded-[var(--radius-sm)] text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View full details
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      <section aria-labelledby={`${pair.id}-why`}>
        <h3 id={`${pair.id}-why`} className="text-sm font-semibold text-foreground">
          Why this pair ranks highly
        </h3>
        <div className="mt-2">
          <PairScoreReasons reasons={pair.score.reasons} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PlaneIcon aria-hidden="true" className="h-4 w-4 text-primary" />
            Flight
          </div>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <DetailRow label="Route" value={`${flight.originAirportCode} → ${flight.destinationAirportCode}`} />
            <DetailRow label="Airline" value={`${flight.marketingAirline}${flight.flightNumber ? ` ${flight.flightNumber}` : ""}`} />
            <DetailRow label="Program" value={flight.mileageProgram.name} />
            <DetailRow label="Cabin" value={formatCabin(flight.cabin)} />
            <DetailRow label="Points + taxes" value={`${formatPoints(flight.pointsCost)} + ${formatMoney(flight.taxesAndFees)}`} />
            <DetailRow label="Stops" value={formatStops(flight.stops)} />
            <DetailRow label="Seats observed" value={flight.availableSeats !== undefined ? String(flight.availableSeats) : "Unknown"} />
            {originAirport ? <DetailRow label="Local departure" value={formatLocalDateTime(flight.departureAt, originAirport.timeZone)} /> : null}
            {destinationAirport ? <DetailRow label="Local arrival" value={formatLocalDateTime(flight.arrivalAt, destinationAirport.timeZone)} /> : null}
          </dl>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BedDouble aria-hidden="true" className="h-4 w-4 text-primary" />
            Hotel stay
          </div>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <DetailRow label="Hotel" value={hotelStay.hotel.name} />
            <DetailRow label="City" value={hotelStay.hotel.city} />
            <DetailRow label="Program" value={program?.name ?? pair.programId} />
            <DetailRow label="Check-in" value={formatCalendarDate(hotelStay.checkInDate)} />
            <DetailRow label="Check-out" value={formatCalendarDate(hotelStay.checkOutDate)} />
            <DetailRow label="Nights" value={String(nights)} />
            <DetailRow label="Rate basis" value={RATE_PROVENANCE_LABELS[hotelStay.rate.provenance]} />
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">{hotelStay.rate.confidence.reason}</p>
        </div>
      </section>

      {pair.appliedBenefits.length > 0 || pair.applicableOffers.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-foreground">Applied benefits & offers</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {pair.applicableOffers.map((offer) => (
              <li key={offer.id} className="text-sm text-foreground/85">
                <span className="font-medium text-foreground">Offer:</span> {describeOffer(offer)}
              </li>
            ))}
            {pair.appliedBenefits.map((benefit) => (
              <li key={benefit.id} className="text-sm text-foreground/85">
                <span className="font-medium text-foreground">Benefit:</span> {describeAppliedBenefit(benefit)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h3 className="text-sm font-semibold text-foreground">Economics</h3>
        <div className="mt-2">
          <PairEconomicsBreakdown economics={pair.economics} />
        </div>
      </section>

      {handoff ? (
        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">Check exact price</h3>
          <div className="mt-2">
            <VerificationHandoffActions handoff={handoff} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
