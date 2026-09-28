"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown, MapPin, Plane, RotateCcw, Search } from "lucide-react";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import {
  CABIN_CLASSES,
  DESTINATION_AIRPORT_CODES,
  DEFAULT_EXPLORE_SEARCH_PARAMS,
  EXPLORE_TABS,
  ORIGIN_AIRPORT_CODES,
  type ExploreSearchParams,
  type ExploreTab,
} from "@/lib/search/parseExploreSearchParams";
import { formatCabin } from "./format";

const TAB_LABELS: Record<ExploreTab, string> = {
  pairs: "Pairs",
  flights: "Flights",
  hotels: "Hotels",
};

const AIRPORT_LABELS: Record<string, string> = {
  JFK: "JFK — New York Kennedy",
  EWR: "EWR — Newark",
  HND: "HND — Tokyo Haneda",
  NRT: "NRT — Tokyo Narita",
};

const searchParamParsers = {
  tab: parseAsStringEnum<ExploreTab>([...EXPLORE_TABS]).withDefault(DEFAULT_EXPLORE_SEARCH_PARAMS.tab),
  from: parseAsString.withDefault(DEFAULT_EXPLORE_SEARCH_PARAMS.from),
  to: parseAsString.withDefault(DEFAULT_EXPLORE_SEARCH_PARAMS.to),
  departFrom: parseAsString.withDefault(DEFAULT_EXPLORE_SEARCH_PARAMS.departFrom),
  departTo: parseAsString.withDefault(DEFAULT_EXPLORE_SEARCH_PARAMS.departTo),
  cabin: parseAsString,
  maxPoints: parseAsInteger,
  maxStops: parseAsInteger,
};

/**
 * Tabs + filter bar for /explore. Keeps everything in the URL query string
 * via nuqs (shallow: false), so the Server Component page above re-runs the
 * search and the resulting state is shareable/bookmarkable.
 */
export function ExploreControls({ current }: { current: ExploreSearchParams }) {
  const [state, setState] = useQueryStates(searchParamParsers, { shallow: false });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const filtersId = useId();

  // Local, uncontrolled-until-submit draft so typing/selecting doesn't trigger
  // a server round-trip per keystroke; the URL (and the search) updates once,
  // on submit, mirroring the landing page's SearchCard pattern.
  const [draft, setDraft] = useState({
    from: current.from,
    to: current.to,
    departFrom: current.departFrom,
    departTo: current.departTo,
    cabin: current.cabin ?? "",
    maxPoints: current.maxPoints?.toString() ?? "",
    maxStops: current.maxStops?.toString() ?? "",
  });

  function handleTabChange(tab: ExploreTab) {
    void setState({ tab });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void setState({
      from: draft.from,
      to: draft.to,
      departFrom: draft.departFrom,
      departTo: draft.departTo,
      cabin: draft.cabin || null,
      maxPoints: draft.maxPoints ? Number.parseInt(draft.maxPoints, 10) : null,
      maxStops: draft.maxStops ? Number.parseInt(draft.maxStops, 10) : null,
    });
  }

  function handleReset() {
    setDraft({
      from: DEFAULT_EXPLORE_SEARCH_PARAMS.from,
      to: DEFAULT_EXPLORE_SEARCH_PARAMS.to,
      departFrom: DEFAULT_EXPLORE_SEARCH_PARAMS.departFrom,
      departTo: DEFAULT_EXPLORE_SEARCH_PARAMS.departTo,
      cabin: "",
      maxPoints: "",
      maxStops: "",
    });
    void setState({ from: null, to: null, departFrom: null, departTo: null, cabin: null, maxPoints: null, maxStops: null });
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Search mode" className="inline-flex w-fit gap-1 rounded-[var(--radius-lg)] border border-border bg-muted p-1">
        {EXPLORE_TABS.map((tab) => {
          const isActive = state.tab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(20,20,30,0.06)] sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="From"
            icon={<Plane aria-hidden="true" className="h-4 w-4 -rotate-45" />}
            value={draft.from}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
          >
            {ORIGIN_AIRPORT_CODES.map((code) => (
              <option key={code} value={code}>
                {AIRPORT_LABELS[code]}
              </option>
            ))}
          </Select>
          <Select
            label="To"
            icon={<MapPin aria-hidden="true" className="h-4 w-4" />}
            value={draft.to}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
          >
            {DESTINATION_AIRPORT_CODES.map((code) => (
              <option key={code} value={code}>
                {AIRPORT_LABELS[code]}
              </option>
            ))}
          </Select>
          <Input
            label="Depart from"
            type="date"
            value={draft.departFrom}
            onChange={(e) => setDraft((d) => ({ ...d, departFrom: e.target.value }))}
          />
          <Input
            label="Depart until"
            type="date"
            value={draft.departTo}
            onChange={(e) => setDraft((d) => ({ ...d, departTo: e.target.value }))}
          />
          <Select label="Cabin" value={draft.cabin} onChange={(e) => setDraft((d) => ({ ...d, cabin: e.target.value }))}>
            <option value="">Any cabin</option>
            {CABIN_CLASSES.map((cabin) => (
              <option key={cabin} value={cabin}>
                {formatCabin(cabin)}
              </option>
            ))}
          </Select>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Sample data only spans <strong className="font-medium text-foreground">Apr 1 – Apr 11, 2026</strong>, JFK/EWR ↔ HND/NRT — searches outside that window will come back empty.
        </p>

        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            aria-expanded={showMoreFilters}
            aria-controls={filtersId}
            onClick={() => setShowMoreFilters((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] text-sm font-medium text-foreground/75 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            More filters
            <ChevronDown aria-hidden="true" className={cn("h-4 w-4 transition-transform duration-150", showMoreFilters && "rotate-180")} />
          </button>

          <div
            id={filtersId}
            className={cn("grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out", showMoreFilters ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Max points"
                  type="number"
                  min={0}
                  placeholder="e.g. 120,000"
                  value={draft.maxPoints}
                  onChange={(e) => setDraft((d) => ({ ...d, maxPoints: e.target.value }))}
                />
                <Input
                  label="Max stops"
                  type="number"
                  min={0}
                  placeholder="e.g. 1"
                  value={draft.maxStops}
                  onChange={(e) => setDraft((d) => ({ ...d, maxStops: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg">
            <Search aria-hidden="true" className="h-4 w-4" />
            Update search
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Reset to defaults
          </Button>
        </div>
      </form>
    </div>
  );
}
