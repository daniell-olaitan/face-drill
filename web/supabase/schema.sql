-- VisaPrep Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  nationality  text,
  tier         text not null default 'free' check (tier in ('free', 'pro')),
  sessions_used    integer not null default 0,
  sessions_limit   integer not null default 5,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- sessions
-- ============================================================
create table public.sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  visa_profile_id  text not null,
  status           text not null default 'created'
                   check (status in ('created','briefing','in_progress','completed','abandoned')),
  context          jsonb not null default '{}',
  tavus_conversation_id    text,
  tavus_conversation_url   text,
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute procedure public.set_updated_at();

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_status_idx  on public.sessions(status);

-- ============================================================
-- messages
-- ============================================================
create table public.messages (
  id                   uuid primary key default uuid_generate_v4(),
  session_id           uuid not null references public.sessions(id) on delete cascade,
  speaker              text not null check (speaker in ('officer','applicant','system')),
  text                 text not null,
  timestamp_ms         integer not null default 0,
  question_category_id text,
  created_at           timestamptz not null default now()
);

create index messages_session_id_idx on public.messages(session_id);

-- ============================================================
-- feedback
-- ============================================================
create table public.feedback (
  id               uuid primary key default uuid_generate_v4(),
  session_id       uuid not null unique references public.sessions(id) on delete cascade,
  overall_score    integer not null check (overall_score between 0 and 100),
  verdict          text not null check (verdict in ('likely_approve','borderline','likely_refuse')),
  summary          text not null,
  criterion_scores jsonb not null default '[]',
  red_flags        jsonb not null default '[]',
  strengths        jsonb not null default '[]',
  improvements     jsonb not null default '[]',
  answer_breakdowns jsonb not null default '[]',
  generated_at     timestamptz not null default now()
);

create index feedback_session_id_idx on public.feedback(session_id);

-- ============================================================
-- waitlist  (pre-launch email capture — public insert, no public read)
-- ============================================================
create table if not exists public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  created_at timestamptz not null default now()
);
