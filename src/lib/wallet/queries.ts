import { createClient } from "@/lib/supabase/server";

export interface CardCatalogEntry {
  id: string;
  slug: string;
  name: string;
  issuerName: string;
}

export interface UserWalletCard {
  id: string;
  cardProductId: string;
  addedAt: string;
  creditUsedAmount: number | null;
  creditUsedCurrency: string | null;
  productName: string;
  productSlug: string;
  issuerName: string;
}

export interface UserPreferences {
  breakfastValueAmount: number;
  breakfastValueCurrency: string;
  propertyCreditUsableFraction: number;
  lateCheckoutValueAmount: number | null;
  lateCheckoutValueCurrency: string | null;
}

export async function getCardCatalog(): Promise<CardCatalogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("card_products")
    .select("id, slug, name, card_issuers(name)")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    issuerName: row.card_issuers?.name ?? "",
  }));
}

export async function getUserWallet(userId: string): Promise<UserWalletCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_cards")
    .select("id, card_product_id, added_at, credit_used_amount, credit_used_currency, card_products(name, slug, card_issuers(name))")
    .eq("user_id", userId)
    .order("added_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    cardProductId: row.card_product_id,
    addedAt: row.added_at,
    creditUsedAmount: row.credit_used_amount,
    creditUsedCurrency: row.credit_used_currency,
    productName: row.card_products?.name ?? "",
    productSlug: row.card_products?.slug ?? "",
    issuerName: row.card_products?.card_issuers?.name ?? "",
  }));
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_benefit_preferences")
    .select("breakfast_value_amount, breakfast_value_currency, property_credit_usable_fraction, late_checkout_value_amount, late_checkout_value_currency")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    breakfastValueAmount: data.breakfast_value_amount,
    breakfastValueCurrency: data.breakfast_value_currency,
    propertyCreditUsableFraction: data.property_credit_usable_fraction,
    lateCheckoutValueAmount: data.late_checkout_value_amount,
    lateCheckoutValueCurrency: data.late_checkout_value_currency,
  };
}
