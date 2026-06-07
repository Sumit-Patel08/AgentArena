# Agent Arena Backend

AI-powered competitive intelligence backend for **HackBaroda 2026** (Problem Statement 3).

> Formerly "Nazar" — rebranded to **Agent Arena**.  
> Tagline: *Know what your competitors did before your users tell you.*

## Quick Start

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
# Edit .env with your API keys (see below)

uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `HINDSIGHT_API_KEY` | Yes | [Hindsight Cloud](https://ui.hindsight.vectorize.io) → API keys |
| `HINDSIGHT_COLLECTION_ID` | Yes | Bank ID in Hindsight (use `agent-arena-ci`) |
| `HINDSIGHT_BASE_URL` | Yes | Dashboard API URL (usually `https://api.hindsight.vectorize.io`) |
| `GROQ_API_KEY` | Yes | [Groq Console](https://console.groq.com) |
| `GITHUB_TOKEN` | Optional | [GitHub PAT](https://github.com/settings/tokens) — read-only, public repos |
| `ALLOWED_ORIGINS` | Yes | Your frontend URL(s), comma-separated |

Apply promo code **MEMHACK6** in Hindsight billing for $50 credit.

## Verify Hindsight (Phase 1 Gate)

```bash
python scripts/test_memory.py
```

Then open the Hindsight Cloud UI and confirm the test entry appears.

## Tracked Competitors

| ID | GitHub | Reddit | HN Search |
|----|--------|--------|-----------|
| supabase | supabase/supabase | r/Supabase | Supabase |
| appwrite | appwrite/appwrite | r/appwrite | Appwrite |
| pocketbase | pocketbase/pocketbase | r/pocketbase | PocketBase |
| convex | get-convex/convex-backend | r/ConvexDev | Convex |

## API Endpoints

All routes are under `/api`:

- `GET /api/health`
- `GET /api/signals`
- `GET /api/competitors`
- `GET /api/competitors/{id}`
- `GET /api/metrics`
- `POST /api/chat`
- `GET /api/recommendations`
- `POST /api/recommendations/{id}/status`
- `POST /api/digest`
- `POST /api/collect/run`

## Build Phases

See `nazar-backend-plan.md` for the full build plan. Current status:

- [x] Phase 0 — `.env.example`, `.gitignore`, competitor config
- [x] Phase 1 — Skeleton (models, store, memory seam, stub routes)
- [ ] Phase 2 — Collection pipeline + seed data
- [ ] Phase 3 — RAG chat + recommendations
- [ ] Phase 4 — Deployment
