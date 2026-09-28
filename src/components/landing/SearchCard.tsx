"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";

const CABIN_OPTIONS = ["Economy", "Premium Economy", "Business", "First"] as const;
const TRAVELER_OPTIONS = ["1 traveler", "2 travelers", "3 travelers", "4+ travelers"] as const;
const STOPS_OPTIONS = ["Any", "Nonstop only", "1 stop max"] as const;
const ECOSYSTEM_OPTIONS = [
  "Any",
  "Amex Membership Rewards",
  "Chase Ultimate Rewards",
  "Marriott Bonvoy",
] as const;
const MILEAGE_PROGRAM_OPTIONS = [
  "Any",
  "United MileagePlus",
  "ANA Mileage Club",
  "Virgin Atlantic Flying Club",
  "American AAdvantage",
] as const;
const HOTEL_PROGRAM_OPTIONS = [
  "Any",
  "Amex Fine Hotels + Resorts",
  "Amex The Hotel Collection",
  "Chase The Edit",
] as const;
const OWNED_CARDS = ["Amex Platinum", "Chase Sapphire Reserve"] as const;

export function SearchCard() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const filtersId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    // Search is not wired up yet — the Explore/results milestone will replace this.
    console.log("Search award pairs (demo, not yet wired up):", data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(20,20,30,0.06)] sm:p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          name="from"
          label="From"
          placeholder="City or airport"
          icon={<MapPin aria-hidden="true" className="h-4 w-4" />}
          autoComplete="off"
        />
        <Input
          name="to"
          label="To"
          placeholder="City or airport"
          icon={<MapPin aria-hidden="true" className="h-4 w-4" />}
          autoComplete="off"
        />
        <Input name="when" label="When" type="date" />
        <Select name="travelers" label="Travelers" icon={<Users aria-hidden="true" className="h-4 w-4" />} defaultValue={TRAVELER_OPTIONS[0]}>
          {TRAVELER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select name="cabin" label="Cabin" defaultValue={CABIN_OPTIONS[0]}>
          {CABIN_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          aria-expanded={showMoreFilters}
          aria-controls={filtersId}
          onClick={() => setShowMoreFilters((open) => !open)}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] text-sm font-medium text-foreground/75 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          More filters
          <ChevronDown
            aria-hidden="true"
            className={cn("h-4 w-4 transition-transform duration-150", showMoreFilters && "rotate-180")}
          />
        </button>

        <div
          id={filtersId}
          className={cn("grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out", showMoreFilters ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input name="maxPoints" label="Max points" type="number" min={0} placeholder="e.g. 120,000" />
              <Input name="maxTaxesFees" label="Max taxes / fees" type="number" min={0} placeholder="e.g. 200" />
              <Select name="stops" label="Stops" defaultValue={STOPS_OPTIONS[0]}>
                {STOPS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select name="transferableEcosystem" label="Transferable ecosystem" defaultValue={ECOSYSTEM_OPTIONS[0]}>
                {ECOSYSTEM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select name="mileageProgram" label="Mileage program" defaultValue={MILEAGE_PROGRAM_OPTIONS[0]}>
                {MILEAGE_PROGRAM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select name="hotelProgram" label="Hotel program" defaultValue={HOTEL_PROGRAM_OPTIONS[0]}>
                {HOTEL_PROGRAM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Input name="maxHotelReferencePrice" label="Max hotel reference price / night" type="number" min={0} placeholder="e.g. 900" />
              <Input name="nights" label="Nights" type="number" min={1} placeholder="e.g. 4" />
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cards owned
                </legend>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1.5">
                  {OWNED_CARDS.map((card) => (
                    <label key={card} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        name="cardsOwned"
                        value={card}
                        className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {card}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Search aria-hidden="true" className="h-4 w-4" />
          Search award pairs
        </Button>
      </div>
    </form>
  );
}
