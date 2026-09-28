export interface CardIssuer {
  id: string;
  name: string;
}

export interface CardProduct {
  id: string;
  issuerId: string;
  name: string;
}

/** A card the user has manually added to their wallet. No card numbers are ever stored. */
export interface UserCard {
  id: string;
  userId: string;
  cardProductId: string;
  addedAt: string;
  /** How much of this card's eligible statement credit has already been used this period. */
  creditUsed?: { value: number; currency: string };
}

/** User-editable subjective values for soft perks, used only for the perk-adjusted view. */
export interface BenefitPreferences {
  userId: string;
  breakfastValuePerPerson: { value: number; currency: string };
  /** 0–1: how much of a property credit the user realistically expects to use. */
  propertyCreditUsableFraction: number;
  lateCheckoutValue?: { value: number; currency: string };
}

export const DEFAULT_BENEFIT_PREFERENCES: Omit<BenefitPreferences, "userId"> = {
  breakfastValuePerPerson: { value: 25, currency: "USD" },
  propertyCreditUsableFraction: 0.75,
};
