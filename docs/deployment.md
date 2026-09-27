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

## Open items requiring the user

- **A real AwardPair Supabase project must be created or designated.** The
  only Supabase project currently reachable (`Poplex`) belongs to a
  different product; it must not be reused for AwardPair. Creating a new
  Supabase project is something this session can do once authorized, or the
  user can create one and share the project ref.
- **Vercel project linkage.** No Vercel CLI session/project link has been
  established in this environment yet. Needed before a preview deploy can
  be triggered from here.
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only service role key, etc.) are
  not yet defined anywhere — they depend on the Supabase project above.
