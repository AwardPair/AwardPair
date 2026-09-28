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

### ADR-0001: AwardPair Supabase project connected and schema applied

Initially, the only Supabase project reachable via this environment's
Supabase integration (`Poplex`, org `Card-scan`) was an unrelated
pre-existing product, so schema work through M9 stayed as migration
files only rather than being applied anywhere. The user then connected
the correct AwardPair Supabase account. `supabase/migrations/0001_init.sql`
has since been applied to the real project (org `AwardPair`, project ref
`ykxkyoddeoqaobqufqzm`, `https://ykxkyoddeoqaobqufqzm.supabase.co`) —
22 tables, RLS enabled on every one, `get_advisors(type: "security")`
returned zero findings. The project is currently empty of data (schema
only); no reference fixtures have been seeded into it, and no
application code reads from or writes to it yet — the app still runs
entirely on the in-memory mock providers/fixtures under `src/lib/`. Auth
wiring (`@supabase/ssr`, env vars, a real client) is M10's job, not
done here. The service role key was not fetched or stored.

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

### ADR-0003: M10 auth (Supabase magic link) and My Wallet

- **PKCE code-exchange over token_hash.** Supabase's SSR docs show two
  patterns for email sign-in: a `token_hash`/`verifyOtp` confirm route
  (needs a one-time email-template edit in the dashboard) and a PKCE
  `code`/`exchangeCodeForSession` callback (works with Supabase's
  default email template, since `@supabase/ssr` clients default to
  PKCE). Chose the PKCE route specifically to avoid requiring a manual
  dashboard template edit — the only manual step left is adding the
  app's redirect URL(s) to Supabase's allow-list, which is unavoidable
  either way.
- **`proxy.ts`, not `middleware.ts`.** Next.js 16.3.x deprecated
  `middleware.ts` in favor of `proxy.ts` (same behavior, renamed file +
  exported function) — verified independently via Next.js's own docs
  before writing it, not assumed from the Supabase example.
- **Auth is opt-in per route, not blanket.** Supabase's own example
  proxy redirects any unauthenticated request to `/login`. AwardPair's
  proxy (`src/lib/supabase/proxy.ts`) only refreshes the session
  cookie; `/wallet` is the only route that requires auth, enforced at
  the page level (`redirect("/auth/sign-in?next=/wallet")`), because
  Explore/Pairs/Calendar are public by design (see docs/product.md).
- **Root layout now calls `getUser()` on every request** (to show the
  nav's signed-in state), which forces the whole app to render
  dynamically — `/` was previously statically prerendered. This is a
  deliberate trade-off: per Supabase's own SSR guidance, mixing
  ISR/static caching with auth-cookie-aware rendering risks leaking one
  user's session to another via a cached `Set-Cookie` response, so
  dynamic-by-default is the safer choice at this scale. Revisit only
  with real traffic data (spec §33: measure before optimizing).
- **DB seeding is intentionally minimal.** Only `card_issuers`/
  `card_products` (with a `slug` column matching the existing TS
  fixture id strings) were seeded — just enough for My Wallet's card
  picker. The full reference catalog (hotels, hotel programs,
  memberships, benefits, offers, mileage programs, airports, award/rate
  observations) stays fixture-only; the search/pairing engine doesn't
  read from the DB at all yet, so seeding the rest now would be unused.
- **Wallet is not wired into pairing yet.** `demoPairingContext()` in
  `src/lib/search/demoContext.ts` still assumes every demo card
  regardless of who's signed in. A real user's wallet selections
  (mapped DB card_product → TS fixture `CardBenefitRule` by matching
  `slug`) need to flow into `searchPairs`/`buildPairs` for the wallet to
  actually affect Pair economics — left as a follow-up, not attempted
  in this pass.
- **RLS verified statically, not dynamically.** With zero real
  `auth.users` rows yet, cross-user isolation was verified by reading
  each policy's `USING`/`WITH CHECK` SQL directly from `pg_policies`
  (all read `auth.uid() = user_id`, or `= id` for `user_profiles`) plus
  a clean Supabase security-advisor run, rather than fabricating
  `auth.users` rows by hand (risky: that table has internal constraints
  and triggers not worth bypassing for a test). Full dynamic
  verification happens naturally once two real users have wallet data.

### ADR-0004: M11 saved searches + alerts, evaluated on demand

- **Reused the existing `saved_searches`/`alerts`/`alert_events` schema
  from `supabase/migrations/0001_init.sql`** — it was already applied to
  the live project as part of M2 but never had application code written
  against it. No new migration was needed.
- **A saved search's `params` column stores the exact same
  `ExploreSearchParams` shape `/explore`'s URL produces**
  (`exploreParamsToRawRecord()` in `src/lib/search/parseExploreSearchParams.ts`),
  round-tripped back through `parseExploreSearchParams()` when evaluating —
  so a saved search gets identical defaulting/validation to a live URL
  instead of a second, divergent parsing path.
- **No background evaluation.** CLAUDE.md is explicit that Cloudflare
  Workers/Queues (or any cron/queue) are a later milestone, not introduced
  speculatively. Alerts are instead evaluated on demand: a "Check now"
  button on `/alerts` re-runs the saved search through `searchPairs()`,
  filters the results with the pure, unit-tested
  `findMatchingPairs()`/`pairMatchesCriteria()` in
  `src/lib/alerts/evaluateAlert.ts`, and inserts an `alert_events` row for
  any matching Pair not already recorded for that alert (deduped by
  `Pair.id`, read back from each event's `pair_snapshot`). This is
  deterministic and sufficient against fixed fixture data; a real
  scheduled-evaluation engine is what M12/M13 would need to justify
  actually standing up ingestion infrastructure.
- **Alert criteria are intentionally minimal**: `maxNetCashCost` and/or
  `minPairScore`, both optional but at least one required. This mirrors
  the two numbers already most prominent on a `PairCard` (net cash cost,
  Pair Score) rather than exposing every dimension of `HotelEconomics` as
  a separate threshold.
- **`alert_events.pair_snapshot` stores a small denormalized summary**
  (route, hotel name, dates, net cash cost, score, and the `Pair.id` used
  to link to `/pairs/[id]`) rather than the full `Pair` object, so
  `/alerts` can render matches without re-running `searchPairs()` on every
  page load — only "Check now" re-runs the search.
