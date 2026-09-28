# AwardPair — Architecture

## Layering

```
UI (src/app, src/components)
  -> domain services (src/lib/pairing, src/lib/economics, src/lib/score)
    -> domain model (src/lib/domain)  <-- provider-agnostic types
      -> providers (src/lib/providers)  <-- normalize external/mock data
         -> fixtures (src/lib/fixtures)  <-- DEMO DATA only, for MockProviders
```

Nothing above `src/lib/domain` is allowed to import a provider's raw JSON
shape. Providers normalize into domain types at the boundary; if a provider
lacks a field, the domain type marks it optional/undefined rather than the
domain model being reshaped to fit the provider.

## Domain model (see `src/lib/domain/*.ts` for the authoritative types)

- `FlightOpportunity` — one bookable award-flight observation.
- `HotelStayOpportunity` — a candidate hotel stay for given dates.
- `HotelRateObservation` — a priced rate with `provenance` and confidence.
- `HotelProgramMembership` / `HotelProgramBenefit` / `HotelPropertyBenefit`
  / `HotelOffer` — normalized, versioned records (never boolean flags).
- `CardBenefitRule` — a card's statement-credit/benefit rule with
  eligibility and effective dates.
- `HotelEconomics` — the computed cash/perk breakdown for one stay
  (see "Economics rules" below).
- `Pair` — `{ flight, hotelStay, appliedBenefits, applicableOffers,
  economics, score, confidence, freshness }`.

## Date/timezone rule

Hotel check-in is always derived from the **local arrival date at the
destination airport's timezone**, computed from the flight's arrival
timestamp + destination timezone — never from a UTC calendar-date
truncation of the departure or arrival instant. See
`src/lib/date/localArrivalDate.ts` and its International-Date-Line test
cases in `src/lib/date/localArrivalDate.test.ts`.

## Economics rules (see spec §19, implemented in `src/lib/economics/`)

```
grossHotelCost      = sum(room charges) + taxes + mandatory fees
promoAdjustedCost    = grossHotelCost - verified applicable cash-reducing promo
eligibleStatementCredit = min(remaining eligible card credit, eligible purchase amount)
netCashCost          = promoAdjustedCost - eligibleStatementCredit
softBenefitValue     = user-valued breakfast + usable property credit + other soft perks
subjectiveNetValue   = netCashCost - softBenefitValue
subjectiveEffectiveNightlyRate = subjectiveNetValue / numberOfNights
```

Cash and subjective figures are never merged into one displayed number; the
UI always shows reference price, cash-after-credit, and perk-adjusted value
as distinct rows.

## Rate provenance

Every `HotelRateObservation` carries one of:
`LIVE_PROGRAM_RATE | REFERENCE_RATE | USER_VERIFIED_RATE | CACHED_OBSERVATION | MOCK_RATE`,
plus a confidence assessment based on how comparable the observation is
(property, dates, room type, occupancy, refundability, meal inclusion,
taxes/fees known). Missing comparability data lowers confidence; it is
never assumed away.

## Pair Score

A deterministic, weighted, explainable score computed in
`src/lib/score/pairScore.ts` from flight dimensions (cabin, points, taxes,
availability, stops), hotel dimensions (net cost, promotions, captured
credit, benefit compatibility), and pair-level dimensions (date alignment,
total trip economics, freshness, confidence). Weights are named constants,
not magic numbers, so they can be tuned without touching scoring logic. The
UI surfaces the top contributing reasons rather than only a number.

## Provider architecture

`FlightAvailabilityProvider` and `HotelRateProvider` are the only two
external-data seams. Each currently has exactly one implementation, a
`Mock*Provider` reading from `src/lib/fixtures/`. Swapping in a real
provider is adding a new class implementing the same interface — no
call site outside `src/lib/providers/*` should need to change.

## Database

See `supabase/migrations/` for the versioned schema (not yet applied to any
live project — see `docs/deployment.md`). Tables follow spec §24, trimmed
to what the MVP milestones actually need; normalization favored over
speculative tables that aren't yet used.

## Architecture Decision Records

Material decisions that diverge from or add detail to the master spec are
logged below inline (kept lightweight; promote to separate ADR files if
this section grows unwieldy).

### ADR-0001: No AwardPair Supabase project provisioned yet

The only Supabase project reachable via this environment's Supabase
integration (`Poplex`, org `Card-scan`) is an unrelated pre-existing
product. Rather than create a new project unprompted (external-account
action) or misuse the unrelated one, schema work through M9 stays as
migration files only. A real project will be created/designated when M10
(auth) is reached, with the user's confirmation. **Update:** the user is
in the process of connecting the correct AwardPair Supabase account —
once that's confirmed reachable, `supabase/migrations/0001_init.sql` gets
applied to it and this note updates.

### ADR-0002: Explore page, Pair detail, and Flights table implementation notes

- `/explore`'s URL params use `departFrom`/`departTo` for the date range
  (`src/lib/search/parseExploreSearchParams.ts`), since a range needs two
  values where the spec only sketched a single `depart=`.
- `from`/`to` validation is restricted to the airports the fixtures
  actually support as origins/destinations (`JFK`/`EWR` and `HND`/`NRT`
  respectively — see `ORIGIN_AIRPORT_CODES`/`DESTINATION_AIRPORT_CODES`),
  not the full 4-key `DEMO_AIRPORTS` set, so the filter UI never offers a
  combination that can't return results.
- `/pairs/[id]` resolves by re-running `searchPairs` over the full
  fixture universe (`React.cache`-wrapped) and matching `Pair.id`, since
  Pairs are computed on demand rather than persisted — this only works
  because the fixture data is fixed; it will need to change once a real
  provider makes the flight/hotel universe too large to brute-force.
- Its "not found" state renders inline with a 200 status rather than
  calling Next's `notFound()`, to guarantee no raw exception/crash is
  ever shown for a bad id; a real 404 status could be layered on later
  via `notFound()` + `not-found.tsx` without changing the visible UI.
- The Hotels tab shows each property's reference cost computed directly
  from the rate's public fields (nights + taxes + fees), not via
  `computeHotelEconomics` — that function needs a specific program/card
  context to apply credits/offers, which the Hotels tab intentionally
  doesn't have (it shows the property in isolation; Pairs is where
  wallet-specific economics apply).
- The Flights table uses `@tanstack/react-table` v9 (installed version),
  whose API (`useTable`/`tableFeatures`/`createColumnHelper(...).columns(...)`)
  differs materially from the more commonly documented v8
  (`useReactTable`/`getCoreRowModel`). Follow the installed package's own
  bundled docs, not v8 examples, for any future changes here.
