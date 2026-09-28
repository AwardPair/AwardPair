/**
 * AwardPair does not transact FHR/THC/The Edit bookings — it hands the user
 * off to the official program portal to verify the exact live price before
 * they act. These are general program landing pages (verified against
 * americanexpress.com and chase.com on 2026-09-28 via web search), not
 * deep links into a specific property/date search: this codebase makes no
 * claim that a deep link to an exact search result reliably works, per the
 * "never claim a deep link works unless tested" rule.
 */
export const OFFICIAL_HOTEL_PROGRAM_PORTALS: Record<string, { label: string; url: string }> = {
  "amex-fhr": { label: "Amex Fine Hotels + Resorts", url: "https://www.americanexpress.com/en-us/travel/fine-hotels-and-resorts" },
  "amex-thc": { label: "Amex The Hotel Collection", url: "https://www.americanexpress.com/en-us/travel/the-hotel-collection/book/" },
  "chase-the-edit": { label: "Chase Travel / The Edit", url: "https://www.chase.com/travel" },
};

export interface VerificationHandoff {
  portalLabel: string;
  portalUrl: string;
  /** Text to copy to the clipboard so the user can paste it into the portal's search. */
  clipboardText: string;
}

/**
 * Builds the copy-to-clipboard text + portal link for verifying a Pair's
 * real hotel price on the official program site. No booking is performed
 * here and no price is assumed to match what AwardPair displayed.
 */
export function buildVerificationHandoff(params: {
  programId: string;
  hotelName: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
}): VerificationHandoff | undefined {
  const portal = OFFICIAL_HOTEL_PROGRAM_PORTALS[params.programId];
  if (!portal) return undefined;
  return {
    portalLabel: portal.label,
    portalUrl: portal.url,
    clipboardText: `${params.hotelName}, ${params.city} — check in ${params.checkInDate}, check out ${params.checkOutDate}`,
  };
}
