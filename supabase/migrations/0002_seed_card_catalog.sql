-- Seeds the minimal reference data My Wallet (M10) needs: the two DEMO card
-- issuers/products already defined in src/lib/fixtures/benefits.ts. `slug`
-- is set to the exact same string used as that fixture's `id` field, so the
-- app can join a DB card_product row back to its TS fixture CardBenefitRule
-- by slug (see src/lib/wallet/cardCatalog.ts) without needing the DB row id
-- and the fixture's string id to match — they intentionally don't (DB ids
-- are real uuids; fixture ids are human-readable strings).
--
-- Everything else in the reference catalog (hotels, hotel programs,
-- memberships, benefits, offers, mileage programs, airports, award/rate
-- observations) stays mock-only in src/lib/fixtures/ — the app's
-- search/pairing still runs entirely off those, so seeding the rest of the
-- catalog into the DB now would be unused, speculative work.

insert into card_issuers (slug, name) values
  ('issuer-amex', 'American Express'),
  ('issuer-chase', 'Chase');

insert into card_products (issuer_id, slug, name)
select ci.id, v.slug, v.name
from (values
  ('card-amex-platinum', 'issuer-amex', 'Platinum Card'),
  ('card-csr', 'issuer-chase', 'Sapphire Reserve')
) as v(slug, issuer_slug, name)
join card_issuers ci on ci.slug = v.issuer_slug;
