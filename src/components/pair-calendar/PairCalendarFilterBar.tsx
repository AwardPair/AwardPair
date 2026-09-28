"use client";

import { MapPin, Plane } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { Select } from "@/components/ui/Select";
import { DESTINATION_AIRPORT_CODES, ORIGIN_AIRPORT_CODES } from "@/lib/search/parseExploreSearchParams";
import { DEFAULT_PAIR_CALENDAR_PARAMS, type PairCalendarParams } from "@/lib/search/parsePairCalendarParams";

const AIRPORT_LABELS: Record<string, string> = {
  JFK: "JFK — New York Kennedy",
  EWR: "EWR — Newark",
  HND: "HND — Tokyo Haneda",
  NRT: "NRT — Tokyo Narita",
};

const searchParamParsers = {
  from: parseAsString.withDefault(DEFAULT_PAIR_CALENDAR_PARAMS.from),
  to: parseAsString.withDefault(DEFAULT_PAIR_CALENDAR_PARAMS.to),
};

/**
 * Route selector for the Pair Calendar. Unlike /explore's filter bar, this
 * updates the URL immediately on change (no separate submit step) — there's
 * only two fields, and each cell links onward to /explore for a given date
 * rather than this page owning a big result set of its own.
 */
export function PairCalendarFilterBar({ current }: { current: PairCalendarParams }) {
  const [, setState] = useQueryStates(searchParamParsers, { shallow: false });

  return (
    <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(20,20,30,0.06)] sm:grid-cols-2 sm:p-6">
      <Select
        label="From"
        icon={<Plane aria-hidden="true" className="h-4 w-4 -rotate-45" />}
        value={current.from}
        onChange={(e) => void setState({ from: e.target.value })}
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
        value={current.to}
        onChange={(e) => void setState({ to: e.target.value })}
      >
        {DESTINATION_AIRPORT_CODES.map((code) => (
          <option key={code} value={code}>
            {AIRPORT_LABELS[code]}
          </option>
        ))}
      </Select>
    </div>
  );
}
