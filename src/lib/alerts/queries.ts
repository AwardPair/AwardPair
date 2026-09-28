import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { parseExploreSearchParams, type ExploreSearchParams } from "@/lib/search/parseExploreSearchParams";
import type { AlertCriteria } from "./evaluateAlert";

export interface SavedSearchRow {
  id: string;
  name: string;
  params: ExploreSearchParams;
  createdAt: string;
}

export interface PairSnapshot {
  pairId: string;
  originAirportCode: string;
  destinationAirportCode: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  netCashCost: { amount: number; currency: string };
  scoreValue: number;
}

export interface AlertEventRow {
  id: string;
  triggeredAt: string;
  snapshot: PairSnapshot;
}

export interface AlertRow {
  id: string;
  savedSearchId: string | null;
  savedSearchName: string | null;
  criteria: AlertCriteria;
  isActive: boolean;
  createdAt: string;
  events: AlertEventRow[];
}

function toExploreSearchParams(params: Json): ExploreSearchParams {
  return parseExploreSearchParams((params ?? {}) as Record<string, string>);
}

function toAlertCriteria(criteria: Json): AlertCriteria {
  const raw = (criteria ?? {}) as Record<string, unknown>;
  return {
    maxNetCashCost: typeof raw.maxNetCashCost === "number" ? raw.maxNetCashCost : undefined,
    minPairScore: typeof raw.minPairScore === "number" ? raw.minPairScore : undefined,
  };
}

export async function getSavedSearches(userId: string): Promise<SavedSearchRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, params, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    params: toExploreSearchParams(row.params),
    createdAt: row.created_at,
  }));
}

export async function getAlertsWithEvents(userId: string): Promise<AlertRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("id, saved_search_id, criteria, is_active, created_at, saved_searches(name), alert_events(id, triggered_at, pair_snapshot)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    savedSearchId: row.saved_search_id,
    savedSearchName: row.saved_searches?.name ?? null,
    criteria: toAlertCriteria(row.criteria),
    isActive: row.is_active,
    createdAt: row.created_at,
    events: (row.alert_events ?? [])
      .map((event) => ({
        id: event.id,
        triggeredAt: event.triggered_at,
        snapshot: event.pair_snapshot as unknown as PairSnapshot,
      }))
      .sort((a, b) => (a.triggeredAt < b.triggeredAt ? 1 : -1)),
  }));
}
