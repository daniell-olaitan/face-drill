-- VisaPrep Row Level Security Policies
-- Run AFTER schema.sql

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- sessions
-- ============================================================
alter table public.sessions enable row level security;

create policy "Users can view their own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- messages
-- ============================================================
alter table public.messages enable row level security;

create policy "Users can view messages in their sessions"
  on public.messages for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert messages to their sessions"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- feedback
-- ============================================================
alter table public.feedback enable row level security;

create policy "Users can view feedback for their sessions"
  on public.feedback for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = feedback.session_id
        and s.user_id = auth.uid()
    )
  );

-- Feedback may only be inserted for a session the caller owns.
-- (Was `with check (true)`, which let any authenticated user insert feedback
--  rows for arbitrary session ids.)
create policy "Users can create feedback for their own sessions"
  on public.feedback for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = feedback.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- waitlist
-- Anyone may join (anon + authenticated). No SELECT/UPDATE/DELETE policy
-- exists, so RLS denies all reads from the client — emails are only
-- accessible via the service role / SQL editor. Protects PII.
-- ============================================================
alter table public.waitlist enable row level security;

create policy "Anyone can join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);
