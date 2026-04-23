create extension if not exists pgcrypto;

do $$
begin
  create type user_status as enum (
    'pending_onboarding',
    'active',
    'paused',
    'canceled'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type plan_key as enum (
    'monthly',
    'quarterly',
    'annual'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type subscription_status as enum (
    'incomplete',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type category_slug as enum (
    'mental_clarity',
    'organization',
    'health_energy',
    'work_business',
    'personal_projects',
    'relationships'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type action_complexity as enum (
    'lighter',
    'standard',
    'stretch'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type complexity_bias as enum (
    'downshift',
    'neutral',
    'upshift'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type email_kind as enum (
    'daily',
    'weekly',
    'monthly_clarity'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type send_queue_status as enum (
    'queued',
    'claimed',
    'sending',
    'sent',
    'failed',
    'skipped',
    'canceled'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type action_feedback as enum (
    'done',
    'paused'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  timezone text,
  status user_status not null default 'pending_onboarding',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  plan_key plan_key not null,
  status subscription_status not null default 'incomplete',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_product_id text,
  stripe_price_id text,
  cancel_at_period_end boolean not null default false,
  trial_ends_at timestamptz,
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_categories (
  user_id uuid not null references users(id) on delete cascade,
  category_slug category_slug not null,
  position smallint not null,
  created_at timestamptz not null default now(),
  primary key (user_id, category_slug),
  unique (user_id, position),
  check (position between 1 and 3)
);

create table if not exists actions (
  id text primary key,
  category_slug category_slug not null,
  title text not null,
  instruction text not null,
  minutes smallint not null,
  why_it_matters text not null,
  complexity action_complexity not null default 'standard',
  texture text not null,
  is_fallback boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('draft', 'active', 'archived')),
  check (minutes between 5 and 15)
);

create index if not exists actions_category_status_idx
  on actions(category_slug, status);

create table if not exists user_category_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category_slug category_slug not null,
  target_complexity action_complexity not null default 'standard',
  current_bias complexity_bias not null default 'neutral',
  consecutive_done_count integer not null default 0,
  consecutive_pause_count integer not null default 0,
  last_action_id text,
  last_texture text,
  updated_at timestamptz not null default now(),
  unique (user_id, category_slug)
);

create table if not exists send_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  email_kind email_kind not null,
  local_send_date date not null,
  scheduled_for_utc timestamptz not null,
  status send_queue_status not null default 'queued',
  claim_token uuid,
  claim_expires_at timestamptz,
  attempt_count integer not null default 0,
  provider text,
  provider_message_id text,
  subject text,
  rendered_payload jsonb,
  skip_reason text,
  error_code text,
  error_message text,
  sent_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, email_kind, local_send_date)
);

create index if not exists send_queue_due_idx
  on send_queue(status, scheduled_for_utc);

create index if not exists send_queue_claim_token_idx
  on send_queue(claim_token);

create table if not exists email_action_items (
  id uuid primary key default gen_random_uuid(),
  send_queue_id uuid not null references send_queue(id) on delete cascade,
  category_slug category_slug not null,
  action_id text not null references actions(id),
  position smallint not null,
  done_token text not null unique,
  pause_token text not null unique,
  feedback action_feedback,
  feedback_at timestamptz,
  selection_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (send_queue_id, category_slug),
  unique (send_queue_id, position)
);

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  provider text not null default 'stripe',
  event_type text not null,
  provider_event_id text not null unique,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists billing_events_type_created_idx
  on billing_events(event_type, created_at desc);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  send_queue_id uuid not null references send_queue(id) on delete cascade,
  provider text not null default 'resend',
  event_type text not null,
  provider_event_id text,
  occurred_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists email_events_provider_event_idx
  on email_events(provider, provider_event_id)
  where provider_event_id is not null;

create index if not exists email_events_type_occurred_idx
  on email_events(event_type, occurred_at desc);
