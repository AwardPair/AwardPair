import { describe, expect, it } from "vitest";
import type { BenefitPreferences, CardBenefitRule, HotelOffer, HotelProgramBenefit, HotelRateObservation } from "@/lib/domain";
import { assessRateConfidence } from "@/lib/domain";
import { computeHotelEconomics } from "./computeHotelEconomics";

const PROGRAM_ID = "prog-1";
const HOTEL_ID = "hotel-1";
const TODAY = "2026-06-01";

const FULL_COMPARABILITY = {
  propertyMatch: true, datesMatch: true, roomTypeKnown: true, occupancyKnown: true,
  refundabilityKnown: true, mealInclusionKnown: true, taxesAndFeesKnown: true,
};

function baseRate(overrides: Partial<HotelRateObservation> = {}): HotelRateObservation {
  return {
    id: "rate-1",
    hotelId: HOTEL_ID,
    checkInDate: "2026-07-01",
    checkOutDate: "2026-07-04",
    nights: [
      { stayDate: "2026-07-01", roomRate: { amount: 300, currency: "USD" } },
      { stayDate: "2026-07-02", roomRate: { amount: 300, currency: "USD" } },
      { stayDate: "2026-07-03", roomRate: { amount: 300, currency: "USD" } },
    ],
    taxes: { amount: 90, currency: "USD" },
    mandatoryFees: { amount: 30, currency: "USD" },
    refundable: true,
    mealInclusion: "none",
    provenance: "MOCK_RATE",
    confidence: assessRateConfidence("MOCK_RATE", FULL_COMPARABILITY),
    freshness: { observedAt: TODAY, source: "MOCK" },
    ...overrides,
  };
}

const PREFERENCES: BenefitPreferences = {
  userId: "user-1",
  breakfastValuePerPerson: { value: 25, currency: "USD" },
  propertyCreditUsableFraction: 0.75,
};

const BREAKFAST_BENEFIT: HotelProgramBenefit = {
  id: "pb-breakfast", programId: PROGRAM_ID, type: "breakfast", description: "Breakfast",
  effectiveFrom: "2024-01-01", verifiedAt: TODAY,
};
const CREDIT_BENEFIT: HotelProgramBenefit = {
  id: "pb-credit", programId: PROGRAM_ID, type: "property_credit", description: "Credit",
  amount: { value: 100, currency: "USD" }, effectiveFrom: "2024-01-01", verifiedAt: TODAY,
};

const CARD_RULE: CardBenefitRule = {
  id: "cbr-1", cardProductId: "card-1", type: "hotel_statement_credit",
  applicableProgramIds: [PROGRAM_ID], maxAmount: { value: 200, currency: "USD" },
  period: "calendar_year", minimumNights: 2, requiresPrepaidBooking: true,
  effectiveFrom: "2024-01-01", verifiedAt: TODAY,
};

describe("computeHotelEconomics", () => {
  it("sums nightly room charges plus taxes and mandatory fees for grossHotelCost", () => {
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [], activeBenefits: [], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.grossHotelCost).toEqual({ amount: 1020, currency: "USD" }); // 900 + 90 + 30
  });

  it("applies a percentage_discount offer to promoAdjustedCost only", () => {
    const offer: HotelOffer = {
      id: "offer-pct", hotelId: HOTEL_ID, type: "percentage_discount", description: "10% off",
      discountPercentage: 10, verifiedAt: TODAY,
    };
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [offer], activeBenefits: [], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.promoAdjustedCost).toEqual({ amount: 930, currency: "USD" }); // 1020 - 10% of 900
    expect(result.appliedOfferIds).toContain("offer-pct");
  });

  it("applies a free_night offer as one night off at the average nightly room rate", () => {
    const offer: HotelOffer = { id: "offer-free-night", hotelId: HOTEL_ID, type: "free_night", description: "4th night free", verifiedAt: TODAY };
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [offer], activeBenefits: [], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.promoAdjustedCost).toEqual({ amount: 720, currency: "USD" }); // 1020 - 300
  });

  it("ignores an offer whose stay window does not cover the booked dates", () => {
    const offer: HotelOffer = {
      id: "offer-out-of-window", hotelId: HOTEL_ID, type: "fixed_discount", description: "Old promo",
      discountAmount: { value: 100, currency: "USD" }, stayWindowStart: "2025-01-01", stayWindowEnd: "2025-12-31", verifiedAt: TODAY,
    };
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [offer], activeBenefits: [], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.promoAdjustedCost).toEqual(result.grossHotelCost);
    expect(result.appliedOfferIds).toHaveLength(0);
  });

  it("caps eligibleStatementCredit at the card's remaining credit", () => {
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [], activeBenefits: [],
      cardBenefit: { rule: CARD_RULE, programId: PROGRAM_ID, remainingCredit: { amount: 50, currency: "USD" }, isPrepaidBooking: true },
      preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.eligibleStatementCredit).toEqual({ amount: 50, currency: "USD" });
    expect(result.netCashCost).toEqual({ amount: 970, currency: "USD" }); // 1020 - 50
  });

  it("caps eligibleStatementCredit at the amount actually owed, not the card max", () => {
    const cheapRate = baseRate({
      nights: [{ stayDate: "2026-07-01", roomRate: { amount: 50, currency: "USD" } }, { stayDate: "2026-07-02", roomRate: { amount: 50, currency: "USD" } }],
      taxes: { amount: 10, currency: "USD" }, mandatoryFees: { amount: 0, currency: "USD" },
      checkOutDate: "2026-07-03",
    });
    const result = computeHotelEconomics({
      rate: cheapRate, candidateOffers: [], activeBenefits: [],
      cardBenefit: { rule: CARD_RULE, programId: PROGRAM_ID, remainingCredit: { amount: 200, currency: "USD" }, isPrepaidBooking: true },
      preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.grossHotelCost).toEqual({ amount: 110, currency: "USD" });
    expect(result.eligibleStatementCredit).toEqual({ amount: 110, currency: "USD" });
    expect(result.netCashCost).toEqual({ amount: 0, currency: "USD" });
  });

  it("denies the card credit when the stay is shorter than the rule's minimum nights", () => {
    const oneNightRate = baseRate({
      nights: [{ stayDate: "2026-07-01", roomRate: { amount: 300, currency: "USD" } }],
      checkOutDate: "2026-07-02",
    });
    const result = computeHotelEconomics({
      rate: oneNightRate, candidateOffers: [], activeBenefits: [],
      cardBenefit: { rule: CARD_RULE, programId: PROGRAM_ID, remainingCredit: { amount: 200, currency: "USD" }, isPrepaidBooking: true },
      preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.eligibleStatementCredit).toEqual({ amount: 0, currency: "USD" });
  });

  it("keeps netCashCost unaffected by soft benefit value (cash/subjective separation)", () => {
    const withoutBenefits = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [], activeBenefits: [], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    const withBenefits = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [], activeBenefits: [BREAKFAST_BENEFIT, CREDIT_BENEFIT], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(withBenefits.netCashCost).toEqual(withoutBenefits.netCashCost);
    expect(withBenefits.softBenefitValue.amount).toBeGreaterThan(0);
    expect(withBenefits.subjectiveNetValue.amount).toBeLessThan(withBenefits.netCashCost.amount);
  });

  it("values breakfast and a usable-fraction-adjusted property credit as soft benefit value", () => {
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [], activeBenefits: [BREAKFAST_BENEFIT, CREDIT_BENEFIT], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    // breakfast: 25 * 2 people = 50; property credit: 100 * 0.75 = 75
    expect(result.softBenefitValue).toEqual({ amount: 125, currency: "USD" });
  });

  it("does not add breakfast soft value when the rate already includes breakfast", () => {
    const result = computeHotelEconomics({
      rate: baseRate({ mealInclusion: "breakfast" }), candidateOffers: [], activeBenefits: [BREAKFAST_BENEFIT],
      preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.softBenefitValue).toEqual({ amount: 0, currency: "USD" });
  });

  it("computes subjectiveEffectiveNightlyRate as subjectiveNetValue / nights", () => {
    const result = computeHotelEconomics({
      rate: baseRate(), candidateOffers: [], activeBenefits: [], preferences: PREFERENCES, partySize: 2, today: TODAY,
    });
    expect(result.subjectiveEffectiveNightlyRate.amount).toBeCloseTo(result.subjectiveNetValue.amount / 3, 5);
  });
});
