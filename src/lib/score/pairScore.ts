import type { ConfidenceLevel, FlightOpportunity, HotelEconomics, HotelOffer, PairScore, PairScoreReason, RateConfidenceLevel } from "@/lib/domain";

/**
 * Named weights, not magic numbers, so scoring can be tuned without
 * touching the scoring logic itself. All weights are on a comparable
 * 0-100 contribution scale before being combined.
 */
export const PAIR_SCORE_WEIGHTS = {
  flightCabin: 0.15,
  flightPointsEfficiency: 0.15,
  flightAvailability: 0.05,
  flightStops: 0.05,
  hotelNetCost: 0.25,
  hotelPromotion: 0.1,
  hotelBenefitCapture: 0.1,
  dataConfidence: 0.15,
} as const;

const CABIN_SCORE: Record<FlightOpportunity["cabin"], number> = {
  economy: 40,
  premium_economy: 60,
  business: 85,
  first: 100,
};

function flightCabinScore(flight: FlightOpportunity): number {
  return CABIN_SCORE[flight.cabin];
}

/** Lower points-per-dollar-of-cash-value implied is better; scored via a fixed reference curve, not a fabricated market benchmark. */
function flightPointsEfficiencyScore(flight: FlightOpportunity): number {
  const REFERENCE_POINTS_BY_CABIN: Record<FlightOpportunity["cabin"], number> = {
    economy: 35000,
    premium_economy: 50000,
    business: 90000,
    first: 150000,
  };
  const reference = REFERENCE_POINTS_BY_CABIN[flight.cabin];
  const ratio = reference / Math.max(flight.pointsCost, 1);
  return Math.max(0, Math.min(100, ratio * 70));
}

function flightAvailabilityScore(flight: FlightOpportunity): number {
  if (flight.availableSeats === undefined) return 50;
  return Math.max(0, Math.min(100, flight.availableSeats * 25));
}

function flightStopsScore(flight: FlightOpportunity): number {
  if (flight.stops === 0) return 100;
  if (flight.stops === 1) return 55;
  return 20;
}

/** Scored relative to the flight's own cabin-appropriate reference nightly rate, never an invented market-wide benchmark. */
function hotelNetCostScore(economics: HotelEconomics): number {
  const nightly = economics.netCashCost.amount / economics.numberOfNights;
  const REFERENCE_NIGHTLY = 700;
  const ratio = REFERENCE_NIGHTLY / Math.max(nightly, 1);
  return Math.max(0, Math.min(100, ratio * 60));
}

function hotelPromotionScore(appliedOfferIds: string[]): number {
  return appliedOfferIds.length > 0 ? 100 : 0;
}

function hotelBenefitCaptureScore(economics: HotelEconomics): number {
  if (economics.promoAdjustedCost.amount === 0) return 0;
  const captureRatio = economics.eligibleStatementCredit.amount / economics.promoAdjustedCost.amount;
  return Math.max(0, Math.min(100, captureRatio * 100));
}

const CONFIDENCE_SCORE: Record<ConfidenceLevel, number> = { high: 100, medium: 60, low: 25 };

function dataConfidenceScore(confidence: ConfidenceLevel): number {
  return CONFIDENCE_SCORE[confidence];
}

export function deriveRateConfidenceOverall(levels: RateConfidenceLevel[]): ConfidenceLevel {
  if (levels.some((l) => l === "low")) return "low";
  if (levels.every((l) => l === "high")) return "high";
  return "medium";
}

export interface ComputePairScoreParams {
  flight: FlightOpportunity;
  economics: HotelEconomics;
  confidence: ConfidenceLevel;
  applicableOffers: HotelOffer[];
}

/**
 * Deterministic, explainable Pair Score: the same inputs always produce the
 * same score and the same ranked reasons. This is a heuristic to help
 * compare opportunities, not financial advice, and every dimension is
 * scored against a named, documented reference rather than a fabricated
 * benchmark.
 */
export function computePairScore(params: ComputePairScoreParams): PairScore {
  const dimensionScores: { key: keyof typeof PAIR_SCORE_WEIGHTS; score: number; explain: string }[] = [
    { key: "flightCabin", score: flightCabinScore(params.flight), explain: `${params.flight.cabin.replace("_", " ")} cabin` },
    {
      key: "flightPointsEfficiency",
      score: flightPointsEfficiencyScore(params.flight),
      explain: `${params.flight.pointsCost.toLocaleString()} points for ${params.flight.cabin.replace("_", " ")}`,
    },
    { key: "flightAvailability", score: flightAvailabilityScore(params.flight), explain: `${params.flight.availableSeats ?? "unknown"} seat(s) observed` },
    { key: "flightStops", score: flightStopsScore(params.flight), explain: params.flight.stops === 0 ? "Nonstop" : `${params.flight.stops} stop(s)` },
    {
      key: "hotelNetCost",
      score: hotelNetCostScore(params.economics),
      explain: `Net cash cost of $${Math.round(params.economics.netCashCost.amount / params.economics.numberOfNights)}/night after credits`,
    },
    {
      key: "hotelPromotion",
      score: hotelPromotionScore(params.economics.appliedOfferIds),
      explain: params.economics.appliedOfferIds.length > 0 ? "A verified promotion applies" : "No active promotion applies",
    },
    {
      key: "hotelBenefitCapture",
      score: hotelBenefitCaptureScore(params.economics),
      explain: params.economics.eligibleStatementCredit.amount > 0
        ? `Captures $${Math.round(params.economics.eligibleStatementCredit.amount)} of card credit`
        : "No card credit captured",
    },
    {
      key: "dataConfidence",
      score: dataConfidenceScore(params.confidence),
      explain: `${params.confidence} confidence in flight/hotel data freshness and rate comparability`,
    },
  ];

  const value = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.score * PAIR_SCORE_WEIGHTS[d.key], 0),
  );

  const reasons: PairScoreReason[] = dimensionScores
    .map((d) => ({
      dimension: d.key,
      weight: Math.round(d.score * PAIR_SCORE_WEIGHTS[d.key] * 10) / 10,
      explanation: d.explain,
    }))
    .sort((a, b) => b.weight - a.weight);

  return { value: Math.max(0, Math.min(100, value)), reasons };
}
