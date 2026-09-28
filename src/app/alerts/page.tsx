import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/server";
import { getAlertsWithEvents, getSavedSearches, type AlertRow, type SavedSearchRow } from "@/lib/alerts/queries";
import { formatCalendarDate, formatMoney } from "@/components/explore/format";
import { createAlert, checkAlertNow, deleteAlert, deleteSavedSearch, toggleAlert } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Save a search and get notified when a Pair matches your price or score threshold.",
};

function criteriaSummary(criteria: AlertRow["criteria"]): string {
  const parts: string[] = [];
  if (criteria.maxNetCashCost !== undefined) parts.push(`Net cash cost ≤ ${formatMoney({ amount: criteria.maxNetCashCost, currency: "USD" })}`);
  if (criteria.minPairScore !== undefined) parts.push(`Pair Score ≥ ${criteria.minPairScore}`);
  return parts.length > 0 ? parts.join(" and ") : "No criteria set";
}

function SavedSearchCard({ savedSearch }: { savedSearch: SavedSearchRow }) {
  const { params } = savedSearch;
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{savedSearch.name}</p>
          <p className="text-xs text-muted-foreground">
            {params.from} → {params.to} · {formatCalendarDate(params.departFrom)} – {formatCalendarDate(params.departTo)}
          </p>
        </div>
        <form action={deleteSavedSearch}>
          <input type="hidden" name="savedSearchId" value={savedSearch.id} />
          <Button variant="ghost" size="sm" type="submit" aria-label={`Delete saved search ${savedSearch.name}`}>
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <form action={createAlert} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <input type="hidden" name="savedSearchId" value={savedSearch.id} />
        <Input name="maxNetCashCost" type="number" min={0} step="1" label="Net cash cost ≤ ($)" hideLabel placeholder="Max net cash cost ($)" className="w-44" />
        <Input name="minPairScore" type="number" min={0} max={100} step="1" label="Pair Score ≥" hideLabel placeholder="Min Pair Score (0-100)" className="w-44" />
        <Button type="submit" size="sm">
          Add alert
        </Button>
      </form>
    </Card>
  );
}

function AlertCard({ alert }: { alert: AlertRow }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{alert.savedSearchName ?? "Saved search removed"}</p>
          <p className="text-xs text-muted-foreground">{criteriaSummary(alert.criteria)}</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={toggleAlert}>
            <input type="hidden" name="alertId" value={alert.id} />
            <input type="hidden" name="nextActive" value={(!alert.isActive).toString()} />
            <Button variant={alert.isActive ? "secondary" : "outline"} size="sm" type="submit">
              {alert.isActive ? "Active" : "Paused"}
            </Button>
          </form>
          {alert.savedSearchId ? (
            <form action={checkAlertNow}>
              <input type="hidden" name="alertId" value={alert.id} />
              <Button variant="secondary" size="sm" type="submit">
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                Check now
              </Button>
            </form>
          ) : null}
          <form action={deleteAlert}>
            <input type="hidden" name="alertId" value={alert.id} />
            <Button variant="ghost" size="sm" type="submit" aria-label="Delete alert">
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {alert.events.length === 0 ? (
        <p className="text-xs text-muted-foreground">No matches yet. Try &quot;Check now&quot; — matches are only found when you check, there&apos;s no background monitoring yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 border-t border-border pt-3">
          {alert.events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/pairs/${event.snapshot.pairId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] bg-muted/50 p-2.5 text-xs hover:bg-muted"
              >
                <span className="font-medium text-foreground">
                  {event.snapshot.originAirportCode} → {event.snapshot.destinationAirportCode} · {event.snapshot.hotelName}
                </span>
                <span className="text-muted-foreground">
                  {formatMoney(event.snapshot.netCashCost)} · Score {event.snapshot.scoreValue}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/sign-in?next=/alerts");

  const [savedSearches, alerts] = await Promise.all([getSavedSearches(authData.user.id), getAlertsWithEvents(authData.user.id)]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save a search from Explore, then set a price or score threshold to track it here. Alerts are checked on demand — click
          &quot;Check now&quot; to re-run a saved search and see if any Pair currently matches.
        </p>
      </div>

      <section aria-labelledby="saved-searches-heading" className="flex flex-col gap-4">
        <h2 id="saved-searches-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your saved searches
        </h2>
        {savedSearches.length === 0 ? (
          <Card className="p-5 sm:p-6">
            <CardHeader>
              <CardTitle>No saved searches yet</CardTitle>
              <CardDescription>
                Run a search on <Link href="/explore" className="font-medium text-primary hover:underline">Explore</Link> and save
                it from the Pairs tab to start tracking it here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {savedSearches.map((savedSearch) => (
              <li key={savedSearch.id}>
                <SavedSearchCard savedSearch={savedSearch} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="alerts-heading" className="flex flex-col gap-4">
        <h2 id="alerts-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your alerts
        </h2>
        {alerts.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <BellRing aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Add an alert to a saved search above to start tracking it.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <AlertCard alert={alert} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
