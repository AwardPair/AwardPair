import type {
  Airport,
  BenefitPreferences,
  CardBenefitRule,
  ConfidenceLevel,
  Freshness,
  FlightOpportunity,
  HotelOffer,
  HotelProgramBenefit,
  HotelPropertyBenefit,
  HotelStayOpportunity,
  Money,
  Pair,
} from "@/lib/domain";
import { localArrivalDate } from "@/lib/date/localArrivalDate";
import { computeHotelEconomics } from "@/lib/economics/computeHotelEconomics";
import { resolveActiveHotelBenefits } from "@/lib/economics/benefitResolution";
import { computePairScore } from "@/lib/score/pairScore";

export interface WalletCardBenefit {
  rule: CardBenefitRule;
  remainingCredit: Money;
}

export interface PairingContext {
  programBenefits: HotelProgramBenefit[];
  propertyBenefits: HotelPropertyBenefit[];
  offers: HotelOffer[];
  walletCardBenefits: WalletCardBenefit[];
  preferences: BenefitPreferences;
  partySize: number;
  today: string;
  isPrepaidBooking: boolean;
}

function olderFreshness(a: Freshness, b: Freshness): Freshness {
  return new Date(a.observedAt) < new Date(b.observedAt) ? a : b;
}

/**
 * For one hotel stay, tries every program the hotel currently participates
 * in and returns the economics/score for whichever program yields the
 * lowest subjective net value for the user (i.e. the best realistic deal),
 * along with which program that was.
 */
function bestEconomicsForStay(
  stay: HotelStayOpportunity,
  flight: FlightOpportunity,
  ctx: PairingContext,
) {
  if (stay.activeMemberships.length === 0) return undefined;

  const candidates = stay.activeMemberships.map((membership) => {
    const activeBenefits = resolveActiveHotelBenefits({
      programBenefits: ctx.programBenefits,
      propertyBenefits: ctx.propertyBenefits,
      programId: membership.programId,
      hotelId: stay.hotel.id,
      onDate: ctx.today,
    });
    const candidateOffers = ctx.offers.filter(
      (o) => (!o.hotelId || o.hotelId === stay.hotel.id) && (!o.programId || o.programId === membership.programId),
    );
    const cardBenefit = ctx.walletCardBenefits.find((wb) => wb.rule.applicableProgramIds?.includes(membership.programId));

    const economics = computeHotelEconomics({
      rate: stay.rate,
      candidateOffers,
      activeBenefits,
      cardBenefit: cardBenefit
        ? { rule: cardBenefit.rule, programId: membership.programId, remainingCredit: cardBenefit.remainingCredit, isPrepaidBooking: ctx.isPrepaidBooking }
        : undefined,
      preferences: ctx.preferences,
      partySize: ctx.partySize,
      today: ctx.today,
    });

    return { membership, economics, activeBenefits, candidateOffers };
  });

  return candidates.reduce((best, current) =>
    current.economics.subjectiveNetValue.amount < best.economics.subjectiveNetValue.amount ? current : best,
  );
}

/**
 * The core Pair-matching engine: for each flight, finds hotel stays whose
 * check-in date is the flight's local arrival date at the destination (per
 * spec — never a UTC-truncated date), and builds a scored Pair for each
 * viable combination.
 */
export function buildPairs(params: {
  flights: FlightOpportunity[];
  hotelStays: HotelStayOpportunity[];
  destinationAirports: Record<string, Airport>;
  context: PairingContext;
}): Pair[] {
  const pairs: Pair[] = [];

  for (const flight of params.flights) {
    const destination = params.destinationAirports[flight.destinationAirportCode];
    if (!destination) continue;
    const arrivalDate = localArrivalDate(flight.arrivalAt, destination.timeZone);

    const candidateStays = params.hotelStays.filter((stay) => stay.checkInDate === arrivalDate);

    for (const stay of candidateStays) {
      const best = bestEconomicsForStay(stay, flight, params.context);
      if (!best) continue;

      const confidence: ConfidenceLevel = stay.rate.confidence.level;
      const appliedOfferObjects = best.candidateOffers.filter((o) => best.economics.appliedOfferIds.includes(o.id));
      const appliedBenefitObjects = best.activeBenefits.filter((b) => best.economics.appliedBenefitIds.includes(b.id));
      const appliedCardRules = ctxCardRules(params.context, best.economics.appliedBenefitIds);

      pairs.push({
        id: `${flight.id}__${stay.id}__${best.membership.programId}`,
        flight,
        hotelStay: stay,
        programId: best.membership.programId,
        appliedBenefits: [...appliedBenefitObjects, ...appliedCardRules],
        applicableOffers: appliedOfferObjects,
        economics: best.economics,
        score: computePairScore({
          flight,
          economics: best.economics,
          confidence,
          applicableOffers: appliedOfferObjects,
        }),
        confidence,
        freshness: olderFreshness(flight.freshness, stay.rate.freshness),
      });
    }
  }

  return pairs.sort((a, b) => b.score.value - a.score.value);
}

function ctxCardRules(ctx: PairingContext, appliedBenefitIds: string[]): CardBenefitRule[] {
  return ctx.walletCardBenefits.map((wb) => wb.rule).filter((rule) => appliedBenefitIds.includes(rule.id));
}
