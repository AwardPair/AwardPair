"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Pair } from "@/lib/domain";
import { PairCard } from "./PairCard";
import { PairDetailPanel } from "./PairDetailPanel";

/**
 * The Pairs tab: a ranked list of Pair cards plus the full breakdown of
 * whichever one is selected. Desktop shows the detail in a sticky
 * right-hand panel alongside the list; below the `lg` breakpoint the same
 * detail opens in a full-screen sheet instead of being crammed into the card.
 */
export function PairsResults({ pairs }: { pairs: Pair[] }) {
  const [selectedId, setSelectedId] = useState<string | undefined>(pairs[0]?.id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectedPair = pairs.find((pair) => pair.id === selectedId) ?? pairs[0];

  function handleSelect(pairId: string) {
    setSelectedId(pairId);
    setSheetOpen(true);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {pairs.length} pair{pairs.length === 1 ? "" : "s"} found, ranked by Pair Score (best first).
        </p>
        {pairs.map((pair) => (
          <PairCard key={pair.id} pair={pair} selected={pair.id === selectedPair?.id} onSelect={() => handleSelect(pair.id)} />
        ))}
      </div>

      {selectedPair ? (
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(20,20,30,0.06)]">
            <PairDetailPanel pair={selectedPair} showPageLink />
          </div>
        </aside>
      ) : null}

      {selectedPair && sheetOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden" role="dialog" aria-modal="true" aria-label="Pair details">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Pair details</span>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Close pair details"
              className="rounded-[var(--radius-sm)] p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <PairDetailPanel pair={selectedPair} showPageLink />
          </div>
        </div>
      ) : null}
    </div>
  );
}
