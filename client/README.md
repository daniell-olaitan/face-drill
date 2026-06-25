# VisaDrill - frontend

The Vite + React + TypeScript + Tailwind/shadcn SPA for VisaDrill. The marketing landing is a `motion`-animated page; the live interview renders the Tavus officer via the Daily SDK, with a built-in browser simulator as a fallback. The waitlist posts to the backend's `/api/waitlist`.

This client is served by the FastAPI backend as a single app. For the full picture - setup, architecture, Tavus features, env vars, and deploy - see the root [`README.md`](../README.md).

## Develop

Requires Node.js 20+.

```sh
npm install
npm run dev   # http://localhost:8080 (the Vite dev server proxies /api to the backend on :8787)
```

`npm run build` outputs `dist/`, which the backend serves in production. The app needs no frontend env vars; see `.env.example` for the one optional override.
