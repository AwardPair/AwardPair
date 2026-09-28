"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { exploreParamsToFlightSearchInput, exploreParamsToRawRecord, parseExploreSearchParams } from "@/lib/search/parseExploreSearchParams";
import { searchPairs } from "@/lib/search/searchPairs";
import { findMatchingPairs, type AlertCriteria } from "@/lib/alerts/evaluateAlert";
import type { PairSnapshot } from "@/lib/alerts/queries";
import type { Pair } from "@/lib/domain";

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/alerts");
  return data.user.id;
}

const SAVED_SEARCH_PARAM_KEYS = ["tab", "from", "to", "departFrom", "departTo", "cabin", "maxPoints", "maxStops"] as const;

export async function saveSearch(formData: FormData) {
  const userId = await requireUserId();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;

  const rawParams: Record<string, string> = {};
  for (const key of SAVED_SEARCH_PARAM_KEYS) {
    const value = formData.get(key);
    if (typeof value === "string" && value !== "") rawParams[key] = value;
  }
  const parsed = parseExploreSearchParams(rawParams);

  const supabase = await createClient();
  await supabase.from("saved_searches").insert({
    user_id: userId,
    name,
    params: exploreParamsToRawRecord(parsed),
  });
  revalidatePath("/alerts");
  revalidatePath("/explore");
}

export async function deleteSavedSearch(formData: FormData) {
  const userId = await requireUserId();
  const savedSearchId = formData.get("savedSearchId") as string | null;
  if (!savedSearchId) return;
  const supabase = await createClient();
  await supabase.from("saved_searches").delete().eq("id", savedSearchId).eq("user_id", userId);
  revalidatePath("/alerts");
}

function parseCriteriaFromFormData(formData: FormData): AlertCriteria {
  const maxRaw = formData.get("maxNetCashCost");
  const minRaw = formData.get("minPairScore");
  const maxParsed = typeof maxRaw === "string" && maxRaw.trim() !== "" ? Number.parseFloat(maxRaw) : undefined;
  const minParsed = typeof minRaw === "string" && minRaw.trim() !== "" ? Number.parseFloat(minRaw) : undefined;
  return {
    maxNetCashCost: maxParsed !== undefined && Number.isFinite(maxParsed) ? maxParsed : undefined,
    minPairScore: minParsed !== undefined && Number.isFinite(minParsed) ? minParsed : undefined,
  };
}

export async function createAlert(formData: FormData) {
  const userId = await requireUserId();
  const savedSearchId = formData.get("savedSearchId") as string | null;
  if (!savedSearchId) return;
  const criteria = parseCriteriaFromFormData(formData);
  if (criteria.maxNetCashCost === undefined && criteria.minPairScore === undefined) return;

  const supabase = await createClient();
  await supabase.from("alerts").insert({
    user_id: userId,
    saved_search_id: savedSearchId,
    criteria: criteria as unknown as Json,
    is_active: true,
  });
  revalidatePath("/alerts");
}

export async function deleteAlert(formData: FormData) {
  const userId = await requireUserId();
  const alertId = formData.get("alertId") as string | null;
  if (!alertId) return;
  const supabase = await createClient();
  await supabase.from("alerts").delete().eq("id", alertId).eq("user_id", userId);
  revalidatePath("/alerts");
}

export async function toggleAlert(formData: FormData) {
  const userId = await requireUserId();
  const alertId = formData.get("alertId") as string | null;
  const nextActive = formData.get("nextActive") === "true";
  if (!alertId) return;
  const supabase = await createClient();
  await supabase.from("alerts").update({ is_active: nextActive }).eq("id", alertId).eq("user_id", userId);
  revalidatePath("/alerts");
}

function toSnapshot(pair: Pair): PairSnapshot {
  return {
    pairId: pair.id,
    originAirportCode: pair.flight.originAirportCode,
    destinationAirportCode: pair.flight.destinationAirportCode,
    hotelName: pair.hotelStay.hotel.name,
    checkInDate: pair.hotelStay.checkInDate,
    checkOutDate: pair.hotelStay.checkOutDate,
    netCashCost: { amount: pair.economics.netCashCost.amount, currency: pair.economics.netCashCost.currency },
    scoreValue: pair.score.value,
  };
}

/**
 * Alerts here are evaluated on demand rather than on a schedule — there's no
 * cron/queue infrastructure yet (see CLAUDE.md: Cloudflare Workers/Queues
 * are a later milestone, not introduced speculatively). Re-running the
 * user's saved search and diffing against previously recorded alert_events
 * is a deterministic stand-in that works fine against fixture data.
 */
export async function checkAlertNow(formData: FormData) {
  const userId = await requireUserId();
  const alertId = formData.get("alertId") as string | null;
  if (!alertId) return;

  const supabase = await createClient();
  const { data: alertRow, error: alertError } = await supabase
    .from("alerts")
    .select("id, criteria, saved_searches(params)")
    .eq("id", alertId)
    .eq("user_id", userId)
    .maybeSingle();
  if (alertError || !alertRow?.saved_searches) return;

  const criteria = alertRow.criteria as unknown as AlertCriteria;
  const searchParams = parseExploreSearchParams(alertRow.saved_searches.params as unknown as Record<string, string>);
  const pairs = await searchPairs(exploreParamsToFlightSearchInput(searchParams));
  const matches = findMatchingPairs(pairs, criteria);

  if (matches.length > 0) {
    const { data: existingEvents } = await supabase.from("alert_events").select("pair_snapshot").eq("alert_id", alertId);
    const existingPairIds = new Set(
      (existingEvents ?? []).map((event) => (event.pair_snapshot as unknown as PairSnapshot)?.pairId),
    );
    const newEvents = matches
      .filter((pair) => !existingPairIds.has(pair.id))
      .map((pair) => ({ alert_id: alertId, pair_snapshot: toSnapshot(pair) as unknown as Json }));
    if (newEvents.length > 0) {
      await supabase.from("alert_events").insert(newEvents);
    }
  }
  revalidatePath("/alerts");
}
