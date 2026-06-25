"""Vercel serverless entrypoint.

Exposes the FastAPI backend (in `backend/`) as a single Python function so the
whole app runs on Vercel: this function handles `/api/*`, while Vercel serves the
built SPA (`client/dist`) as static files. Routing lives in `vercel.json`.

The backend initializes lazily on the first request (see `_ensure_ready` in
`app.main`), because Vercel does not run FastAPI's ASGI startup lifespan. That
means the five `PERSONA_*_ID` env vars must be set (no startup provisioning), and
the waitlist needs `DB_URL` + `DB_SERVICE_KEY` (serverless disk is ephemeral).
"""

from __future__ import annotations

import sys
from pathlib import Path

# The app package lives in backend/; make it importable from this function.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402  (path set up above)

__all__ = ["app"]
