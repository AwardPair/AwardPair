import type { Money } from "./common";

/**
 * The full cash/perk breakdown for one hotel stay. Cash figures and
 * subjective figures are kept as separate named fields on purpose — no
 * function in this codebase should collapse them into one number.
 */
export interface HotelEconomics {
  currency: string;
  /** Sum of nightly room charges + taxes + mandatory fees. */
  grossHotelCost: Money;
  /** grossHotelCost minus any verified cash-reducing promotion. */
  promoAdjustedCost: Money;
  /** min(remaining eligible card credit, eligible purchase amount). */
  eligibleStatementCredit: Money;
  /** promoAdjustedCost minus eligibleStatementCredit — the real cash outlay. */
  netCashCost: Money;
  /** Sum of user-valued soft perks (breakfast, usable property credit, etc). Optional/subjective. */
  softBenefitValue: Money;
  /** netCashCost minus softBenefitValue. Never shown without the netCashCost it derives from. */
  subjectiveNetValue: Money;
  /** subjectiveNetValue / numberOfNights. */
  subjectiveEffectiveNightlyRate: Money;
  numberOfNights: number;
  appliedOfferIds: string[];
  appliedBenefitIds: string[];
}
