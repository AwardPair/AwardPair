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

- **A live AwardPair Supabase project is connected and wired up** (org
  `AwardPair`, project ref `ykxkyoddeoqaobqufqzm`,
  `https://ykxkyoddeoqaobqufqzm.supabase.co`). `supabase/migrations/`
  0001 (full schema, RLS on every table) and 0002 (seeds `card_issuers`/
  `card_products` — the only reference data actually in the DB so far;
  everything else still comes from `src/lib/fixtures/`) are applied.
  Zero security-advisor findings; RLS policy definitions reviewed
  directly (`auth.uid() = user_id` on every user-owned table).
- **Supabase Auth (email magic link) is wired up** — `src/lib/supabase/`
  (`client.ts`/`server.ts`/`proxy.ts`), root `proxy.ts` (Next.js 16
  renamed `middleware.ts` → `proxy.ts`), `/auth/sign-in`,
  `/auth/callback` (PKCE `exchangeCodeForSession`), `/auth/error`. Only
  `/wallet` requires auth (page-level redirect); everything else stays
  public by design. **Manual step still needed from the user**: add the
  app's URL(s) to Supabase Auth → URL Configuration → Redirect URLs
  (e.g. `http://localhost:3000/**` and the Vercel deployment's
  `/**`) — no tool here can set that, and magic links won't complete
  without it.
- **My Wallet (`/wallet`) is real**, not a preview: signed-in users
  add/remove cards from the seeded `card_products` and set benefit
  preferences, both persisted via Server Actions in
  `src/app/wallet/actions.ts` against RLS-protected tables. It is not
  yet wired into the Pairs/Explore economics — that still runs on the
  fixture-driven `demoPairingContext()` in `src/lib/search/`
  regardless of who's signed in. Connecting a real wallet to the
  pairing engine is a natural next step, not done here.
- The root layout calls `supabase.auth.getUser()` to render the nav's
  signed-in state, which makes every page dynamically rendered (no more
  static prerendering of `/`) — an intentional trade-off; see
  docs/architecture.md.
- No live flight/hotel-rate provider is integrated. All data comes from
  `MockFlightAvailabilityProvider` / `MockHotelRateProvider` behind the
  `FlightAvailabilityProvider` / `HotelRateProvider` interfaces in
  `src/lib/providers/`. Swapping in a real provider means writing a new
  adapter that normalizes into the same domain types — never changing the
  domain types to match a provider's JSON shape.
- **Saved searches + alerts (`/alerts`) are real**: signed-in users save an
  Explore "Pairs" search (from the Pairs tab) under a name, then attach a
  threshold (max net cash cost and/or min Pair Score) as an alert. There is
  **no background evaluation** — no cron/queue exists yet (Cloudflare
  Workers/Queues are still a later milestone, not introduced
  speculatively) — so alerts are evaluated on demand via a "Check now"
  button, which re-runs the saved search and records any newly-matching
  Pair as an `alert_events` row. See `src/lib/alerts/evaluateAlert.ts` (pure
  matching logic) and `src/app/alerts/actions.ts`.
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
