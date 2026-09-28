import type { CurrencyCode } from "./common";

interface EffectiveDated {
  effectiveFrom: string;
  effectiveTo?: string;
  sourceUrl?: string;
  verifiedAt: string;
}

/** A benefit granted by the program itself to all participating properties, unless overridden. */
export interface HotelProgramBenefit extends EffectiveDated {
  id: string;
  programId: string;
  type: "breakfast" | "property_credit" | "room_upgrade" | "early_checkin" | "late_checkout" | "other";
  description: string;
  amount?: { value: number; currency: CurrencyCode };
}

/** A property-specific benefit, or an override/exception to a program-level benefit. */
export interface HotelPropertyBenefit extends EffectiveDated {
  id: string;
  hotelId: string;
  programId: string;
  overridesProgramBenefitId?: string;
  type: HotelProgramBenefit["type"];
  description: string;
  amount?: { value: number; currency: CurrencyCode };
}

/** A card's statement-credit or benefit rule, independent of any specific hotel program. */
export interface CardBenefitRule extends EffectiveDated {
  id: string;
  cardProductId: string;
  type: "hotel_statement_credit" | "annual_travel_credit" | "other";
  /** Which hotel program(s) a qualifying stay must be booked through, if any. */
  applicableProgramIds?: string[];
  maxAmount: { value: number; currency: CurrencyCode };
  /** e.g. "calendar_year", "cardmember_year" — how often maxAmount resets. */
  period: "calendar_year" | "cardmember_year" | "per_stay";
  minimumNights?: number;
  requiresPrepaidBooking?: boolean;
  requiresBookingChannel?: string;
}

export type HotelOfferType =
  | "free_night"
  | "percentage_discount"
  | "fixed_discount"
  | "additional_property_credit"
  | "provider_quoted_discount";

/** A temporary, verifiable hotel promotion. Never applied without checking eligibility windows. */
export interface HotelOffer {
  id: string;
  hotelId?: string;
  programId?: string;
  type: HotelOfferType;
  description: string;
  discountPercentage?: number;
  discountAmount?: { value: number; currency: CurrencyCode };
  additionalCreditAmount?: { value: number; currency: CurrencyCode };
  minimumNights?: number;
  maximumNights?: number;
  bookingWindowStart?: string;
  bookingWindowEnd?: string;
  stayWindowStart?: string;
  stayWindowEnd?: string;
  blackoutDates?: string[];
  eligibleCardProductIds?: string[];
  sourceUrl?: string;
  verifiedAt: string;
}

export function isOfferEligible(
  offer: HotelOffer,
  params: { checkInDate: string; checkOutDate: string; nights: number; today: string; cardProductId?: string },
): boolean {
  if (offer.minimumNights && params.nights < offer.minimumNights) return false;
  if (offer.maximumNights && params.nights > offer.maximumNights) return false;
  if (offer.bookingWindowStart && params.today < offer.bookingWindowStart) return false;
  if (offer.bookingWindowEnd && params.today > offer.bookingWindowEnd) return false;
  if (offer.stayWindowStart && params.checkInDate < offer.stayWindowStart) return false;
  if (offer.stayWindowEnd && params.checkOutDate > offer.stayWindowEnd) return false;
  if (offer.blackoutDates?.some((d) => d >= params.checkInDate && d < params.checkOutDate)) return false;
  if (
    offer.eligibleCardProductIds &&
    offer.eligibleCardProductIds.length > 0 &&
    (!params.cardProductId || !offer.eligibleCardProductIds.includes(params.cardProductId))
  ) {
    return false;
  }
  return true;
}
