-- AwardPair initial schema.
--
-- STATUS: not applied to any live Supabase project. See docs/deployment.md
-- and docs/architecture.md ADR-0001 — the only Supabase project reachable
-- from the current dev environment (Poplex, org Card-scan) is an unrelated
-- product and must never receive this schema. Apply this once a real
-- AwardPair project is created/designated.
--
-- Mirrors the TypeScript domain model in src/lib/domain/*.ts. Reference
-- data (airports, mileage/hotel programs, benefits, offers, award/rate
-- observations) is publicly readable; all writes to those tables are
-- server-only (no INSERT/UPDATE/DELETE policy is granted to anon/
-- authenticated roles here, so RLS blocks them by default). User-owned
-- tables are scoped to auth.uid().
--
-- Deliberately NOT included yet (see docs/architecture.md): a separate
-- `airlines` table (the domain model stores airline names as plain text
-- until a real provider needs airline-level normalization), `data_sources`
-- / `provider_runs` (no ingestion pipeline exists yet — see M12),
-- `pair_snapshots` (not yet justified — Pairs are computed on demand).

create extension if not exists pgcrypto;

-- ============================================================
-- Reference / catalog data
-- ============================================================

create table airports (
  iata_code text primary key,
  name text not null,
  city text not null,
  country_code text not null,
  time_zone text not null
);

create table mileage_programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  transferable_from text[]
);

create table transferable_programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

-- Unpopulated until specific current transfer ratios/bonuses are verified
-- (spec: never populate unverified current transfer bonuses).
create table transfer_relationships (
  id uuid primary key default gen_random_uuid(),
  transferable_program_id uuid not null references transferable_programs(id),
  mileage_program_id uuid not null references mileage_programs(id),
  ratio_numerator integer not null,
  ratio_denominator integer not null,
  effective_from date not null,
  effective_to date,
  source_url text,
  verified_at timestamptz not null
);

create table hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  country_code text not null,
  latitude double precision,
  longitude double precision
);

create table hotel_programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  issuer text not null
);

create table card_issuers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table card_products (
  id uuid primary key default gen_random_uuid(),
  issuer_id uuid not null references card_issuers(id),
  slug text unique not null,
  name text not null
);

-- ============================================================
-- Hotel program membership, benefits, offers (versioned, never booleans)
-- ============================================================

create table hotel_program_memberships (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id),
  program_id uuid not null references hotel_programs(id),
  valid_from date not null,
  valid_to date,
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz not null,
  source_url text,
  verification_method text not null check (verification_method in ('OFFICIAL_PROGRAM_PAGE', 'MANUAL_CHECK', 'UNVERIFIED_DEMO')),
  unique (hotel_id, program_id, valid_from)
);

create table hotel_program_benefits (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references hotel_programs(id),
  type text not null check (type in ('breakfast', 'property_credit', 'room_upgrade', 'early_checkin', 'late_checkout', 'other')),
  description text not null,
  amount_value numeric(10, 2),
  amount_currency text,
  effective_from date not null,
  effective_to date,
  source_url text,
  verified_at timestamptz not null
);

create table hotel_property_benefits (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id),
  program_id uuid not null references hotel_programs(id),
  overrides_program_benefit_id uuid references hotel_program_benefits(id),
  type text not null check (type in ('breakfast', 'property_credit', 'room_upgrade', 'early_checkin', 'late_checkout', 'other')),
  description text not null,
  amount_value numeric(10, 2),
  amount_currency text,
  effective_from date not null,
  effective_to date,
  source_url text,
  verified_at timestamptz not null
);

create table card_benefit_rules (
  id uuid primary key default gen_random_uuid(),
  card_product_id uuid not null references card_products(id),
  type text not null check (type in ('hotel_statement_credit', 'annual_travel_credit', 'other')),
  applicable_program_ids uuid[],
  max_amount_value numeric(10, 2) not null,
  max_amount_currency text not null,
  period text not null check (period in ('calendar_year', 'cardmember_year', 'per_stay')),
  minimum_nights integer,
  requires_prepaid_booking boolean not null default false,
  requires_booking_channel text,
  effective_from date not null,
  effective_to date,
  source_url text,
  verified_at timestamptz not null
);

create table hotel_offers (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotels(id),
  program_id uuid references hotel_programs(id),
  type text not null check (type in ('free_night', 'percentage_discount', 'fixed_discount', 'additional_property_credit', 'provider_quoted_discount')),
  description text not null,
  discount_percentage numeric(5, 2),
  discount_amount_value numeric(10, 2),
  discount_amount_currency text,
  additional_credit_amount_value numeric(10, 2),
  additional_credit_amount_currency text,
  minimum_nights integer,
  maximum_nights integer,
  booking_window_start date,
  booking_window_end date,
  stay_window_start date,
  stay_window_end date,
  blackout_dates date[],
  eligible_card_product_ids uuid[],
  source_url text,
  verified_at timestamptz not null
);

-- ============================================================
-- Award flight and hotel rate observations
-- ============================================================

create table award_observations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  mileage_program_id uuid not null references mileage_programs(id),
  marketing_airline text not null,
  operating_airline text,
  flight_number text,
  origin_airport_code text not null references airports(iata_code),
  destination_airport_code text not null references airports(iata_code),
  departure_at timestamptz not null,
  arrival_at timestamptz not null,
  cabin text not null check (cabin in ('economy', 'premium_economy', 'business', 'first')),
  points_cost integer not null,
  taxes_amount numeric(10, 2) not null,
  taxes_currency text not null,
  available_seats integer,
  stops integer not null default 0,
  layover_airport_codes text[],
  observed_at timestamptz not null default now(),
  expires_at timestamptz
);
create index award_observations_route_idx on award_observations (origin_airport_code, destination_airport_code, departure_at);

create table hotel_rate_observations (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id),
  check_in_date date not null,
  check_out_date date not null,
  taxes_amount numeric(10, 2) not null,
  taxes_currency text not null,
  mandatory_fees_amount numeric(10, 2) not null,
  mandatory_fees_currency text not null,
  refundable boolean not null default false,
  meal_inclusion text check (meal_inclusion in ('none', 'breakfast', 'half_board', 'full_board')),
  provenance text not null check (provenance in ('LIVE_PROGRAM_RATE', 'REFERENCE_RATE', 'USER_VERIFIED_RATE', 'CACHED_OBSERVATION', 'MOCK_RATE')),
  confidence_level text not null check (confidence_level in ('high', 'medium', 'low')),
  confidence_reason text not null,
  comparability_property_match boolean not null default false,
  comparability_dates_match boolean not null default false,
  comparability_room_type_known boolean not null default false,
  comparability_occupancy_known boolean not null default false,
  comparability_refundability_known boolean not null default false,
  comparability_meal_inclusion_known boolean not null default false,
  comparability_taxes_and_fees_known boolean not null default false,
  observed_at timestamptz not null default now(),
  expires_at timestamptz
);
create index hotel_rate_observations_hotel_dates_idx on hotel_rate_observations (hotel_id, check_in_date, check_out_date);

create table hotel_rate_nights (
  id uuid primary key default gen_random_uuid(),
  rate_observation_id uuid not null references hotel_rate_observations(id) on delete cascade,
  stay_date date not null,
  room_rate_amount numeric(10, 2) not null,
  room_rate_currency text not null,
  unique (rate_observation_id, stay_date)
);

-- ============================================================
-- User-owned data (RLS-protected)
-- ============================================================

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_product_id uuid not null references card_products(id),
  added_at timestamptz not null default now(),
  credit_used_amount numeric(10, 2),
  credit_used_currency text
);

create table user_benefit_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  breakfast_value_amount numeric(10, 2) not null default 25,
  breakfast_value_currency text not null default 'USD',
  property_credit_usable_fraction numeric(4, 3) not null default 0.75,
  late_checkout_value_amount numeric(10, 2),
  late_checkout_value_currency text
);

create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  params jsonb not null,
  created_at timestamptz not null default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_search_id uuid references saved_searches(id) on delete set null,
  criteria jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references alerts(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  pair_snapshot jsonb not null,
  notified_at timestamptz
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table airports enable row level security;
alter table mileage_programs enable row level security;
alter table transferable_programs enable row level security;
alter table transfer_relationships enable row level security;
alter table hotels enable row level security;
alter table hotel_programs enable row level security;
alter table card_issuers enable row level security;
alter table card_products enable row level security;
alter table hotel_program_memberships enable row level security;
alter table hotel_program_benefits enable row level security;
alter table hotel_property_benefits enable row level security;
alter table card_benefit_rules enable row level security;
alter table hotel_offers enable row level security;
alter table award_observations enable row level security;
alter table hotel_rate_observations enable row level security;
alter table hotel_rate_nights enable row level security;

create policy "Public read" on airports for select using (true);
create policy "Public read" on mileage_programs for select using (true);
create policy "Public read" on transferable_programs for select using (true);
create policy "Public read" on transfer_relationships for select using (true);
create policy "Public read" on hotels for select using (true);
create policy "Public read" on hotel_programs for select using (true);
create policy "Public read" on card_issuers for select using (true);
create policy "Public read" on card_products for select using (true);
create policy "Public read" on hotel_program_memberships for select using (true);
create policy "Public read" on hotel_program_benefits for select using (true);
create policy "Public read" on hotel_property_benefits for select using (true);
create policy "Public read" on card_benefit_rules for select using (true);
create policy "Public read" on hotel_offers for select using (true);
create policy "Public read" on award_observations for select using (true);
create policy "Public read" on hotel_rate_observations for select using (true);
create policy "Public read" on hotel_rate_nights for select using (true);
-- No insert/update/delete policies on reference tables: all writes happen
-- server-side with the service role key, which bypasses RLS.

alter table user_profiles enable row level security;
alter table user_cards enable row level security;
alter table user_benefit_preferences enable row level security;
alter table saved_searches enable row level security;
alter table alerts enable row level security;
alter table alert_events enable row level security;

create policy "Own profile" on user_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Own cards" on user_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own preferences" on user_benefit_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own saved searches" on saved_searches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own alerts" on alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own alert events" on alert_events for select using (
  exists (select 1 from alerts where alerts.id = alert_events.alert_id and alerts.user_id = auth.uid())
);
