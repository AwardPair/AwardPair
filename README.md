# AwardPair

Award flights + luxury hotel benefits, paired into one optimized trip.

AwardPair is a discovery-and-valuation engine: it pairs an award-flight
opportunity with a compatible premium-hotel stay, the user's card benefits,
and verified hotel promotions into one explainable **Pair** with honest
economics. It is not a booking engine.

See `CLAUDE.md` for durable engineering rules and `docs/` for product,
architecture, data-source, and deployment documentation.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test        # vitest
npm run build       # production build
```

All flight and hotel data in this repository is currently mock/demo data
(see `docs/data-sources.md`) — no live provider is integrated yet.
