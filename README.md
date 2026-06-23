# VisaDrill

Practice high-stakes U.S. visa interviews with a hyperreal AI consular officer, powered by [Tavus CVI](https://docs.tavus.io) (Conversational Video Interface).

Interview tracks (the categories the frontend offers):

- **Visitor (B1/B2)** - tourism or short business
- **Student (F-1)**
- **Work (H-1B)**
- **Exchange (J-1)**

There's also a general "any" practice mode. (A USCIS **N-400 citizenship** officer exists in the backend but isn't exposed in the UI.)

> **Single service**: the FastAPI backend serves the real VisaDrill SPA (the
> `jedidiah-oladele/facedrill` Vite/React/shadcn app, in `client/`) and the
> Tavus-backed `/api`. The live officer is rendered with the **Daily SDK** (our own
> in-call UI). If the avatar can't start, a zero-config **browser simulator** takes over.

## How an interview works

1. **Practice** page → pick a visa category.
2. **Optional pre-interview form** ("DS-160-lite": purpose, funding, employer/school, ties, prior travel). Skippable; if filled, the answers are sent to the officer as context so it interviews you on your real situation. The Start/Skip tap also unlocks iOS audio.
3. **Live interview** (`/interview`, full-screen): the Tavus officer rendered via the Daily SDK - officer video fills the card, your self-view is a PiP, with **mic/camera** controls, **live captions (CC toggle)**, a **countdown that auto-ends**, and a **REC** indicator when recording is on.
4. **Debrief** (`/debrief`): a scored report (below).

## Per-category officers

Each category maps 1:1 to a **dedicated Tavus persona** with its own grounded prompt and objectives (`backend/app/personas.py`; `CATEGORY_TO_VISA` in `backend/app/main.py`):

| Category | Officer focus |
|---|---|
| Visitor (B1/B2) | Purpose, itinerary, funding, **ties/return intent** (INA 214(b)) |
| Student (F-1) | School/program, funding, why-the-U.S., return intent |
| Work (H-1B) | Employer, specialty occupation, degree, salary - **dual-intent** (no ties/return pressure) |
| Exchange (J-1) | Program + sponsor (DS-2019), funding, ties, **212(e)** |
| `any` | Uses the Visitor officer |
| N-400 (citizenship) | Exists in the backend; not surfaced in the UI |

## Scored debrief

For a live interview, `/debrief` (`LiveDebrief.tsx`) fetches `/api/report/:id` and shows:

- a **verdict** + **approval-readiness score (0-100)**, with **progress vs. your last attempt**,
- **per-area scores** (purpose, ties, finances, …),
- **per-answer notes** (what landed / what to tighten) - computed by reusing the simulator's heuristic engine on the transcript; **unanswered questions count as zero**, so going silent tanks the score,
- the officer's **demeanor read** (Raven perception) and a **recording link** when available.

The browser simulator keeps its own local heuristic debrief.

## Tavus features used

| # | Feature | Notes |
|---|---|---|
| 1 | **Perception (Raven)** | Live awareness cues + end-of-call demeanor analysis |
| 2 | **Objectives** | A per-category objective set drives flow + structured output |
| 3 | **Recording** | Optional; copied to your own Azure/S3. Off by default |
| 4 | **Knowledge base (RAG)** | USCIS civics doc - attached to the **N-400** officer only (not the visa tracks) |
| 5 | **Guardrails** | Never coach/break character, block real PII, stay on topic |
| 6 | **Flow + STT** | Turn-taking, interruptibility, **idle re-engagement**, hotwords |
| 7 | **Memories** | Implemented (`memory_stores`) but **not currently wired** into the live embed flow |
| 8 | **Language** | Defaults to English; not yet a UI picker |
| 9 | **Pronunciation dictionary** | Correct TTS of "USCIS", "N-400", etc. |

Every feature degrades gracefully: if a Tavus resource fails to provision at startup, the backend logs a warning and boots without it.

## Models

Three Tavus models are in play: **Phoenix-4** renders the replica, **Raven-1** is perception, **Sparrow-1** is turn-taking. Phoenix comes from the stock replica; Raven/Sparrow are set in the persona layers.

## Stack

| Layer | Technology |
|---|---|
| Frontend (`client/`) | Vite + React 18 + TypeScript + Tailwind + shadcn/ui + `@daily-co/daily-js`; optional Supabase waitlist |
| Backend (`backend/`) | Python 3.11+ + FastAPI + httpx + Pydantic |
| Avatar | Tavus CVI: a dedicated Persona + stock Replica per category |

## Architecture

```
Browser (SPA served by FastAPI)              FastAPI (:8787)            Tavus API
  /interview (Live)
    │  POST /api/liveavatar/embed {category, applicant_context?} ─► POST /v2/conversations ─►
    │  ◄── { url, conversation_id, max_seconds, recording } ◄──────── ◄── conversation_url ──
    ▼
  Daily SDK joins the room  ◄════ WebRTC ════►  Tavus officer joins and speaks
  (officer video + self-view PiP + captions + countdown)
    │
  End / time up ─► /debrief ─► GET /api/report/:id ─► scored debrief + demeanor read
```

On startup the backend verifies the key, then provisions one dedicated **Persona** per
visa type (`backend/app/personas.py`), each bound to a stock **Replica** and attached
to its guardrails/objectives, caching ids by content hash. Set the `PERSONA_*_ID` env
vars (from `scripts/provision.py`) to skip provisioning on ephemeral hosts.

## Prerequisites

- Node.js 20+ (the client build needs Node 20.19+/22 for Vite)
- Python 3.11+
- A Tavus API key with credit (from [platform.tavus.io](https://platform.tavus.io))

## Setup

1. **Configure your API key.** Copy `.env.example` to `.env` at the project root and set `TAVUS_API_KEY=...`.
2. **Install dependencies.**

   ```sh
   python3 -m venv backend/.venv && source backend/.venv/bin/activate
   pip install -r backend/requirements.txt
   npm install && npm --prefix client install
   ```

3. **Run both dev servers** (backend `:8787`, frontend `:8080`):

   ```sh
   npm run dev
   ```

   Vite proxies `/api` to the backend. (If `uvicorn` isn't on your PATH, run it yourself:
   `cd backend && uvicorn app.main:app --reload --port 8787`.)

4. **Open** [http://localhost:8080](http://localhost:8080) → Practice → pick a category → Start, and grant mic + camera. (`/interview?mode=sim` forces the offline simulator.) Note: live interviews spend Tavus minutes even locally; tune length with `INTERVIEW_DURATION_SECONDS`.

## Key env vars

| Var | Purpose |
|---|---|
| `TAVUS_API_KEY` | Required |
| `TAVUS_REPLICA_ID` | Stock replica (the officer's face); list with `GET /api/replicas` |
| `INTERVIEW_DURATION_SECONDS` | Visible interview length / auto-end (default 240) |
| `PERSONA_*_ID` (×5) | Pre-provisioned persona ids; set all to skip startup provisioning |
| `ENABLE_RECORDING`, `RECORDING_AZURE_*` / `RECORDING_*` (S3) | Optional recording |
| `DEFAULT_LANGUAGE`, `CIVICS_DOCUMENT_URL`, `PUBLIC_BASE_URL` | Optional |
| `VITE_SUPABASE_*` | Optional waitlist (build-time) |

Pre-provision once and pin the ids so cold starts don't recreate resources:

```sh
python backend/scripts/provision.py   # prints the five PERSONA_*_ID values
```

## Verify which features your Tavus account supports

```sh
python backend/scripts/verify_tavus.py                 # creates+deletes a probe of each resource
python backend/scripts/verify_tavus.py --skip-conversation
```

Conversation probes use `test_mode`, so they don't bill minutes. Prints `OK`/`FAIL` per feature (#1-#9).

## Deploy (free, single service on Render)

The `Dockerfile` builds the Vite frontend and serves it from FastAPI, so one free Render web service hosts everything. Its public URL auto-becomes the Tavus webhook base (`RENDER_EXTERNAL_URL`), so no ngrok is needed.

1. Push the repo to GitHub.
2. Render → **New → Blueprint** (reads `render.yaml`), or **Web Service → Docker**.
3. Set the `sync: false` env vars in the dashboard (`TAVUS_API_KEY`, `PERSONA_*_ID`, recording vars, etc.).
4. Deploy → live at `https://<name>.onrender.com`; `/api/health` is the health check, SPA at `/`.

Free-tier: spins down after ~15 min idle (~30-60s cold start). With `PERSONA_*_ID` set, startup skips provisioning (no duplicate resources).

## Recording storage (optional)

Tavus copies recordings into **your own** cloud via federated identity - **Azure Blob** or **AWS S3** (Cloudflare R2 is *not* supported; S3 mode needs AWS IAM AssumeRole). Off by default; the debrief's transcript + demeanor work without it.

- **Azure:** `az login` then `STORAGE_ACCOUNT=… RESOURCE_GROUP=… WORKSPACE_ID=<your Tavus Workspace ID> ./infra/azure/setup-recording.sh` (the federated-credential subject is your Tavus Workspace ID, so each Tavus account needs its own).
- **AWS:** `BUCKET=… REGION=… ./infra/aws/setup-recording.sh`

Recording only happens on a real interview. To see the recording link in the debrief, set `PUBLIC_BASE_URL` so Tavus can POST the `recording_ready` webhook.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Key status, active replica, persona ids (one per visa type) |
| GET | `/api/replicas` | List stock replicas |
| POST | `/api/liveavatar/embed` | `{category, applicant_context?}` -> `{url, conversation_id, max_seconds, recording}` |
| POST | `/api/start-session` | `{visa_type, language?, applicant_id?, conversational_context?}` -> `{conversation_url, conversation_id}` |
| POST | `/api/end-session` | `{conversation_id}` -> ends the conversation |
| GET | `/api/report/{conversation_id}` | Transcript + demeanor analysis + recording url |
| POST | `/api/webhook` | Receives Tavus events (transcript, perception, recording-ready) |

`GET /api/health` returns five persona ids: `b1b2`, `f1`, `h1b`, `j1`, `n400`.

## Code quality & tests

```sh
cd backend
pip install -r requirements-dev.txt
ruff check app/ tests/ scripts/
mypy app/ tests/ scripts/
pytest -q     # offline; mocks the Tavus client
```

The backend follows the repo Python conventions: full type hints, modern union syntax, Pydantic models, and the `logging` module (no `print`).

## Troubleshooting

- **"TAVUS_API_KEY is not set"** - create `.env` at the project root with a non-empty key.
- **Startup 401** - the Tavus key is invalid or revoked.
- **`embed`/`start-session` returns 502** - usually out of credits or an invalid `replica_id`/persona; the Tavus error body is logged.
- **Officer never appears → drops to the simulator** - the embed/Daily join failed; check the browser console and the backend log for the `POST /v2/conversations` response. A "Live officer unavailable" notice appears bottom-left.
- **No audio on iPhone** - tap the "Tap to hear the officer" button; iOS blocks autoplay until a gesture.
- **Idle calls billing** - conversations set `max_call_duration` + participant timeouts, and the client auto-ends at the countdown.

## Security note

The Tavus API key is **server-side only** - it lives in `.env` and is read by the FastAPI backend. The browser only talks to our own `/api/*` routes.
