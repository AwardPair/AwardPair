"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { createColumnHelper, createSortedRowModel, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table";
import type { CabinClass, FlightOpportunity } from "@/lib/domain";
import { freshnessLabel } from "@/lib/domain";
import { DEMO_AIRPORTS } from "@/lib/fixtures/airports";
import { cn } from "@/lib/utils/cn";
import { formatCabin, formatLocalDateTime, formatMoney, formatStops } from "./format";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, FlightOpportunity>();

const CABIN_RANK: Record<CabinClass, number> = { economy: 0, premium_economy: 1, business: 2, first: 3 };

function localDeparture(flight: FlightOpportunity): string {
  const airport = DEMO_AIRPORTS[flight.originAirportCode];
  return airport ? formatLocalDateTime(flight.departureAt, airport.timeZone) : flight.departureAt;
}

function localArrival(flight: FlightOpportunity): string {
  const airport = DEMO_AIRPORTS[flight.destinationAirportCode];
  return airport ? formatLocalDateTime(flight.arrivalAt, airport.timeZone) : flight.arrivalAt;
}

const columns = columnHelper.columns([
  columnHelper.accessor((row) => `${row.originAirportCode} → ${row.destinationAirportCode}`, {
    id: "route",
    header: "Route",
    sortFn: (a, b) => a.original.originAirportCode.localeCompare(b.original.originAirportCode) || a.original.destinationAirportCode.localeCompare(b.original.destinationAirportCode),
  }),
  columnHelper.accessor((row) => row.departureAt, {
    id: "departure",
    header: "Departs (local)",
    cell: (info) => localDeparture(info.row.original),
    sortFn: (a, b) => a.original.departureAt.localeCompare(b.original.departureAt),
  }),
  columnHelper.accessor((row) => row.arrivalAt, {
    id: "arrival",
    header: "Arrives (local)",
    cell: (info) => localArrival(info.row.original),
    sortFn: (a, b) => a.original.arrivalAt.localeCompare(b.original.arrivalAt),
  }),
  columnHelper.accessor((row) => row.mileageProgram.name, {
    id: "program",
    header: "Program",
  }),
  columnHelper.accessor((row) => `${row.marketingAirline}${row.flightNumber ? ` ${row.flightNumber}` : ""}`, {
    id: "airline",
    header: "Airline / Flight#",
  }),
  columnHelper.accessor("cabin", {
    id: "cabin",
    header: "Cabin",
    cell: (info) => formatCabin(info.getValue()),
    sortFn: (a, b) => CABIN_RANK[a.original.cabin] - CABIN_RANK[b.original.cabin],
  }),
  columnHelper.accessor("pointsCost", {
    id: "points",
    header: "Points",
    cell: (info) => info.getValue().toLocaleString("en-US"),
    sortFn: (a, b) => a.original.pointsCost - b.original.pointsCost,
  }),
  columnHelper.accessor((row) => row.taxesAndFees.amount, {
    id: "taxesAndFees",
    header: "Taxes / fees",
    cell: (info) => formatMoney(info.row.original.taxesAndFees),
    sortFn: (a, b) => a.original.taxesAndFees.amount - b.original.taxesAndFees.amount,
  }),
  columnHelper.accessor("stops", {
    id: "stops",
    header: "Stops",
    cell: (info) => formatStops(info.getValue()),
    sortFn: (a, b) => a.original.stops - b.original.stops,
  }),
  columnHelper.accessor((row) => row.availableSeats ?? -1, {
    id: "seats",
    header: "Seats",
    cell: (info) => (info.row.original.availableSeats !== undefined ? info.row.original.availableSeats : "Unknown"),
    sortFn: (a, b) => (a.original.availableSeats ?? -1) - (b.original.availableSeats ?? -1),
  }),
  columnHelper.accessor((row) => row.freshness.observedAt, {
    id: "freshness",
    header: "Freshness",
    cell: (info) => freshnessLabel(info.row.original.freshness),
    sortFn: (a, b) => a.original.freshness.observedAt.localeCompare(b.original.freshness.observedAt),
  }),
]);

const SORT_ICON = { asc: ArrowUp, desc: ArrowDown } as const;

/**
 * Dense, sortable power-user table over raw FlightOpportunity[] (the
 * Flights tab). Click a header to sort; click again to reverse, a third
 * time to clear.
 */
export function FlightsTable({ flights }: { flights: FlightOpportunity[] }) {
  const table = useTable({ features, columns, data: flights });

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-card">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b border-border bg-muted/60">
              {group.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();
                const SortIcon = sortDirection ? SORT_ICON[sortDirection] : ArrowUpDown;
                return (
                  <th key={header.id} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-[var(--radius-sm)] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        sortDirection && "text-foreground",
                      )}
                    >
                      <table.FlexRender header={header} />
                      <SortIcon aria-hidden="true" className="h-3 w-3" />
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-3 py-2.5 text-foreground">
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
