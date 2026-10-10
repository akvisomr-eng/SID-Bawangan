-- SID Bawangan AI Companion: optional, consent-based learning signals.
-- Run this in the Supabase SQL Editor for the SID Bawangan project before deploying the Edge Function.
create table if not exists public.ai_companion_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null default 'question' check (event_type in ('question', 'feedback', 'service_navigation')),
  question_redacted text,
  page_path text,
  resolved boolean,
  feedback smallint check (feedback in (-1, 1) or feedback is null)
);

alter table public.ai_companion_events enable row level security;
revoke all on table public.ai_companion_events from anon, authenticated;
grant all on table public.ai_companion_events to service_role;

comment on table public.ai_companion_events is
  'Consent-based, redacted AI companion improvement signals. Do not store raw transactions, NIK, credentials, or unredacted conversation histories. Define and enforce a retention schedule before public launch.';
