# CLAUDE.md — AwardPair Engineering Rules

This file is durable guidance for any Claude Code session (or human) working
on AwardPair. Read this before making architectural decisions. It reflects
the master build specification and decisions already made; treat it as the
source of truth over conversation history.

## What AwardPair is

A discovery-and-valuation engine that pairs an award-flight opportunity with a
compatible premium-hotel stay, the user's applicable card benefits, and
verified hotel promotions, into one explainable "Pair" with honest economics.
It is **not** a booking engine. Primary search default is **Pairs** (not
Flights, not Hotels).

Slogan: "Where award flights meet hotel perks."
Homepage headline: "Find the trip your points and perks were meant for."

## Non-negotiable product rules

- Hotel check-in date = the traveler's **local arrival date at the
  destination**, never a UTC-truncated date. See `src/lib/date/` and its
  tests for International Date Line handling.
- Never mix **cash economics** and **subjective/soft perk value** in the same
  number. Always show: reference/booking price → cash after eligible
  statement credit → optional perk-adjusted value, as distinct figures.
- Every hotel rate carries a **provenance** (`LIVE_PROGRAM_RATE`,
  `REFERENCE_RATE`, `USER_VERIFIED_RATE`, `CACHED_OBSERVATION`, `MOCK_RATE`).
  Never label a `REFERENCE_RATE` as an actual FHR/THC/Chase Edit booking rate.
- Hotel program membership, benefits, and offers are **normalized, versioned
  records** with effective dates and verification metadata — never booleans
  like `is_fhr`, never a single collapsed "$100 credit" field. See
  `docs/data-sources.md`.
- Every external observation (flight award space, hotel rate, promo) exposes
  **freshness** (`observedAt`, staleness thresholds) in the UI.
- The Pair Score is a **deterministic, explainable heuristic**, not financial
  advice and not derived from fabricated benchmarks. If no trustworthy
  benchmark exists for a dimension, omit it rather than invent one.
- All demo/fixture data (prices, availability, benefit amounts) must be
  clearly labeled `DEMO DATA` in both code (naming/comments) and any UI that
  could render it. Never let a fixture value read as a verified live price.

## Stack decisions (do not change without updating this file)

- Next.js 16 (App Router, Server Components by default), React 19,
  TypeScript strict mode, Tailwind CSS v4.
- `lucide-react`, `clsx`, `tailwind-merge` for UI; `@tanstack/react-table` for
  dense power-user tables (Flights view); `nuqs` for URL-backed search state.
- Supabase Postgres + Supabase Auth + RLS, `@supabase/ssr` (current
  documented pattern — no deprecated auth-helpers).
- Vercel hosting. Cloudflare Workers/Queues reserved for future ingestion —
  not introduced until a milestone genuinely needs them.
- Vitest for unit tests, Playwright for E2E (added when UI exists to test).
- No Redis/BullMQ/Kafka/Elasticsearch/Kubernetes/separate Express server.

## Current state (update as milestones land)

- **No live Supabase project is linked to AwardPair yet.** The only
  Supabase project reachable from this environment (`Poplex` /
  `Card-scan` org) belongs to a different, unrelated product and must
  never be used for AwardPair data. Schema lives as versioned SQL
  migrations in `supabase/migrations/` and has **not** been applied
  anywhere. Before M10 (auth), a real AwardPair Supabase project must be
  created or an existing one designated by the user — ask before assuming
  one.
- No live flight/hotel-rate provider is integrated. All data comes from
  `MockFlightAvailabilityProvider` / `MockHotelRateProvider` behind the
  `FlightAvailabilityProvider` / `HotelRateProvider` interfaces in
  `src/lib/providers/`. Swapping in a real provider means writing a new
  adapter that normalizes into the same domain types — never changing the
  domain types to match a provider's JSON shape.
- No authentication is wired up yet. Wallet/preferences are local-only
  until M10.
- No email/Sentry/PostHog/Stripe integration exists yet; those are later
  milestones and must not be scaffolded speculatively.

## Working conventions

- Keep provider-specific normalization inside `src/lib/providers/*`; the
  rest of the app only ever sees the internal domain model in
  `src/lib/domain/`.
- Prefer localized edits over rewriting whole files. Don't add abstractions,
  feature flags, or config knobs beyond what the current milestone needs.
- Run `npm run typecheck`, `npm run lint`, and `npm run test` before treating
  a milestone as done. Run `npm run build` before any deploy-relevant change.
- Document material architecture decisions in `docs/architecture.md` rather
  than only in commit messages.
