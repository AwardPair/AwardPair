# AwardPair — Deployment

## Status

No deployment has been made yet. This document will be updated as
milestones M12–M14 land.

## Target hosting

- **Application:** Vercel (Next.js).
- **Database/Auth:** Supabase Postgres + Supabase Auth + RLS.
- **Background/ingestion (future, only if genuinely needed):** Cloudflare
  Workers + Queues. Cloudflare is not used to proxy the primary Vercel app.

## Preconditions before any deploy

1. `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test` all
   pass.
2. No secrets committed (`.env*` stays untracked except `.env.example`).
3. If auth is enabled, Supabase Auth callback URLs match the deploy domain.
4. Environment variables required by the app are documented in
   `.env.example` and configured in the Vercel project.
5. Preview deployment is verified before any production domain is pointed
   at a build.

## Supabase project (connected)

- Project: org `AwardPair`, ref `ykxkyoddeoqaobqufqzm`.
- URL: `https://ykxkyoddeoqaobqufqzm.supabase.co`.
- `supabase/migrations/0001_init.sql` is applied (22 tables, RLS enabled
  everywhere, no security advisor findings). No data is seeded and no
  application code talks to it yet — that starts at M10 (Supabase Auth +
  `@supabase/ssr` + My Wallet).
- The service role key has not been fetched/stored in this session; it
  will be needed server-only once M10 wires up real writes, and must
  never be exposed to the client.

## Open items requiring the user

- **Vercel project linkage.** No Vercel CLI session/project link has been
  established in this environment yet. Needed before a preview deploy can
  be triggered from here.
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`/publishable key, server-only service
  role key) are documented above but not yet wired into the app or a
  Vercel project — that lands with M10's auth work.
