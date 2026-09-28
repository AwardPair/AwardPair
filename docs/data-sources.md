# AwardPair — Data Sources

Status legend: **MOCK** (fixture data, no external source) · **LIVE**
(integrated with a real provider) · **PLANNED** (interface exists, no
implementation).

## Flight award availability

- **Status: MOCK.** `MockFlightAvailabilityProvider`
  (`src/lib/providers/flights/mock.ts`) returns fixture `FlightOpportunity`
  records seeded in `src/lib/fixtures/flights.ts`, clearly marked as demo
  data with a fixed `observedAt`.
- **Interface:** `FlightAvailabilityProvider`
  (`src/lib/providers/flights/types.ts`). A future adapter (e.g. a licensed
  award-search API) implements this interface and normalizes into
  `FlightOpportunity` — it never changes the domain type to match its own
  JSON.
- Do not scrape Seats.aero, AwardTool, PointsYeah, MaxFHR, MaxMyPoint,
  Roame, point.me, or issuer travel portals. A missing live provider is not
  permission to build a scraper.

## Hotel reference rates

- **Status: MOCK.** `MockHotelRateProvider`
  (`src/lib/providers/hotels/mock.ts`) returns `HotelRateObservation`
  records from `src/lib/fixtures/hotels.ts`, all tagged
  `rateType: "MOCK_RATE"`.
- **Interface:** `HotelRateProvider` (`src/lib/providers/hotels/types.ts`).
  A future licensed-rate integration (`FutureLicensedHotelRateProvider`)
  would populate `REFERENCE_RATE` or `LIVE_PROGRAM_RATE` observations only
  once real commercial access and terms are confirmed.
- A public cash rate is never assumed to equal an Amex FHR/THC or Chase
  program booking rate. Rates from different provenances are never silently
  merged.

## Hotel program membership, benefits, and offers

- **Status: MOCK / illustrative.** Membership, benefit, and offer fixtures
  in `src/lib/fixtures/hotel-programs.ts` are for UI development only and
  are labeled `DEMO DATA`. No current benefit amount, participating-property
  list, or promotion has been verified against an authoritative source as of
  this writing.
- Schema: `hotel_program_membership`, `hotel_program_benefit`,
  `hotel_property_benefit`, `hotel_offer` (see
  `supabase/migrations/`) each carry `effective_from`/`effective_to`,
  `source_url`, and `verified_at`/`last_verified_at` so stale or unverified
  data is distinguishable from confirmed data.
- Before any of this becomes real product data, it must be sourced from
  official program pages (e.g. Amex Fine Hotels + Resorts / The Hotel
  Collection program pages, Chase's published program materials) and
  re-verified on a cadence, not copied from blogs/forums.

## Transfer ecosystem

- **Status: PLANNED, unpopulated.** `transferable_programs` and
  `transfer_relationships` tables exist in the schema with effective-date
  and verification columns, but no current transfer ratios or bonuses are
  seeded, since these change frequently and must be verified before use.

## Card benefit rules

- **Status: MOCK.** `card_benefit_rules` fixtures are illustrative only
  (labeled DEMO DATA) and must not be treated as accurate current card
  terms. Real statement-credit amounts, eligibility windows, and caps must
  come from the issuer's current cardmember agreement / benefits guide
  before being used for real financial decisions.

## Supabase project

- **The real AwardPair Supabase project is connected** (org `AwardPair`,
  ref `ykxkyoddeoqaobqufqzm`) and `supabase/migrations/0001_init.sql` is
  applied to it — see `docs/deployment.md`. It is schema-only: no
  reference data (airports, programs, benefits, etc.) has been seeded
  into it, and the app still reads from the in-memory mock
  fixtures/providers under `src/lib/` for every milestone through M9. The
  earlier `Poplex`/`Card-scan` project was a different, unrelated
  product and was never used for AwardPair data.

## Legal/commercial constraints to keep in mind

- Any future flight or hotel provider integration (Seats.aero, AwardTool,
  Amadeus, Duffel, a licensed hotel-rate API, etc.) requires confirming
  actual commercial terms, redistribution rights, and credentials before
  implementation — never assumed.
- Real hotel/airline names in fixtures do not imply current prices, current
  award availability, or current program membership.
