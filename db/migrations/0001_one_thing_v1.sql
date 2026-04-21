create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  email_verified_at timestamptz,
  timezone text,
  status text not null default 'pending_onboarding',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('pending_onboarding', 'active', 'paused', 'canceled'))
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid'))
);

create table if not exists user_categories (
  user_id uuid not null references users(id) on delete cascade,
  category_slug text not null,
  position smallint not null,
  created_at timestamptz not null default now(),
  primary key (user_id, category_slug),
  unique (user_id, position),
  check (
    category_slug in (
      'mental_clarity',
      'organization',
      'health_energy',
      'work_business',
      'personal_projects',
      'relationships'
    )
  )
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,
  title text not null,
  instruction text not null,
  minutes smallint not null,
  why_it_matters text not null,
  complexity text not null default 'standard',
  texture text not null,
  status text not null default 'draft',
  is_fallback boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    category_slug in (
      'mental_clarity',
      'organization',
      'health_energy',
      'work_business',
      'personal_projects',
      'relationships'
    )
  ),
  check (complexity in ('lighter', 'standard', 'stretch')),
  check (status in ('draft', 'active', 'archived'))
);

create table if not exists daily_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  local_send_date date not null,
  scheduled_for_utc timestamptz not null,
  sent_at timestamptz,
  status text not null default 'queued',
  provider text,
  provider_message_id text,
  subject text,
  error_code text,
  created_at timestamptz not null default now(),
  unique (user_id, local_send_date),
  check (status in ('queued', 'sending', 'sent', 'failed', 'skipped'))
);

create table if not exists daily_send_items (
  id uuid primary key default gen_random_uuid(),
  daily_send_id uuid not null references daily_sends(id) on delete cascade,
  category_slug text not null,
  action_id uuid not null references actions(id),
  position smallint not null,
  done_token text not null unique,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  unique (daily_send_id, category_slug),
  unique (daily_send_id, position),
  check (
    category_slug in (
      'mental_clarity',
      'organization',
      'health_energy',
      'work_business',
      'personal_projects',
      'relationships'
    )
  )
);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  daily_send_id uuid not null references daily_sends(id) on delete cascade,
  provider text not null,
  event_type text not null,
  provider_event_id text,
  occurred_at timestamptz not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists email_events_provider_event_id_idx
  on email_events(provider, provider_event_id)
  where provider_event_id is not null;

create table if not exists send_queue (
  user_id uuid primary key references users(id) on delete cascade,
  next_send_at_utc timestamptz not null,
  last_sent_at timestamptz,
  job_claimed_at timestamptz,
  job_claim_token uuid,
  job_attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists send_queue_due_idx
  on send_queue(next_send_at_utc);

create index if not exists daily_sends_user_scheduled_idx
  on daily_sends(user_id, scheduled_for_utc desc);
