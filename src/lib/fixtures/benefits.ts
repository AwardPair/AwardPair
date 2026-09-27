import type { CardBenefitRule, CardIssuer, CardProduct, HotelOffer, HotelProgramBenefit, HotelPropertyBenefit } from "@/lib/domain";
import { DEMO_HOTELS, DEMO_HOTEL_PROGRAMS } from "./hotels";

/**
 * DEMO DATA — illustrative program benefits, property overrides, card
 * statement-credit rules, and offers. Amounts are placeholders for UI
 * development and are not verified against current program terms. See
 * docs/data-sources.md.
 */

const VERIFIED_AT = "2026-09-01T00:00:00Z";
const EFFECTIVE_FROM = "2024-01-01";

export const DEMO_CARD_ISSUERS: Record<string, CardIssuer> = {
  AMEX: { id: "issuer-amex", name: "American Express" },
  CHASE: { id: "issuer-chase", name: "Chase" },
};

export const DEMO_CARD_PRODUCTS: Record<string, CardProduct> = {
  AMEX_PLATINUM: { id: "card-amex-platinum", issuerId: DEMO_CARD_ISSUERS.AMEX.id, name: "Platinum Card" },
  CHASE_SAPPHIRE_RESERVE: { id: "card-csr", issuerId: DEMO_CARD_ISSUERS.CHASE.id, name: "Sapphire Reserve" },
};

export const DEMO_PROGRAM_BENEFITS: HotelProgramBenefit[] = [
  {
    id: "pb-fhr-breakfast", programId: DEMO_HOTEL_PROGRAMS.AMEX_FHR.id, type: "breakfast",
    description: "Daily breakfast for two (illustrative — verify per property).",
    effectiveFrom: EFFECTIVE_FROM, verifiedAt: VERIFIED_AT,
  },
  {
    id: "pb-fhr-credit", programId: DEMO_HOTEL_PROGRAMS.AMEX_FHR.id, type: "property_credit",
    description: "Illustrative property credit (amount varies by property; not verified).",
    amount: { value: 100, currency: "USD" },
    effectiveFrom: EFFECTIVE_FROM, verifiedAt: VERIFIED_AT,
  },
  {
    id: "pb-thc-credit", programId: DEMO_HOTEL_PROGRAMS.AMEX_THC.id, type: "property_credit",
    description: "Illustrative property credit for a qualifying 2+ night stay (not verified).",
    amount: { value: 100, currency: "USD" },
    effectiveFrom: EFFECTIVE_FROM, verifiedAt: VERIFIED_AT,
  },
];

export const DEMO_PROPERTY_BENEFITS: HotelPropertyBenefit[] = [
  {
    id: "prop-peninsula-latecheckout", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, programId: DEMO_HOTEL_PROGRAMS.AMEX_FHR.id,
    type: "late_checkout", description: "Guaranteed 4pm late checkout, subject to availability (illustrative).",
    effectiveFrom: EFFECTIVE_FROM, verifiedAt: VERIFIED_AT,
  },
];

export const DEMO_CARD_BENEFIT_RULES: CardBenefitRule[] = [
  {
    id: "cbr-platinum-fhr-credit", cardProductId: DEMO_CARD_PRODUCTS.AMEX_PLATINUM.id, type: "hotel_statement_credit",
    applicableProgramIds: [DEMO_HOTEL_PROGRAMS.AMEX_FHR.id, DEMO_HOTEL_PROGRAMS.AMEX_THC.id],
    maxAmount: { value: 200, currency: "USD" }, period: "calendar_year", minimumNights: 2,
    requiresPrepaidBooking: true,
    effectiveFrom: EFFECTIVE_FROM, verifiedAt: VERIFIED_AT,
  },
  {
    id: "cbr-csr-edit-credit", cardProductId: DEMO_CARD_PRODUCTS.CHASE_SAPPHIRE_RESERVE.id, type: "hotel_statement_credit",
    applicableProgramIds: [DEMO_HOTEL_PROGRAMS.CHASE_EDIT.id],
    maxAmount: { value: 250, currency: "USD" }, period: "calendar_year",
    effectiveFrom: EFFECTIVE_FROM, verifiedAt: VERIFIED_AT,
  },
];

export const DEMO_HOTEL_OFFERS: HotelOffer[] = [
  {
    id: "offer-parkhyatt-4th-night", hotelId: DEMO_HOTELS.PARK_HYATT_TOKYO.id, type: "free_night",
    description: "4th night free on stays of 4+ nights (illustrative promo).",
    minimumNights: 4,
    stayWindowStart: "2026-01-01", stayWindowEnd: "2026-12-31",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "offer-peninsula-credit", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, type: "additional_property_credit",
    description: "Additional $75 dining credit on prepaid bookings (illustrative promo).",
    additionalCreditAmount: { value: 75, currency: "USD" },
    minimumNights: 3,
    stayWindowStart: "2026-01-01", stayWindowEnd: "2026-12-31",
    verifiedAt: VERIFIED_AT,
  },
];
