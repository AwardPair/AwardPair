import type { Freshness, Money } from "./common";

export interface Hotel {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

/**
 * A premium hotel program (e.g. Amex Fine Hotels + Resorts). Modeled as data
 * so new programs never require a schema/enum change.
 */
export interface HotelProgram {
  id: string;
  name: string;
  issuer: string;
}

/**
 * Whether a hotel currently participates in a program. Versioned rather than
 * a boolean flag, because participating-property lists change over time and
 * a property can rejoin under different terms.
 */
export interface HotelProgramMembership {
  id: string;
  hotelId: string;
  programId: string;
  validFrom: string;
  validTo?: string;
  firstSeenAt: string;
  lastVerifiedAt: string;
  sourceUrl?: string;
  verificationMethod: "OFFICIAL_PROGRAM_PAGE" | "MANUAL_CHECK" | "UNVERIFIED_DEMO";
}

export function isMembershipActive(
  membership: HotelProgramMembership,
  onDate: string,
): boolean {
  if (membership.validFrom > onDate) return false;
  if (membership.validTo && membership.validTo < onDate) return false;
  return true;
}

/**
 * How a HotelRateObservation's price was obtained. Never presented to the
 * user as more authoritative than it is: only LIVE_PROGRAM_RATE reflects an
 * actual program booking price.
 */
export type RateProvenance =
  | "LIVE_PROGRAM_RATE"
  | "REFERENCE_RATE"
  | "USER_VERIFIED_RATE"
  | "CACHED_OBSERVATION"
  | "MOCK_RATE";

export type RateConfidenceLevel = "high" | "medium" | "low";

/** Dimensions that determine how comparable a reference rate is to the real program rate. */
export interface RateComparability {
  propertyMatch: boolean;
  datesMatch: boolean;
  roomTypeKnown: boolean;
  occupancyKnown: boolean;
  refundabilityKnown: boolean;
  mealInclusionKnown: boolean;
  taxesAndFeesKnown: boolean;
}

export interface RateConfidence {
  level: RateConfidenceLevel;
  reason: string;
  comparability: RateComparability;
}

export function assessRateConfidence(
  provenance: RateProvenance,
  comparability: RateComparability,
): RateConfidence {
  if (provenance === "LIVE_PROGRAM_RATE" || provenance === "USER_VERIFIED_RATE") {
    return { level: "high", reason: "Directly observed program/booking price.", comparability };
  }
  const knownCount = Object.values(comparability).filter(Boolean).length;
  const total = Object.keys(comparability).length;
  if (comparability.propertyMatch && comparability.datesMatch && knownCount >= total - 1) {
    return {
      level: "medium",
      reason: "Same property and dates, but some rate terms differ from the program rate.",
      comparability,
    };
  }
  return {
    level: "low",
    reason: "Generic observed rate with limited comparability to the actual program rate.",
    comparability,
  };
}

export interface HotelRateNight {
  stayDate: string;
  roomRate: Money;
}

/**
 * One priced observation of a hotel stay. Room charges are itemized per
 * night; taxes and mandatory fees are separate so downstream economics never
 * has to guess what is included.
 */
export interface HotelRateObservation {
  id: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: HotelRateNight[];
  taxes: Money;
  mandatoryFees: Money;
  refundable: boolean;
  mealInclusion?: "none" | "breakfast" | "half_board" | "full_board";
  provenance: RateProvenance;
  confidence: RateConfidence;
  freshness: Freshness;
}

/** A candidate hotel stay considered for pairing with a flight. */
export interface HotelStayOpportunity {
  id: string;
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  rate: HotelRateObservation;
  activeMemberships: HotelProgramMembership[];
}

export function nightsBetween(checkInDate: string, checkOutDate: string): number {
  const inDate = new Date(`${checkInDate}T00:00:00Z`);
  const outDate = new Date(`${checkOutDate}T00:00:00Z`);
  const ms = outDate.getTime() - inDate.getTime();
  const nights = Math.round(ms / (24 * 60 * 60 * 1000));
  if (nights <= 0) throw new Error(`checkOutDate (${checkOutDate}) must be after checkInDate (${checkInDate})`);
  return nights;
}
