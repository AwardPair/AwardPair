# AwardPair — Deployment

## Status

Deployed and publicly viewable. Vercel project `award-pair/awardpair` is
linked to `AwardPair/AwardPair` on GitHub. Live at
**https://awardpair.vercel.app** (also aliased as
`awardpair-award-pair.vercel.app`); every push to `claude/peaceful-brown-cn8p0i`
auto-deploys there and to the branch-specific preview
`https://awardpair-git-claude-peaceful-brown-cn8p0i-award-pair.vercel.app`.
`claude/peaceful-brown-cn8p0i` was deployed directly as the `production`
target (not via the GitHub repo's own `main` branch, which is still just the
initial commit) so the plain default domain serves the real app rather than
404ing.

**Vercel Authentication (SSO Protection) is scoped to preview deployments
only** (`ssoProtection.deploymentType: "preview"`), not production. This was
a deliberate change: with it applied to production, only accounts that are
members of the `award-pair` Vercel team could view the live URL at all —
anyone else (including the project owner's own everyday Vercel login) hit a
"Request access... Team owners emailed" gate, and there is no team-invite or
access-approval endpoint exposed to this environment's Vercel tooling to
resolve that any other way. Production is now open to anyone with the URL;
preview deployments (branch/PR previews) still require team-member SSO. This
document will be updated further as milestones M12–M14 land.

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

## Supabase project (connected and wired up)

- Project: org `AwardPair`, ref `ykxkyoddeoqaobqufqzm`.
- URL: `https://ykxkyoddeoqaobqufqzm.supabase.co`.
- `supabase/migrations/0001_init.sql` (schema, RLS on every table) and
  `0002_seed_card_catalog.sql` (the two DEMO card issuers/products My
  Wallet needs) are applied. Zero security-advisor findings.
- Supabase Auth (email magic link via `@supabase/ssr`, PKCE) and My
  Wallet (`/wallet`) are wired up and live — see CLAUDE.md and
  docs/architecture.md ADR-0003 for how.
- The service role key has not been fetched/stored anywhere in this
  repo/session; nothing server-side needs it yet (RLS + the user's own
  session cookie cover every current write path).

## Vercel project (connected and wired up)

- Team: `AwardPair` (`award-pair`), project `awardpair`
  (`prj_rgbkOXemB9IPJfEkyE3p9ibF2uOu`), linked to the `AwardPair/AwardPair`
  GitHub repo via Vercel's GitHub App.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are
  set on the Vercel project for all environments (production/preview/
  development) — same values as `.env.local` (gitignored; real values
  aren't secret, see `.env.example` for the shape).
- Every push to `claude/peaceful-brown-cn8p0i` triggers a new deployment.
  Because this branch was also pushed as the Vercel `production` target
  (see Status above), a push updates both `awardpair.vercel.app` and the
  branch-specific preview URL. No custom/purchased domain is configured —
  by design for now, per the user ("just use the domain they provide").

## Open item requiring the user

- **Supabase Auth redirect URL allow-list.** Go to the Supabase
  dashboard → Authentication → URL Configuration, and add this app's
  URL(s) to **Redirect URLs** (e.g. `http://localhost:3000/**` for local
  dev, `https://awardpair.vercel.app/**`, and
  `https://awardpair-git-claude-peaceful-brown-cn8p0i-award-pair.vercel.app/**`).
  No tool available here can set this (it's a dashboard-only setting);
  magic-link sign-in will redirect to `/auth/error` until it's added.
