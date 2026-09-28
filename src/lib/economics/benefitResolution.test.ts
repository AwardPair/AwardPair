import { describe, expect, it } from "vitest";
import type { CardBenefitRule, HotelProgramBenefit, HotelPropertyBenefit } from "@/lib/domain";
import { isCardBenefitEligible, resolveActiveHotelBenefits } from "./benefitResolution";

const PROGRAM_ID = "prog-1";
const HOTEL_ID = "hotel-1";

describe("resolveActiveHotelBenefits", () => {
  const programBreakfast: HotelProgramBenefit = {
    id: "pb-breakfast", programId: PROGRAM_ID, type: "breakfast", description: "Breakfast",
    effectiveFrom: "2024-01-01", verifiedAt: "2026-01-01T00:00:00Z",
  };
  const programCredit: HotelProgramBenefit = {
    id: "pb-credit", programId: PROGRAM_ID, type: "property_credit", description: "Credit",
    amount: { value: 100, currency: "USD" }, effectiveFrom: "2024-01-01", verifiedAt: "2026-01-01T00:00:00Z",
  };

  it("includes active program benefits by default", () => {
    const active = resolveActiveHotelBenefits({
      programBenefits: [programBreakfast, programCredit],
      propertyBenefits: [],
      programId: PROGRAM_ID, hotelId: HOTEL_ID, onDate: "2026-06-01",
    });
    expect(active.map((b) => b.id).sort()).toEqual(["pb-breakfast", "pb-credit"]);
  });

  it("excludes program benefits outside their effective window", () => {
    const expired: HotelProgramBenefit = { ...programCredit, id: "pb-expired", effectiveTo: "2025-12-31" };
    const active = resolveActiveHotelBenefits({
      programBenefits: [expired], propertyBenefits: [], programId: PROGRAM_ID, hotelId: HOTEL_ID, onDate: "2026-06-01",
    });
    expect(active).toHaveLength(0);
  });

  it("lets a property benefit override the program benefit it replaces", () => {
    const override: HotelPropertyBenefit = {
      id: "prop-credit", hotelId: HOTEL_ID, programId: PROGRAM_ID, overridesProgramBenefitId: "pb-credit",
      type: "property_credit", description: "Bigger credit at this property",
      amount: { value: 250, currency: "USD" }, effectiveFrom: "2024-01-01", verifiedAt: "2026-01-01T00:00:00Z",
    };
    const active = resolveActiveHotelBenefits({
      programBenefits: [programBreakfast, programCredit], propertyBenefits: [override],
      programId: PROGRAM_ID, hotelId: HOTEL_ID, onDate: "2026-06-01",
    });
    const ids = active.map((b) => b.id).sort();
    expect(ids).toEqual(["pb-breakfast", "prop-credit"]);
    expect(ids).not.toContain("pb-credit");
  });

  it("does not apply a property benefit to a different hotel", () => {
    const otherHotelBenefit: HotelPropertyBenefit = {
      id: "prop-other", hotelId: "hotel-2", programId: PROGRAM_ID, type: "late_checkout",
      description: "Late checkout", effectiveFrom: "2024-01-01", verifiedAt: "2026-01-01T00:00:00Z",
    };
    const active = resolveActiveHotelBenefits({
      programBenefits: [], propertyBenefits: [otherHotelBenefit], programId: PROGRAM_ID, hotelId: HOTEL_ID, onDate: "2026-06-01",
    });
    expect(active).toHaveLength(0);
  });
});

describe("isCardBenefitEligible", () => {
  const rule: CardBenefitRule = {
    id: "cbr-1", cardProductId: "card-1", type: "hotel_statement_credit",
    applicableProgramIds: [PROGRAM_ID], maxAmount: { value: 200, currency: "USD" },
    period: "calendar_year", minimumNights: 2, requiresPrepaidBooking: true,
    effectiveFrom: "2024-01-01", verifiedAt: "2026-01-01T00:00:00Z",
  };

  it("is eligible when program, nights, and prepaid requirements are all met", () => {
    expect(isCardBenefitEligible(rule, { programId: PROGRAM_ID, nights: 3, isPrepaid: true, onDate: "2026-06-01" })).toBe(true);
  });

  it("rejects a program the rule does not cover", () => {
    expect(isCardBenefitEligible(rule, { programId: "other-program", nights: 3, isPrepaid: true, onDate: "2026-06-01" })).toBe(false);
  });

  it("enforces minimum-stay eligibility", () => {
    expect(isCardBenefitEligible(rule, { programId: PROGRAM_ID, nights: 1, isPrepaid: true, onDate: "2026-06-01" })).toBe(false);
  });

  it("enforces the prepaid-booking requirement", () => {
    expect(isCardBenefitEligible(rule, { programId: PROGRAM_ID, nights: 3, isPrepaid: false, onDate: "2026-06-01" })).toBe(false);
  });

  it("respects the rule's effective date range", () => {
    const expired: CardBenefitRule = { ...rule, effectiveTo: "2025-12-31" };
    expect(isCardBenefitEligible(expired, { programId: PROGRAM_ID, nights: 3, isPrepaid: true, onDate: "2026-06-01" })).toBe(false);
  });
});
