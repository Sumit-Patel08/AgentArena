# Nazar — Competitive Intelligence Agent
## Complete Backend & AI Agent Build Plan for Cursor

> Hand this file to Cursor as the project specification. It covers everything from
> account setup through deployment. Work through it phase by phase. Do not skip
> phases or reorder steps — each phase produces the foundation the next phase builds on.

---

## What We Are Building

Nazar is an AI-powered competitive intelligence agent built for HackBaroda 2026,
Problem Statement 3. It monitors competitor open-source projects and communities
across GitHub, Reddit, and Hacker News, stores every signal as persistent vector
memory using Hindsight, and uses that accumulated history to answer questions,
detect patterns, and recommend next actions — things that are impossible from a
one-shot search.

The core value proposition is memory: the agent gets smarter the longer it runs
because it connects today's competitor event to patterns from weeks ago. This is
the judging differentiator (memory accounts for 25% of scoring) and the demo story.

---

## Project Name and Branding

Product name: **Nazar** (means "watchful eye")
Tagline: "Know what your competitors did before your users tell you."

---

## Competitors We Are Tracking

These four are the seeded targets for the demo:

- Supabase — GitHub: supabase/supabase
- Appwrite — GitHub: appwrite/appwrite
- PocketBase — GitHub: pocketbase/pocketbase
- Convex — GitHub: get-convex/convex-backend

---

## Required Technologies (Hackathon Rules)

These are mandatory — judges check for them:

- **Hindsight** — the vector memory layer (required by hackathon)
  - Cloud UI: https://ui.hindsight.vectorize.io
  - Docs: https://hindsight.vectorize.io
  - GitHub: https://github.com/vectorize-io/hindsight
  - Promo code: MEMHACK6 (adds $50 credit — apply in billing after signup)
  - Join the Hindsight Community Slack for support questions

- **Groq** — the LLM provider (recommended by hackathon for speed and free tier)
  - Sign up at: https://groq.com
  - Primary model: qwen/qwen3-32b
  - Fallback model: openai/gpt-oss-120b
  - Important: all Groq calls must have try/except with one retry — the guidelines
    explicitly warn about function-calling errors

---

## Tech Stack

- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Memory / Vector store:** Hindsight Cloud (do NOT add Chroma, Pinecone, or any
  other vector database — Hindsight handles embedding and semantic retrieval)
- **LLM:** Groq (qwen/qwen3-32b)
- **Scheduler:** APScheduler (replaces any workflow tool — runs inside the FastAPI process)
- **HTTP client:** httpx (async) for all external API calls
- **Environment management:** python-dotenv
- **In-memory state:** Python list mirrored on every write (no database needed for
  the hackathon — Hindsight is the source of truth for semantic recall; the list
  makes dashboard reads instant)

---

## Project Folder Structure

```
nazar-backend/
├── main.py              # FastAPI app, CORS, lifespan, mounts all routers
├── memory.py            # Hindsight wrapper — write_memory() and recall()
├── collector.py         # GitHub, Reddit, HN fetchers — normalise to one shape
├── classifier.py        # Groq classification of each raw signal
├── recommender.py       # RAG loop: recall + Groq → recommendations and chat
├── scheduler.py         # APScheduler background job — runs collector on interval
├── seed.py              # One-off script: write 6 weeks of backdated history
├── routes.py            # All API endpoint definitions
├── models.py            # Pydantic models for every request and response shape
├── store.py             # In-memory list (signals_store) with thread-safe append
├── .env                 # Secret keys — never commit
├── .env.example         # Template for keys — commit this
├── requirements.txt     # All dependencies pinned
└── README.md            # Setup instructions
```

---

## The API Contract (Frontend-Facing — Do Not Change Field Names)

The frontend has already been built against these exact shapes. Every endpoint must
return these fields with these exact names. Adding extra fields is fine. Renaming
or removing fields breaks the frontend.

### GET /api/health
Returns a simple status object. Used by the frontend to confirm the backend is live.

### GET /api/signals
Returns a list of signal objects in reverse chronological order (newest first).
Each signal object has: id, competitor, signal_type, threat_score, summary, source,
source_url, date.

signal_type is one of: feature_release, community_growth, security_issue,
deprecation, announcement.

threat_score is an integer 1–10. 8–10 is high (red), 4–7 is medium (amber),
1–3 is low (green).

### GET /api/competitors
Returns a list of competitor summary objects. Each has: id, name, threat_score,
stars, stars_delta_week, last_signal_date, sparkline.

sparkline is a list of 6 integers representing threat scores across the last 6 weeks,
oldest first.

### GET /api/competitors/{id}
Returns the full detail object for one competitor. Has everything in the summary
plus: tracking_since, threat_over_time (list of date + score pairs), events (list
of signal objects), pattern_insight (string, 1–2 sentences synthesised from memory),
recommendations (list, same shape as /api/recommendations items).

### GET /api/metrics
Returns aggregate stats for the dashboard header. Has: total_signals, active_competitors,
high_threats_week, new_recommendations, and a deltas object with week-over-week
change for each metric.

### POST /api/chat
Request body: question (string), use_memory (boolean, default true).

When use_memory is true: recall top-8 memories from Hindsight, inject as context
into Groq, return answer with cited sources.

When use_memory is false: skip recall, answer blind from Groq only. This powers the
before/after demo toggle — the difference between these two modes is the visible proof
of memory value.

Response has: answer, memories_used (integer), sources (list of competitor + date +
threat_score objects).

### GET /api/recommendations
Returns a list of recommendation objects sorted by priority (high first). Each has:
id, priority (high/medium/low), title (the recommended action), reasoning (2–3
sentences citing the memory pattern that triggered it), competitor, impact (string),
source_signal_ids (list of signal ids that triggered this), status (open/implemented/
dismissed).

### POST /api/recommendations/{id}/status
Request body: status (implemented or dismissed). Updates the status of a
recommendation in the store. Returns the updated object.

### POST /api/digest
No request body. Recalls recent signals from Hindsight, generates and returns a
weekly briefing object with: top_threats (list of 3), top_opportunities (list of 2),
emerging_pattern (string).

### POST /api/collect/run
No request body. Fires the collector once immediately. Used for the live demo to
show real-time ingestion happening on stage. Returns: collected (integer),
new_signals (integer).

---

## The Memory Architecture (RAG)

This is how the intelligence works. Understand it before building — it is what the
judges are scoring.

**What RAG means in this project:**

1. Retrieve — when a user asks a question or the recommender runs, call Hindsight
   recall() with the query string. Hindsight does semantic vector search and returns
   the top-k most relevant memory entries from all stored history.

2. Augment — take those retrieved memories and insert them into the Groq prompt as
   context. The prompt tells Groq: "Here are the relevant signals from our memory.
   Use them to answer."

3. Generate — Groq reads the memories plus the question and produces an answer that
   cites specific signals. This is grounded, not hallucinated.

**Why Hindsight, not a separate vector DB:**

Hindsight handles embedding, storage, and retrieval internally. There is no Chroma,
Pinecone, LangChain, or LlamaIndex in this project. This is intentional — Hindsight
is the required hackathon sponsor tool and it does everything a standalone vector DB
would do. Saying "we used Hindsight as a production-grade memory layer instead of
building our own RAG stack" is a stronger pitch than the alternative.

**Two memory namespaces to use inside Hindsight:**

- events — each individual signal (one write per event)
- patterns — synthesised weekly observations (written by the digest endpoint)

Both go into the same Hindsight collection. Use metadata tags to filter by namespace
when recalling.

**What makes memory the star (25% of judging):**

The use_memory toggle in /api/chat is the demo moment. With memory off, the agent
gives a generic answer. With memory on, it says: "Supabase shipped vector search —
but the last two times they did an AI feature launch, pricing backlash followed within
two weeks. That's happening again now on Reddit. This is an opportunity." That
specific, pattern-aware, multi-week answer is only possible with accumulated memory.

---

## The Two Builders and What They Each Own

### B1 — API and Memory Owner
- main.py, memory.py, routes.py, models.py, store.py
- The Hindsight account and keys
- All endpoint definitions and response shapes
- The RAG chat endpoint
- Deployment

### B2 — Data and AI Agent Owner
- collector.py, classifier.py, recommender.py, scheduler.py, seed.py
- The Groq account and keys
- The collection pipeline (fetch → classify → write_memory)
- The recommendation generator
- The seed script and the demo question list

### The seam between them
B1 writes write_memory() and recall() in memory.py and shares those two functions.
B2 only ever touches Hindsight through those two functions — never calls the Hindsight
API directly. This lets both builders work in parallel without colliding.

---

---

# PHASE 0 — Accounts, Keys, and Research

**Goal:** Every credential exists, every API is understood, no builder is waiting on
someone else's setup. This phase is done entirely by hand. Cursor cannot click browser
buttons or reliably know a private vendor's latest API signatures.

**Time budget: 30–45 minutes. Do not skip this phase — every later phase fails without it.**

---

### Step 0.1 — B1: Create the Hindsight Cloud account

Go to https://ui.hindsight.vectorize.io and create an account using a team email.

After the account is created, navigate to the billing section and enter the promo
code MEMHACK6. This adds $50 in credit. The code is applied after registration,
not during signup — do not miss this step.

Create a new project/collection. Give it the name "nazar-ci-agent".

Copy three things into the shared team note: the API key, the collection ID, and the
base API URL shown in the dashboard.

Skim the Hindsight Python SDK quickstart page in the docs. What you need specifically:
the exact Python function name to write a memory entry, the exact function name to
do a semantic search/recall, what the metadata parameter looks like, and whether
there is an official Python package or if it uses raw HTTP. Write these signatures
down. This is the one step Cursor cannot do reliably because Hindsight's exact SDK
may post-date Cursor's training.

Join the Hindsight Community Slack. You want to already be a member before you hit
a wall.

---

### Step 0.2 — B2: Create the Groq account and get the API key

Go to https://console.groq.com and sign up.

Generate an API key. Copy it into the shared team note.

In the Groq model list, confirm that qwen/qwen3-32b is available to your account.
Also note openai/gpt-oss-120b as the fallback. Note whether there are per-minute or
per-day rate limits on the free tier — this affects how often you can run the
collector without throttling.

---

### Step 0.3 — B2: Lock the competitor list and data sources

Write down the final four competitors and what public sources exist for each:

For each competitor, note the GitHub owner/repo path, the subreddit name or search
term on Reddit, the Hacker News search term, and whether they have a public blog or
changelog RSS.

For GitHub: the public REST API needs no authentication for public repos, but is
rate-limited to 60 requests per hour unauthenticated. If you want more, generate a
free GitHub personal access token (read-only, public data). Decide now whether you
need one.

For Reddit: the public .json endpoint (append .json to any Reddit URL) works without
an API key for read access. Note this.

For Hacker News: the Algolia HN search API at http://hn.algolia.com/api is free and
unauthenticated. Note this.

---

### Step 0.4 — Both: Create the shared environment file template

One person creates the .env.example file right now, before any code exists, and
commits it. It should have placeholder values for:
HINDSIGHT_API_KEY, HINDSIGHT_COLLECTION_ID, HINDSIGHT_BASE_URL, GROQ_API_KEY,
GITHUB_TOKEN (optional), and ALLOWED_ORIGINS (the frontend Lovable URL).

Add .env to .gitignore now, before the first real commit.

---

### Phase 0 Gate

Before moving to Phase 1, confirm all of the following:
- Hindsight account exists, MEMHACK6 credit applied, collection created
- Hindsight write and recall signatures written down from real docs
- Hindsight Slack joined
- Groq key copied and qwen/qwen3-32b confirmed available
- Competitor list finalised with GitHub paths and Reddit/HN search terms
- .env.example committed and .env in .gitignore

---

---

# PHASE 1 — Project Skeleton and the Memory Seam

**Goal:** The FastAPI app runs. The Hindsight write and recall functions work and
are verified by a human looking at the Hindsight Cloud UI. Both builders can now
work in parallel because the memory seam is live.

**Time budget: 45–60 minutes.**

---

### Step 1.1 — B1: Create the repo and virtual environment

Create the Git repo and clone it locally. Create a Python 3.11+ virtual environment.
Install the base packages: fastapi, uvicorn, httpx, apscheduler, python-dotenv, and
the Groq Python SDK. Add the Hindsight Python SDK or note the HTTP approach from
the docs. Freeze a requirements.txt immediately.

Create the folder structure with all files as empty placeholders. Commit this skeleton
so B2 can see the file layout and know where their code will live.

---

### Step 1.2 — B1 using Cursor: Build main.py

Tell Cursor:

"Build the FastAPI app entry point in main.py. It should: load environment variables
from .env using python-dotenv; configure CORS middleware to allow the origins from
ALLOWED_ORIGINS env var (split by comma); mount the router from routes.py; start
APScheduler from scheduler.py on application startup using FastAPI's lifespan
context manager; and run uvicorn on port 8000 when executed directly."

Verify it starts without errors before moving on.

---

### Step 1.3 — B1 using Cursor: Build models.py

Tell Cursor:

"Create models.py with Pydantic models for every API request and response shape.
The models needed are:
- Signal: id, competitor, signal_type, threat_score (int 1-10), summary, source,
  source_url, date (ISO string)
- CompetitorSummary: id, name, threat_score, stars, stars_delta_week, last_signal_date,
  sparkline (list of 6 ints)
- CompetitorDetail: extends CompetitorSummary with tracking_since, threat_over_time
  (list of ThreatPoint), events (list of Signal), pattern_insight (str),
  recommendations (list of Recommendation)
- Recommendation: id, priority (enum: high/medium/low), title, reasoning, competitor,
  impact, source_signal_ids (list of str), status (enum: open/implemented/dismissed)
- ChatRequest: question (str), use_memory (bool, default True)
- ChatResponse: answer, memories_used (int), sources (list of SourceCitation)
- SourceCitation: competitor, date, threat_score
- Metrics: total_signals, active_competitors, high_threats_week, new_recommendations,
  deltas (dict)
- DigestResponse: top_threats (list), top_opportunities (list), emerging_pattern (str)"

---

### Step 1.4 — B1 using Cursor: Build memory.py

Before giving this to Cursor, paste the actual Hindsight SDK call signatures you
wrote down in Phase 0 into the Cursor context. Do not let Cursor guess them.

Tell Cursor:

"Build memory.py with exactly two public functions: write_memory(text: str, metadata:
dict) -> bool, and recall(query: str, k: int = 8) -> list. Use the Hindsight API
signatures I have provided above. Load HINDSIGHT_API_KEY, HINDSIGHT_COLLECTION_ID,
and HINDSIGHT_BASE_URL from environment variables. Both functions should handle
exceptions gracefully and log failures without crashing the app."

After Cursor writes this file, do a MANUAL verification: run a small test script
that calls write_memory() with a sample string, then open the Hindsight Cloud UI
and confirm the entry appears. Do not proceed to Phase 2 until you see it with
your own eyes.

---

### Step 1.5 — B1 using Cursor: Build store.py

Tell Cursor:

"Build store.py as a simple in-memory store for the backend. It holds a Python list
called signals_store (list of Signal dicts) and a list called recommendations_store
(list of Recommendation dicts). Provide thread-safe append and read functions using
a threading.Lock. Also provide helper functions: get_signals(competitor=None, limit=50)
and get_metrics() that computes the Metrics object from the current signals_store."

---

### Step 1.6 — B2 using Cursor: Build Groq health check and classifier shell

While B1 is doing steps 1.2–1.5, B2 works in parallel on classifier.py.

Tell Cursor:

"Build classifier.py with one public function: classify_signal(competitor: str,
raw_text: str, source_url: str) -> dict. It should call Groq using the groq Python
SDK with model qwen/qwen3-32b. The system prompt should instruct the model to return
only valid JSON with no markdown fences, containing: signal_type (one of:
feature_release, community_growth, security_issue, deprecation, announcement),
threat_score (integer 1-10), summary (one sentence), tags (list of keyword strings).
Wrap the entire Groq call in try/except. On failure or malformed JSON, retry once
with a simplified prompt. If both attempts fail, return a default classification with
threat_score 5 and signal_type announcement. Load GROQ_API_KEY from environment."

After Cursor writes this, B2 runs it manually against one hardcoded competitor string
to confirm Groq returns valid JSON before wiring it into the pipeline.

---

### Step 1.7 — B1: Build a skeleton routes.py

Tell Cursor:

"Build routes.py as a FastAPI APIRouter. Define all endpoints as stubs that return
placeholder data matching the exact response shapes from models.py. Endpoints needed:
GET /api/health, GET /api/signals, GET /api/competitors, GET /api/competitors/{id},
GET /api/metrics, POST /api/chat, GET /api/recommendations, POST
/api/recommendations/{id}/status, POST /api/digest, POST /api/collect/run.
Import from store.py and models.py. Do not implement any logic yet — each handler
returns a hardcoded minimal valid response."

This gives the frontend team a live URL with real routes immediately, even before
the logic is built.

---

### Phase 1 Gate

Before moving to Phase 2, confirm all of the following:
- uvicorn main:app starts without errors
- /api/health returns a response
- All routes exist and return placeholder data
- One memory entry visible in Hindsight Cloud UI from a manual test
- Groq classifier returns valid JSON from a manual test
- B2 has access to write_memory() and recall() from memory.py

---

---

# PHASE 2 — Collection Pipeline Into Memory

**Goal:** Real competitor events flow from the internet through the classifier and
into Hindsight memory. The seed script has run and six weeks of history exists.
The dashboard read endpoints return real data.

**Time budget: 60–90 minutes.**

---

### Step 2.1 — B2 using Cursor: Build collector.py

Tell Cursor:

"Build collector.py with a public function collect_all() that fetches signals for
all tracked competitors and returns a list of raw signal dicts.

For each competitor, fetch from three sources:

GitHub: call the GitHub REST API at /repos/{owner}/{repo}/releases to get recent
releases. Also fetch the current star count from /repos/{owner}/{repo}. Build a
raw signal from each release's tag name, body, and published_at date. Use GITHUB_TOKEN
from env if present, otherwise unauthenticated. Respect rate limits.

Reddit: fetch from the Pushshift or the Reddit public .json endpoint for the
relevant subreddit or search term. Get posts from the last 7 days mentioning the
competitor. Build a raw signal from the post title and selftext.

Hacker News: call the HN Algolia API at http://hn.algolia.com/api/v1/search with
the competitor name as the query, filtered to the last 7 days. Build raw signals
from story titles and points.

Each raw signal must be normalised to this common shape before returning: competitor
(string), raw_text (string), source_url (string), date (ISO string), source (one of:
github, reddit, hackernews)."

MANUAL check after Cursor writes this: run collect_all() directly in a test script
and print the output. Eyeball 10 raw signals to confirm the data is real and recent.

---

### Step 2.2 — B2 using Cursor: Wire collector → classifier → write_memory

Tell Cursor:

"Add a function run_collection_pipeline() to collector.py. It should: call
collect_all() to get raw signals; for each raw signal, call classify_signal() from
classifier.py; if the classified threat_score is 3 or higher, call write_memory()
from memory.py with the summary as the text and a metadata dict containing competitor,
signal_type, threat_score, source, source_url, and date; also append the full Signal
object to signals_store from store.py; skip signals already seen by checking source_url
against existing store entries; log how many signals were collected and how many were
new; return a summary dict with collected and new_signals counts."

After Cursor writes this, run the pipeline once end-to-end for one competitor.
Confirm the entry appears in Hindsight UI and in signals_store.

---

### Step 2.3 — B1 using Cursor: Implement the read endpoints

Tell Cursor:

"Implement the actual logic for these routes in routes.py using store.py:

GET /api/signals: return signals_store sorted newest first, support an optional
query parameter competitor to filter.

GET /api/competitors: for each tracked competitor, compute a CompetitorSummary from
store signals: id and name from a hardcoded list, threat_score as the max of the
last 3 signals, stars from the last GitHub fetch, stars_delta_week computed from
two fetches, last_signal_date from the most recent signal, sparkline as the average
threat score per week for the last 6 weeks.

GET /api/competitors/{id}: find all signals for this competitor, compute
CompetitorDetail. For pattern_insight, call recall() with '{competitor} recent
pattern' and return the top result summary as a one-sentence insight.

GET /api/metrics: call get_metrics() from store.py."

---

### Step 2.4 — B2: Write and run the seed script

This is the most important single step for the demo. Without six weeks of history in
Hindsight, the memory-on versus memory-off difference is invisible.

Tell Cursor to scaffold seed.py with a run_seed() function that calls write_memory()
in a loop.

Then MANUAL: you write the actual signal content. Draft at least 18–24 entries
spread across the last 6 weeks, covering all four competitors, with a mix of signal
types. Include at least two events that form a detectable pattern (for example:
Supabase ships an AI feature in week 1 and week 5, both followed by Reddit pricing
complaints). These patterns are what make the demo question list possible.

The dates must be real past ISO timestamps — not the current date. Use Python's
datetime with timedelta to compute backdated timestamps.

Run seed.py against the live Hindsight collection. Confirm in the Hindsight Cloud
UI that entries are appearing with correct dates. The Hindsight UI should show a
history that looks like six weeks of real monitoring.

---

### Step 2.5 — B2: Lock the demo question list

Now that seed data exists in Hindsight, manually test recall() with a variety of
question strings. Find 3–5 questions where the memory-on answer is dramatically
different from a blind answer.

The best demo questions are ones that require cross-week pattern awareness. Example:
"What is Supabase's most consistent strategic move over the last month?" or "Which
competitor is creating the most pressure on AI features right now?"

Write these exact questions in the project README. They are the demo script.

---

### Phase 2 Gate

Before moving to Phase 3, confirm all of the following:
- run_collection_pipeline() runs end-to-end and signals appear in Hindsight UI
- Seed script has run and 18+ historical entries exist in Hindsight
- /api/signals returns real data
- /api/competitors returns real data with sparklines
- /api/metrics returns real numbers
- 3–5 demo questions identified where memory makes a visible difference

---

---

# PHASE 3 — The AI Agent: RAG Chat and Recommendations

**Goal:** The intelligence layer is live. The chat endpoint answers questions using
memory. The recommendation engine tells users what to do next. The before/after
memory toggle works.

**This is the phase that wins the hackathon. Protect it at all costs.**

**Time budget: 60–90 minutes.**

---

### Step 3.1 — B1 using Cursor: Build the RAG chat endpoint

Tell Cursor:

"Implement POST /api/chat in routes.py.

When use_memory is true:
- Call recall(question, k=8) from memory.py
- Format the top-k results into a numbered context block: each entry as [N] DATE |
  COMPETITOR | Score: THREAT_SCORE/10 followed by the memory text
- Build a Groq chat completion with model qwen/qwen3-32b. System prompt: 'You are a
  competitive intelligence analyst. You have access to N weeks of historical memory
  about competitor activity. Answer the user question using the provided memory
  entries. Be specific and cite source numbers like [1][3]. Identify patterns across
  time when relevant.'
- User message: the context block followed by 'Question: {question}'
- Return ChatResponse with the answer text, memories_used count, and sources list
  built from the recall results

When use_memory is false:
- Call Groq with the same model but with no memory context
- System prompt: 'You are a competitive intelligence analyst. Answer based on general
  knowledge only.'
- Return ChatResponse with memories_used as 0 and empty sources"

After Cursor builds this, MANUAL test: ask the same demo question with use_memory
true and use_memory false. The two answers must be noticeably different. If they are
not, the seed data needs more specificity or the recall needs tuning.

---

### Step 3.2 — B1: Tune the RAG prompt

This step is done by a human, not Cursor. Run the top 3 demo questions through the
chat endpoint with memory on. Read the answers carefully.

Ask: does the answer cite specific signal numbers? Does it mention specific dates
and competitors? Does it mention a pattern across weeks? Does it sound like a
knowledgeable analyst or a generic chatbot?

If the answers feel generic, tighten the system prompt to demand specificity. If
answers cite memory entries that are not actually relevant, adjust k or add a
minimum relevance threshold. This tuning is the difference between a demo that
impresses and one that feels like any other chatbot.

---

### Step 3.3 — B2 using Cursor: Build the recommender

Tell Cursor:

"Build recommender.py with a function generate_recommendations() -> list.

It should:
- Call recall('high threat competitor activity recent', k=10) from memory.py
- Filter the results to those with threat_score 6 or higher in metadata
- Group them by competitor
- For each competitor with recent high-threat signals, build a Groq prompt:
  system: 'You are a competitive intelligence analyst. Based on the following
  competitor signals, generate a specific, actionable recommendation for what the
  product team should do in the next 48 hours. Return only valid JSON: title (the
  action in one sentence), reasoning (2-3 sentences citing the signals and why now),
  impact (one phrase describing expected outcome), priority (high/medium/low).'
  user: the formatted signals for this competitor
- Parse the JSON response and build a Recommendation object with a generated id,
  status open, the competitor name, and source_signal_ids from the recalled entries
- Return the list sorted by priority (high first)"

After Cursor builds this, run it manually and read the output recommendations.
They should sound like something a product manager would actually act on.

---

### Step 3.4 — B2 using Cursor: Wire recommendations into the routes

Tell Cursor:

"Implement GET /api/recommendations in routes.py. It should call
generate_recommendations() from recommender.py and cache the result for 5 minutes
so the page load is fast. Also implement POST /api/recommendations/{id}/status: find
the recommendation in recommendations_store by id and update its status field."

---

### Step 3.5 — B2 using Cursor: Build the digest endpoint

Tell Cursor:

"Implement POST /api/digest in routes.py. It should:
- Call recall('competitor threats and opportunities this week', k=15) from memory.py
- Send all retrieved memories to Groq with a prompt that asks for: top 3 threats
  (competitor name + one sentence), top 2 opportunities (one sentence each), and
  one emerging pattern (one sentence describing a multi-week trend)
- Return a DigestResponse"

---

### Step 3.6 — B1: Add the competitor detail pattern insight

Revisit the GET /api/competitors/{id} endpoint. The pattern_insight field should be
a genuine RAG-generated insight, not a stub.

Tell Cursor:

"In the /api/competitors/{id} handler, call recall('{competitor_name} pattern trend',
k=5). Take the top 3 results and build a one-call Groq completion that synthesises
them into a 1–2 sentence pattern observation. Store the result in pattern_insight.
Cache this per competitor for 10 minutes."

---

### Phase 3 Gate

Before moving to Phase 4, confirm all of the following:
- /api/chat with use_memory true returns a specific, cited, pattern-aware answer
- /api/chat with use_memory false returns a noticeably more generic answer
- The before/after difference is visible and convincing when shown side by side
- /api/recommendations returns at least 3 actionable recommendations
- Each recommendation's reasoning cites a specific memory pattern
- /api/digest returns a coherent weekly briefing
- All demo questions produce impressive answers

---

---

# PHASE 4 — Scheduler, Integration, and Deployment

**Goal:** The backend is deployed at a live URL. The frontend is calling real
endpoints. The scheduler runs automatically. A backup recording exists.

**Time budget: 45–60 minutes.**

---

### Step 4.1 — B2 using Cursor: Build scheduler.py

Tell Cursor:

"Build scheduler.py with a BackgroundScheduler from APScheduler. Create one job that
calls run_collection_pipeline() from collector.py on an interval trigger of every
6 hours. Export a start_scheduler() function that starts the scheduler with a
coalesce=True, max_instances=1 configuration so overlapping runs are prevented.
The scheduler should be started from the FastAPI lifespan context in main.py."

After Cursor builds this, have it also implement POST /api/collect/run in routes.py
to call run_collection_pipeline() directly and return the summary. This is the
button that fires a live collection on stage during the demo.

---

### Step 4.2 — B1: Deploy the backend

Choose a free hosting option: Render (free web service) or Railway (free tier) are
both suitable. For the demo it is also acceptable to run locally and expose via
ngrok tunnel.

Deployment checklist:
- Set all environment variables in the host dashboard (HINDSIGHT_API_KEY,
  HINDSIGHT_COLLECTION_ID, HINDSIGHT_BASE_URL, GROQ_API_KEY, ALLOWED_ORIGINS)
- ALLOWED_ORIGINS must include the Lovable deployed frontend URL and localhost:5173
- Confirm the /api/health endpoint returns 200 at the live URL
- Share the live base URL with the frontend pair
- Confirm CORS is allowing requests from the Lovable origin (open browser devtools
  and check for CORS errors when the frontend loads)

---

### Step 4.3 — Both: Full integration test with the frontend

Both backend people join the frontend pair. Load the deployed Nazar dashboard in a
browser.

Check every page:
- Dashboard overview: metric cards show real numbers, signal timeline shows real
  events, competitor cards render with real threat scores and sparklines
- Competitor detail: threat-over-time chart has data, event timeline is populated,
  pattern insight is generated, recommendations appear
- Recommendations / Action Center: cards render with priority badges, reasoning
  is readable, the implement/dismiss buttons update status
- Chat panel: ask a demo question, confirm the answer cites memory sources, toggle
  use_memory off and confirm the answer degrades to generic

Fix any field name mismatches found here. This is the only acceptable reason to
change an API response shape — and both sides must update simultaneously.

---

### Step 4.4 — B2: Prepare and deliver the demo question list

Write out the exact 60-second demo script and the 3 judge questions with answers in
the project README. The demo script should follow this structure:

Opening (10 seconds): "Nazar watches competitor activity across GitHub, Reddit, and
Hacker News around the clock. It stores every signal as memory — and unlike a
one-shot search, it gets smarter the longer it runs."

Show the timeline (10 seconds): scroll the signal feed, point to the threat badges,
show the competitor cards with sparklines. "Six weeks of history, tracked and stored
automatically."

Live query with memory on (15 seconds): type the strongest demo question into the
chat panel. Read the answer aloud, emphasise that it cites specific signals and
detects a pattern across weeks.

The before/after moment (15 seconds): toggle use_memory off, ask the same question.
Read the generic answer. Toggle memory back on. "Without memory, that's all you get.
With six weeks of stored history, Nazar tells you what the pattern means and what
to do about it."

Close (10 seconds): point to the Recommendations page. "Every high-threat signal
generates a ranked, reasoned next action. This is what replaces three hours of
manual competitor monitoring every week."

---

### Step 4.5 — Both: Record the backup demo video

Screen record the entire demo flow while the backend is live and all data is fresh.
This recording is presented if wifi, rate limits, or Hindsight connectivity fails
during the actual demo. Non-negotiable.

---

### Step 4.6 — B1: Final checks before presenting

- Hindsight Cloud UI tab is open in a browser during the demo (shows memory visually)
- /api/collect/run button works on the live dashboard
- Groq rate limits are not close to threshold (check usage dashboard)
- All four competitors have recent signals in the timeline
- Recommendation page has at least 5 items
- Memory on/off toggle visibly changes the chat answer

---

### Phase 4 Gate

Before presenting, confirm all of the following:
- Backend deployed at a live public URL
- Frontend loading real data from the live backend with no console errors
- Full 60-second demo rehearsed at least twice with a timer
- Backup screen recording saved offline
- Hindsight Cloud UI tab open and showing real memory entries
- README has setup instructions, demo questions, and judge Q&A answers

---

---

# Cursor Usage Guidelines

## What to always do before prompting Cursor

Open the relevant context into the Cursor conversation before writing any prompt:
- The API contract section of this file (paste the endpoint you are implementing)
- The Pydantic models from models.py (paste the relevant model)
- The real Hindsight SDK call signatures from Phase 0 research

Cursor writes accurate code when it can see the exact field names, types, and
function signatures. It writes incorrect code when it must guess.

## Prompt one file at a time

Never ask Cursor to "build the backend." Ask it to implement one specific function
or one specific endpoint. Run and verify before moving to the next.

## When Cursor makes an error

Paste the full traceback back into Cursor. Do not ask it to "fix the error" without
the traceback. If the error persists after two attempts, paste the traceback here
into Claude for diagnosis.

## Things Cursor cannot do — do these manually

- Create accounts, navigate browser UIs, or apply promo codes
- Know the real Hindsight SDK signatures (training data may be outdated)
- Judge whether the RAG chat answer is actually impressive (that requires a human)
- Write the seed script signal content (the pattern stories must be human-designed)
- Find the best demo questions (requires testing and human judgment)
- Record the backup video

---

---

# Judge Questions and Answers

Prepare these verbatim.

**"How does the memory work?"**
Every 6 hours, the collector fetches signals from GitHub, Reddit, and Hacker News.
Each signal is sent through a Groq classifier that extracts signal type, threat score,
and a one-sentence summary. That summary is written to Hindsight, which embeds it as
a vector and stores it with metadata tags. When you ask the chat a question, we do a
semantic search across all stored memories — that is the retrieval step. The top 8
most relevant results go into the Groq prompt as context — that is augmentation. Groq
generates a grounded answer citing those specific signals — that is generation.
Hindsight is the vector store that makes the whole loop possible. This is RAG, running
on a purpose-built memory layer instead of a hand-assembled stack.

**"Why is memory important here?"**
Without memory, every competitor analysis starts from zero. You get a snapshot, not
a story. With six weeks of stored signals, Nazar noticed that Supabase had shipped
three AI-adjacent features in rapid succession — not from a single search, but by
connecting events across weeks. It also noticed that pricing backlash on Reddit
followed each of those launches. That cross-week pattern is an opportunity, not just
a threat. No one-shot search catches that.

**"What is the business value?"**
Product teams and open-source maintainers spend four to six hours a week manually
checking competitor repos, forums, and social channels. Nazar does it continuously,
stores everything, and surfaces the insights that matter — including a ranked list of
what to do next. That is two hundred hours a year returned to the team, plus the
strategic advantage of knowing before your users do.

---

---

# What Not to Build

Avoid spending time on anything in this list — none of it affects the judging score
and all of it burns time you do not have:

- User authentication or login
- Multi-user support or teams
- A database (Postgres, SQLite, MongoDB) — the in-memory list is enough
- Automated email or Slack notifications
- A separate vector database (Chroma, Pinecone, etc.) — Hindsight is your vector DB
- A complex admin panel
- Unit tests (write them after the hackathon)
- Docker or containerisation
- API versioning

If time is short, cut in this order: digest endpoint, scheduler (keep manual trigger),
then sparklines computation, then competitor detail pattern insight. The three things
that must never be cut: the memory wrapper, the seed data, and the RAG chat with
the memory on/off toggle.

---

*This document is the single source of truth for the Nazar backend build.*
*Both backend builders should have it open throughout the hackathon.*
