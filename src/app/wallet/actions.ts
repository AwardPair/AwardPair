"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/wallet");
  return data.user.id;
}

export async function addCard(formData: FormData) {
  const userId = await requireUserId();
  const cardProductId = formData.get("cardProductId") as string | null;
  if (!cardProductId) return;

  const supabase = await createClient();
  await supabase.from("user_cards").insert({ user_id: userId, card_product_id: cardProductId });
  revalidatePath("/wallet");
}

export async function removeCard(formData: FormData) {
  const userId = await requireUserId();
  const userCardId = formData.get("userCardId") as string | null;
  if (!userCardId) return;

  const supabase = await createClient();
  await supabase.from("user_cards").delete().eq("id", userCardId).eq("user_id", userId);
  revalidatePath("/wallet");
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export async function updatePreferences(formData: FormData) {
  const userId = await requireUserId();

  const breakfastValue = parseOptionalNumber(formData.get("breakfastValueAmount")) ?? 25;
  const usableFractionRaw = parseOptionalNumber(formData.get("propertyCreditUsableFraction")) ?? 75;
  const usableFraction = Math.min(1, Math.max(0, usableFractionRaw / 100));
  const lateCheckoutValue = parseOptionalNumber(formData.get("lateCheckoutValueAmount"));

  const supabase = await createClient();
  await supabase.from("user_benefit_preferences").upsert({
    user_id: userId,
    breakfast_value_amount: breakfastValue,
    breakfast_value_currency: "USD",
    property_credit_usable_fraction: usableFraction,
    late_checkout_value_amount: lateCheckoutValue,
    late_checkout_value_currency: lateCheckoutValue !== null ? "USD" : null,
  });
  revalidatePath("/wallet");
}
