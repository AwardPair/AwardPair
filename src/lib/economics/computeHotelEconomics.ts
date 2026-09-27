import type {
  BenefitPreferences,
  CardBenefitRule,
  HotelEconomics,
  HotelOffer,
  HotelProgramBenefit,
  HotelPropertyBenefit,
  HotelRateObservation,
  Money,
} from "@/lib/domain";
import { addMoney, isOfferEligible, subtractMoney, zeroMoney } from "@/lib/domain";
import { isCardBenefitEligible } from "./benefitResolution";

export interface ComputeHotelEconomicsParams {
  rate: HotelRateObservation;
  /** All offers scoped to this hotel/program; eligibility is (re)checked internally. */
  candidateOffers: HotelOffer[];
  /** The benefits already resolved as active for this hotel/program/date (see resolveActiveHotelBenefits). */
  activeBenefits: (HotelProgramBenefit | HotelPropertyBenefit)[];
  cardBenefit?: {
    rule: CardBenefitRule;
    programId: string;
    /** How much of the rule's per-period max the user has not yet used. */
    remainingCredit: Money;
    isPrepaidBooking: boolean;
  };
  preferences: BenefitPreferences;
  partySize: number;
  today: string;
}

function grossRoomTotal(rate: HotelRateObservation): Money {
  const currency = rate.taxes.currency;
  return rate.nights.reduce((sum, n) => addMoney(sum, n.roomRate), zeroMoney(currency));
}

export function computeHotelEconomics(params: ComputeHotelEconomicsParams): HotelEconomics {
  const { rate } = params;
  const currency = rate.taxes.currency;
  const nights = rate.nights.length;
  const roomTotal = grossRoomTotal(rate);
  const grossHotelCost = addMoney(addMoney(roomTotal, rate.taxes), rate.mandatoryFees);

  const eligibleOffers = params.candidateOffers.filter((offer) =>
    isOfferEligible(offer, {
      checkInDate: rate.checkInDate,
      checkOutDate: rate.checkOutDate,
      nights,
      today: params.today,
    }),
  );

  const cashReducingOffers = eligibleOffers.filter(
    (o) => o.type === "free_night" || o.type === "percentage_discount" || o.type === "fixed_discount" || o.type === "provider_quoted_discount",
  );
  const averageNightlyRoomRate = roomTotal.amount / nights;
  let promoDiscount = 0;
  const appliedOfferIds: string[] = [];
  for (const offer of cashReducingOffers) {
    if (offer.type === "free_night") {
      promoDiscount += averageNightlyRoomRate;
      appliedOfferIds.push(offer.id);
    } else if (offer.type === "percentage_discount" && offer.discountPercentage) {
      promoDiscount += roomTotal.amount * (offer.discountPercentage / 100);
      appliedOfferIds.push(offer.id);
    } else if ((offer.type === "fixed_discount" || offer.type === "provider_quoted_discount") && offer.discountAmount) {
      promoDiscount += offer.discountAmount.value;
      appliedOfferIds.push(offer.id);
    }
  }
  const promoAdjustedCost: Money = {
    amount: Math.max(0, grossHotelCost.amount - promoDiscount),
    currency,
  };

  let eligibleStatementCredit = zeroMoney(currency);
  const appliedBenefitIds: string[] = [];
  if (
    params.cardBenefit &&
    isCardBenefitEligible(params.cardBenefit.rule, {
      programId: params.cardBenefit.programId,
      nights,
      isPrepaid: params.cardBenefit.isPrepaidBooking,
      onDate: params.today,
    })
  ) {
    eligibleStatementCredit = {
      amount: Math.min(params.cardBenefit.remainingCredit.amount, promoAdjustedCost.amount),
      currency,
    };
    appliedBenefitIds.push(params.cardBenefit.rule.id);
  }

  const netCashCost = subtractMoney(promoAdjustedCost, eligibleStatementCredit);

  let softBenefitValue = 0;
  const hasBreakfastBenefit = params.activeBenefits.some((b) => b.type === "breakfast");
  if (hasBreakfastBenefit && rate.mealInclusion !== "breakfast" && rate.mealInclusion !== "full_board" && rate.mealInclusion !== "half_board") {
    softBenefitValue += params.preferences.breakfastValuePerPerson.value * params.partySize;
    appliedBenefitIds.push(...params.activeBenefits.filter((b) => b.type === "breakfast").map((b) => b.id));
  }
  const propertyCreditBenefits = params.activeBenefits.filter((b) => b.type === "property_credit" && b.amount);
  for (const b of propertyCreditBenefits) {
    softBenefitValue += (b.amount?.value ?? 0) * params.preferences.propertyCreditUsableFraction;
    appliedBenefitIds.push(b.id);
  }
  const propertyCreditOffers = eligibleOffers.filter((o) => o.type === "additional_property_credit" && o.additionalCreditAmount);
  for (const o of propertyCreditOffers) {
    softBenefitValue += (o.additionalCreditAmount?.value ?? 0) * params.preferences.propertyCreditUsableFraction;
    appliedOfferIds.push(o.id);
  }
  if (params.preferences.lateCheckoutValue && params.activeBenefits.some((b) => b.type === "late_checkout")) {
    softBenefitValue += params.preferences.lateCheckoutValue.value;
    appliedBenefitIds.push(...params.activeBenefits.filter((b) => b.type === "late_checkout").map((b) => b.id));
  }

  const softBenefitValueMoney: Money = { amount: softBenefitValue, currency };
  const subjectiveNetValue = subtractMoney(netCashCost, softBenefitValueMoney);
  const subjectiveEffectiveNightlyRate: Money = { amount: subjectiveNetValue.amount / nights, currency };

  return {
    currency,
    grossHotelCost,
    promoAdjustedCost,
    eligibleStatementCredit,
    netCashCost,
    softBenefitValue: softBenefitValueMoney,
    subjectiveNetValue,
    subjectiveEffectiveNightlyRate,
    numberOfNights: nights,
    appliedOfferIds: [...new Set(appliedOfferIds)],
    appliedBenefitIds: [...new Set(appliedBenefitIds)],
  };
}
