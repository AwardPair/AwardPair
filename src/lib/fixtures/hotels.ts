import type {
  Hotel,
  HotelProgram,
  HotelProgramMembership,
  HotelRateObservation,
  RateComparability,
} from "@/lib/domain";
import { assessRateConfidence } from "@/lib/domain";

/**
 * DEMO DATA — illustrative Tokyo luxury-hotel fixtures for the NYC<->Tokyo
 * demo scenario. Real property names are used to make the demo concrete,
 * but no rate, availability, or program-membership fact here has been
 * verified against an authoritative current source. See
 * docs/data-sources.md before treating any of this as real.
 */

export const DEMO_HOTEL_PROGRAMS: Record<string, HotelProgram> = {
  AMEX_FHR: { id: "amex-fhr", name: "Fine Hotels + Resorts", issuer: "American Express" },
  AMEX_THC: { id: "amex-thc", name: "The Hotel Collection", issuer: "American Express" },
  CHASE_EDIT: { id: "chase-the-edit", name: "The Edit", issuer: "Chase" },
};

export const DEMO_HOTELS: Record<string, Hotel> = {
  AMAN_TOKYO: { id: "hotel-aman-tokyo", name: "Aman Tokyo", city: "Tokyo", countryCode: "JP" },
  PARK_HYATT_TOKYO: { id: "hotel-park-hyatt-tokyo", name: "Park Hyatt Tokyo", city: "Tokyo", countryCode: "JP" },
  PENINSULA_TOKYO: { id: "hotel-peninsula-tokyo", name: "The Peninsula Tokyo", city: "Tokyo", countryCode: "JP" },
};

export const DEMO_HOTEL_PROGRAMS_BY_ID: Record<string, HotelProgram> = Object.fromEntries(
  Object.values(DEMO_HOTEL_PROGRAMS).map((program) => [program.id, program]),
);

export const DEMO_HOTELS_BY_ID: Record<string, Hotel> = Object.fromEntries(
  Object.values(DEMO_HOTELS).map((hotel) => [hotel.id, hotel]),
);

export function demoHotelsForCity(city: string): Hotel[] {
  return Object.values(DEMO_HOTELS).filter((hotel) => hotel.city === city);
}

const VERIFIED_AT = "2026-09-01T00:00:00Z";

export const DEMO_HOTEL_MEMBERSHIPS: HotelProgramMembership[] = [
  {
    id: "mem-aman-fhr", hotelId: DEMO_HOTELS.AMAN_TOKYO.id, programId: DEMO_HOTEL_PROGRAMS.AMEX_FHR.id,
    validFrom: "2024-01-01", firstSeenAt: "2024-01-01T00:00:00Z", lastVerifiedAt: VERIFIED_AT,
    verificationMethod: "UNVERIFIED_DEMO",
  },
  {
    id: "mem-parkhyatt-thc", hotelId: DEMO_HOTELS.PARK_HYATT_TOKYO.id, programId: DEMO_HOTEL_PROGRAMS.AMEX_THC.id,
    validFrom: "2024-01-01", firstSeenAt: "2024-01-01T00:00:00Z", lastVerifiedAt: VERIFIED_AT,
    verificationMethod: "UNVERIFIED_DEMO",
  },
  {
    id: "mem-peninsula-fhr", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, programId: DEMO_HOTEL_PROGRAMS.AMEX_FHR.id,
    validFrom: "2024-01-01", firstSeenAt: "2024-01-01T00:00:00Z", lastVerifiedAt: VERIFIED_AT,
    verificationMethod: "UNVERIFIED_DEMO",
  },
  {
    id: "mem-peninsula-edit", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, programId: DEMO_HOTEL_PROGRAMS.CHASE_EDIT.id,
    validFrom: "2024-06-01", firstSeenAt: "2024-06-01T00:00:00Z", lastVerifiedAt: VERIFIED_AT,
    verificationMethod: "UNVERIFIED_DEMO",
  },
];

const FULL_COMPARABILITY: RateComparability = {
  propertyMatch: true, datesMatch: true, roomTypeKnown: true, occupancyKnown: true,
  refundabilityKnown: true, mealInclusionKnown: true, taxesAndFeesKnown: true,
};

const PARTIAL_COMPARABILITY: RateComparability = {
  propertyMatch: true, datesMatch: true, roomTypeKnown: false, occupancyKnown: true,
  refundabilityKnown: false, mealInclusionKnown: false, taxesAndFeesKnown: true,
};

function buildRate(params: {
  id: string;
  hotelId: string;
  checkInDate: string;
  nights: number;
  nightlyRate: number;
  taxRate?: number;
  mandatoryFees?: number;
  refundable?: boolean;
  mealInclusion?: HotelRateObservation["mealInclusion"];
  comparability?: RateComparability;
}): HotelRateObservation {
  const checkOut = new Date(`${params.checkInDate}T00:00:00Z`);
  checkOut.setUTCDate(checkOut.getUTCDate() + params.nights);
  const checkOutDate = checkOut.toISOString().slice(0, 10);
  const nightRows = Array.from({ length: params.nights }, (_, i) => {
    const d = new Date(`${params.checkInDate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return { stayDate: d.toISOString().slice(0, 10), roomRate: { amount: params.nightlyRate, currency: "USD" } };
  });
  const grossRoom = params.nightlyRate * params.nights;
  const comparability = params.comparability ?? PARTIAL_COMPARABILITY;
  return {
    id: params.id,
    hotelId: params.hotelId,
    checkInDate: params.checkInDate,
    checkOutDate,
    nights: nightRows,
    taxes: { amount: Math.round(grossRoom * (params.taxRate ?? 0.1)), currency: "USD" },
    mandatoryFees: { amount: params.mandatoryFees ?? 0, currency: "USD" },
    refundable: params.refundable ?? false,
    mealInclusion: params.mealInclusion ?? "none",
    provenance: "MOCK_RATE",
    confidence: assessRateConfidence("MOCK_RATE", comparability),
    freshness: { observedAt: VERIFIED_AT, source: "MOCK" },
  };
}

/** DEMO rate observations keyed by hotel id, covering the demo check-in window. */
export const DEMO_HOTEL_RATES: HotelRateObservation[] = [
  buildRate({ id: "rate-aman-04-02", hotelId: DEMO_HOTELS.AMAN_TOKYO.id, checkInDate: "2026-04-02", nights: 4, nightlyRate: 1450, comparability: FULL_COMPARABILITY, refundable: true, mealInclusion: "breakfast" }),
  buildRate({ id: "rate-aman-04-06", hotelId: DEMO_HOTELS.AMAN_TOKYO.id, checkInDate: "2026-04-06", nights: 3, nightlyRate: 1450, comparability: FULL_COMPARABILITY, refundable: true, mealInclusion: "breakfast" }),
  buildRate({ id: "rate-parkhyatt-04-03", hotelId: DEMO_HOTELS.PARK_HYATT_TOKYO.id, checkInDate: "2026-04-03", nights: 4, nightlyRate: 780, comparability: FULL_COMPARABILITY, mealInclusion: "breakfast" }),
  buildRate({ id: "rate-parkhyatt-04-08", hotelId: DEMO_HOTELS.PARK_HYATT_TOKYO.id, checkInDate: "2026-04-08", nights: 3, nightlyRate: 780, comparability: PARTIAL_COMPARABILITY }),
  buildRate({ id: "rate-peninsula-04-04", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, checkInDate: "2026-04-04", nights: 4, nightlyRate: 920, comparability: FULL_COMPARABILITY, mealInclusion: "breakfast" }),
  buildRate({ id: "rate-peninsula-04-09", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, checkInDate: "2026-04-09", nights: 3, nightlyRate: 920, comparability: PARTIAL_COMPARABILITY }),
  buildRate({ id: "rate-peninsula-04-11", hotelId: DEMO_HOTELS.PENINSULA_TOKYO.id, checkInDate: "2026-04-11", nights: 3, nightlyRate: 950, comparability: PARTIAL_COMPARABILITY }),
];
