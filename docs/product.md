# AwardPair — Product

## Identity

- Name: AwardPair
- Slogan: "Where award flights meet hotel perks."
- Headline: "Find the trip your points and perks were meant for."

AwardPair is a working brand name only. No trademark registration or legal
brand clearance is claimed or implied.

## The core object: the Pair

A **Pair** is:

```
award-flight opportunity
+ compatible premium-hotel stay
+ the user's applicable card benefits
+ verified hotel promotions (when available)
= one complete optimized travel opportunity
```

The question AwardPair answers: *"If I can book this award flight, which
premium hotel opportunity best aligns with my actual arrival dates and cards,
and what is the realistic economic value of the complete trip?"*

## Scope for the MVP

AwardPair is a **discovery and valuation engine**, not a booking engine. It
does not transact FHR/THC/The Edit reservations. Instead it gives users a
clean **verification/handoff** flow to confirm exact pricing on the official
program portal before they act.

## Search modes

1. **Pairs** (default)
2. Flights
3. Hotels

## Primary navigation

AwardPair · Explore · Pair Calendar · Alerts · My Wallet · Sign In / Account

## What a Pair card must communicate

Flight + hotel + card/program benefit + combined economics, legible without
the user mentally combining separate panels. See `docs/architecture.md` for
the domain model backing this.

## Monetization (not built in the MVP)

Planned future model: Free tier + AwardPair Pro subscription, with possible
later approved affiliate/partner relationships. No billing is implemented in
the MVP; do not scaffold Stripe until that milestone is explicitly reached.
