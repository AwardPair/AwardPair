import type { Freshness } from "./common";
import type { HotelEconomics } from "./economics";
import type { FlightOpportunity } from "./flight";
import type { HotelOffer, HotelProgramBenefit, HotelPropertyBenefit, CardBenefitRule } from "./benefits";
import type { HotelStayOpportunity } from "./hotel";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface PairScoreReason {
  dimension: string;
  /** Positive contributes to the score, negative detracts. */
  weight: number;
  explanation: string;
}

export interface PairScore {
  /** 0-100, deterministic given the same inputs and weight configuration. */
  value: number;
  reasons: PairScoreReason[];
}

export interface Pair {
  id: string;
  flight: FlightOpportunity;
  hotelStay: HotelStayOpportunity;
  /** Which of the hotel's active program memberships this Pair's economics/benefits were computed under. */
  programId: string;
  appliedBenefits: (HotelProgramBenefit | HotelPropertyBenefit | CardBenefitRule)[];
  applicableOffers: HotelOffer[];
  economics: HotelEconomics;
  score: PairScore;
  confidence: ConfidenceLevel;
  freshness: Freshness;
}
