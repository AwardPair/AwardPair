import type { CardBenefitRule, HotelProgramBenefit, HotelPropertyBenefit } from "@/lib/domain";

function isEffective(record: { effectiveFrom: string; effectiveTo?: string }, onDate: string): boolean {
  if (record.effectiveFrom > onDate) return false;
  if (record.effectiveTo && record.effectiveTo < onDate) return false;
  return true;
}

/**
 * Resolves which benefits actually apply for a hotel/program pair on a given
 * date: property-specific benefits take precedence over the program-level
 * benefit they override, and everything is filtered by effective dates.
 */
export function resolveActiveHotelBenefits(params: {
  programBenefits: HotelProgramBenefit[];
  propertyBenefits: HotelPropertyBenefit[];
  programId: string;
  hotelId: string;
  onDate: string;
}): (HotelProgramBenefit | HotelPropertyBenefit)[] {
  const activePropertyBenefits = params.propertyBenefits.filter(
    (b) => b.programId === params.programId && b.hotelId === params.hotelId && isEffective(b, params.onDate),
  );
  const overriddenIds = new Set(
    activePropertyBenefits.map((b) => b.overridesProgramBenefitId).filter((id): id is string => Boolean(id)),
  );
  const activeProgramBenefits = params.programBenefits.filter(
    (b) => b.programId === params.programId && isEffective(b, params.onDate) && !overriddenIds.has(b.id),
  );
  return [...activeProgramBenefits, ...activePropertyBenefits];
}

/** Whether a card's statement-credit rule can apply to this stay, per its own eligibility rules. */
export function isCardBenefitEligible(
  rule: CardBenefitRule,
  params: { programId: string; nights: number; isPrepaid: boolean; onDate: string },
): boolean {
  if (!isEffective(rule, params.onDate)) return false;
  if (rule.applicableProgramIds && !rule.applicableProgramIds.includes(params.programId)) return false;
  if (rule.minimumNights && params.nights < rule.minimumNights) return false;
  if (rule.requiresPrepaidBooking && !params.isPrepaid) return false;
  return true;
}
