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
(auth) is reached, with the user's confirmation.
