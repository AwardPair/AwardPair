import type { BenefitPreferences } from "@/lib/domain";
import { DEFAULT_BENEFIT_PREFERENCES } from "@/lib/domain";
import { DEMO_CARD_BENEFIT_RULES, DEMO_HOTEL_OFFERS, DEMO_PROGRAM_BENEFITS, DEMO_PROPERTY_BENEFITS } from "@/lib/fixtures/benefits";
import type { PairingContext, WalletCardBenefit } from "@/lib/pairing/buildPairs";

/**
 * A placeholder "guest" pairing context standing in for a real user's
 * wallet/preferences until Supabase Auth + My Wallet ship in M10. Assumes
 * the user holds every DEMO card product with its full credit unused —
 * clearly a simplification for demonstrating the pairing/economics logic,
 * not a real per-user state.
 */
export function demoPairingContext(overrides: Partial<PairingContext> = {}): PairingContext {
  const walletCardBenefits: WalletCardBenefit[] = DEMO_CARD_BENEFIT_RULES.map((rule) => ({
    rule,
    remainingCredit: { amount: rule.maxAmount.value, currency: rule.maxAmount.currency },
  }));

  const preferences: BenefitPreferences = { userId: "demo-user", ...DEFAULT_BENEFIT_PREFERENCES };

  return {
    programBenefits: DEMO_PROGRAM_BENEFITS,
    propertyBenefits: DEMO_PROPERTY_BENEFITS,
    offers: DEMO_HOTEL_OFFERS,
    walletCardBenefits,
    preferences,
    partySize: 2,
    today: new Date().toISOString().slice(0, 10),
    isPrepaidBooking: true,
    ...overrides,
  };
}
