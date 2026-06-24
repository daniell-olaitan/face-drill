# VisaDrill

**Practice the visa interview before it counts.**

A US visa interview lasts two to five minutes, at a window, behind glass. The officer is testing one thing — whether you'll come back. VisaDrill is an AI-powered rehearsal of that window: a consular officer that asks real, adaptive questions under pressure, then gives an honest, scored verdict on where you'd stand.

The product is built around a single legal reality — **INA §214(b)**, the clause that refuses more nonimmigrant applicants than any other. It presumes immigrant intent; the burden is on the applicant to prove otherwise. Every question and every score maps to the four pillars an officer weighs: **ties, purpose, funds, credibility.**

---

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Tavus video officer (mock vs. live)](#tavus-video-officer-mock-vs-live)
- [AI feedback](#ai-feedback)
- [Security model](#security-model)
- [Design system](#design-system)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Roadmap / known follow-ups](#roadmap--known-follow-ups)

---

## Tech stack

| Layer        | Choice |
|--------------|--------|
| Framework    | **Next.js 16** (App Router) + **React 19**, TypeScript |
| Styling      | **Tailwind CSS v4** (`@theme` tokens), CVA for variants |
| Animation    | **Motion** (`motion/react`) + **Lenis** smooth scroll |
| Auth & DB    | **Supabase** (Postgres + Auth + Row-Level Security) via `@supabase/ssr` |
| AI feedback  | **Anthropic API** (`claude-sonnet-4-6`), with a built-in mock fallback |
| Video officer| **Tavus CVI** (Conversational Video Interface) — mocked by default |
| Fonts        | **Nexa** (display, local) + **Mulish** (body, Google) |
| UI primitives| Radix UI, `lucide-react`, `sonner` (toasts) |

> **Next 16 conventions used here** (they differ from older Next): middleware lives in **`proxy.ts`** (exporting `proxy`), and dynamic route handlers receive **async params** via `RouteContext<"/api/...">`. See `AGENTS.md`.

## Architecture

```
Browser ──► Next.js App Router ──► proxy.ts (session refresh + route guard)
                │
                ├─ Server Components ──► Supabase (RLS-scoped reads)
                │
                └─ Route Handlers (/api/*) ──► Supabase (RLS, anon key + user cookies)
                                          ├──► Anthropic API (feedback scoring)
                                          └──► Tavus API (live video conversation)
```

- **Every request** passes through `proxy.ts`, which refreshes the Supabase session and redirects unauthenticated users away from protected routes (`/dashboard`, `/onboarding`, `/interview`, `/feedback`).
- **All data access uses the anon/publishable key** bound to the signed-in user's cookies — never the service-role key. Postgres **Row-Level Security** is the real authorization boundary; API routes add `requireUser()` + ownership checks as defense in depth.
- **Secrets** (`TAVUS_API_KEY`, `ANTHROPIC_API_KEY`) are server-only — never exposed to the browser. Only `NEXT_PUBLIC_*` values reach the client.

## Project structure

```
app/
  (auth)/            Sign-in / sign-up (+ AuthLayout)
  (app)/             Authenticated app: dashboard, onboarding, interview, feedback
  api/               Route handlers
    auth/callback/   Supabase email-confirmation code exchange
    sessions/        CRUD for practice sessions, messages, feedback
    tavus/           Create + end a live Tavus conversation
    waitlist/        Public pre-launch email capture
    profile/         Read/update own profile
  demo/              Public, immersive demo interview
  founders/          Marketing — team page
  page.tsx           Marketing homepage ("The Window")
components/
  home/              Hero, JourneyTrail, TwoWindows, PageCanvas (gradient backdrop), waitlist
  interview/         Live Tavus embed
  feedback/          Animated verdict reveal
  layout/            Navbar (marketing + app), Footer
  ui/                Shared kit: Button, Input, Select, Textarea, Progress, Reveal, …
lib/
  supabase/          server / client / middleware factories
  ai/prompts.ts      §214(b) feedback prompt + mock feedback
  tavus/mock.ts      Mock conversation + scripted questions (zero cost)
  visa-profiles/     Per-visa config (US B1/B2, US F-1, UK Student): questions, context fields, scoring
types/               Shared TypeScript types
supabase/            schema.sql + rls.sql (run these in the Supabase SQL editor)
```

## Getting started

**Prerequisites:** Node 20+, a Supabase project. (Anthropic + Tavus keys are optional — the app runs fully on mocks without them.)

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                          # http://localhost:3000
```

> `.env.local` is git-ignored — never commit it.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/publishable key (safe for the browser) |
| `ANTHROPIC_API_KEY` | ⬜ optional | Real AI feedback. Without it, feedback uses a built-in mock |
| `NEXT_PUBLIC_TAVUS_MOCK` | ✅ | `true` = scripted mock interview (default, free). `false` = live video officer |
| `TAVUS_API_KEY` | only if live | Tavus API key (server-only) |
| `TAVUS_REPLICA_ID` | only if live | Tavus replica (the officer's face/voice) |
| `TAVUS_PERSONA_ID` | only if live | Tavus persona (the officer's behavior) |

**Never** put the Supabase service-role key or any Tavus/Anthropic key behind a `NEXT_PUBLIC_` prefix.

## Database setup

In the Supabase SQL editor, run in order:

1. **`supabase/schema.sql`** — tables (`profiles`, `sessions`, `messages`, `feedback`, `waitlist`), the `handle_new_user` trigger (creates a profile + copies `full_name` on signup), and `updated_at` triggers.
2. **`supabase/rls.sql`** — enables Row-Level Security and the access policies.

| Table | Client access under RLS |
|-------|--------------------------|
| `profiles` | Read/update **your own** row only |
| `sessions` | Read/insert/update **your own** rows |
| `messages` | Scoped to sessions **you own** |
| `feedback` | Read your own; insert only for a session **you own** |
| `waitlist` | **Insert only** (anon) — no client read, so emails are never exposed |

Also enable **Email** auth in Supabase → Authentication → Providers, and set the redirect URL to `<your-domain>/api/auth/callback`.

## Tavus video officer (mock vs. live)

By default (`NEXT_PUBLIC_TAVUS_MOCK=true`) the interview runs a **scripted mock** — no Tavus calls, no cost. This is the right setting for all routine development.

To run the **real video officer**, set `NEXT_PUBLIC_TAVUS_MOCK=false` and provide the three `TAVUS_*` vars, then restart the dev server. Guards that protect trial minutes:

- `max_call_duration` cap on every conversation.
- **Explicit termination**: clicking *End Interview* — and a tab-close / navigate-away `sendBeacon` — call `POST /api/tavus/conversation/end` so billing stops immediately instead of running to the cap.

> Live interviews currently render the real officer but score with **mock feedback** — capturing the Tavus transcript into the scoring pipeline is a tracked follow-up.

## AI feedback

When `ANTHROPIC_API_KEY` is set and a session has enough exchanges, `POST /api/sessions/[id]/feedback` builds a §214(b)-framed prompt from the transcript and calls Claude (`claude-sonnet-4-6`), returning a scored report (overall score, verdict, four-pillar breakdown, strengths, improvements, red flags, per-answer notes). Without a key — or on any API error — it falls back to a deterministic **mock report**, so the flow always completes.

## Security model

- **AuthN:** Supabase email auth; sessions validated server-side with `auth.getUser()` (not just cookie presence).
- **AuthZ:** Postgres RLS on every table + per-route `requireUser()` and ownership checks. PATCH routes **whitelist** updatable fields (no mass assignment — e.g. a user can't change their own `tier` or `sessions_limit`).
- **Secrets:** server-only; never shipped to the client.
- **Headers** (`next.config.ts`): `Content-Security-Policy`, HSTS, `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`.
- **Redirects:** post-auth redirects are restricted to internal paths (no open-redirect).
- **Input:** request bodies are validated; message length is capped; the waitlist validates email format and relies on a unique constraint.

## Design system

Editorial, human-designed feel — not "AI-generated." Light app pages, dark cinematic marketing beats. Tokens live in `app/globals.css` (`@theme`): `ink` text scale, `brand` blue, `surface`/`border` neutrals, `xs–2xl` radii. The marketing pages sit on one continuous **gradient canvas** (`PageCanvas`) with scroll-driven parallax color blooms and a fine grain for depth; section reveals use `Reveal`/`RevealGroup`. Prefer **canonical Tailwind classes** over arbitrary bracket values.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
npx tsc --noEmit # type-check
```

## Deployment

Deploy on **Vercel** (or any Node host). Set every environment variable from the table above in the host's dashboard. Production is served over **HTTPS**, which satisfies the secure-context requirement for camera/microphone in the live interview. Keep `NEXT_PUBLIC_TAVUS_MOCK=false` only when you intend to spend Tavus minutes.

## Roadmap / known follow-ups

- **Tavus Phase B:** capture the live transcript (API/webhook) so real interviews are scored by the AI, not the mock; create a dedicated consular-officer persona; consider `@daily-co/daily-js` for join/leave events.
- **Rate limiting** on public endpoints (waitlist) — e.g. Upstash.
- **Atomic** `sessions_used` increment to fully close the free-tier race window.
- For the live interview, the `Permissions-Policy` must delegate `camera`/`microphone` to the Tavus/Daily iframe origin.

---

Built for applicants who refuse to walk in cold.
