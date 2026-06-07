"""Seed 6 weeks of backdated history into Hindsight."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import asyncio

from memory import write_memory_async
from models import Signal, SignalType
from store import append_signal, source_url_exists

SOURCE_DISPLAY = {
    "github": "GitHub",
    "reddit": "Reddit",
    "hackernews": "Hacker News",
}

SEED_ENTRIES: list[dict] = [
    # Week 1 — Supabase AI feature + pricing backlash pattern starts
    {
        "competitor": "supabase",
        "signal_type": "feature_release",
        "threat_score": 8,
        "summary": "Supabase ships AI assistant in dashboard preview, targeting no-code builders.",
        "source": "github",
        "source_url": "https://github.com/supabase/supabase/releases/tag/seed-w1-ai",
        "days_ago": 41,
    },
    {
        "competitor": "supabase",
        "signal_type": "community_growth",
        "threat_score": 6,
        "summary": "Reddit thread: developers praise Supabase AI preview but question pricing tiers.",
        "source": "reddit",
        "source_url": "https://reddit.com/r/Supabase/comments/seed-w1-pricing",
        "days_ago": 39,
    },
    {
        "competitor": "appwrite",
        "signal_type": "feature_release",
        "threat_score": 5,
        "summary": "Appwrite 1.5 adds improved Flutter SDK and offline sync helpers.",
        "source": "github",
        "source_url": "https://github.com/appwrite/appwrite/releases/tag/seed-w1",
        "days_ago": 40,
    },
    {
        "competitor": "pocketbase",
        "signal_type": "announcement",
        "threat_score": 4,
        "summary": "PocketBase maintainer posts roadmap emphasizing simplicity over enterprise features.",
        "source": "hackernews",
        "source_url": "https://news.ycombinator.com/item?id=seed-w1-pb",
        "days_ago": 38,
    },
    # Week 2
    {
        "competitor": "convex",
        "signal_type": "feature_release",
        "threat_score": 7,
        "summary": "Convex launches vector search component for AI-native TypeScript apps.",
        "source": "github",
        "source_url": "https://github.com/get-convex/convex-backend/releases/tag/seed-w2-vector",
        "days_ago": 34,
    },
    {
        "competitor": "supabase",
        "signal_type": "community_growth",
        "threat_score": 5,
        "summary": "Supabase Discord grows 15% — heavy discussion around AI feature requests.",
        "source": "reddit",
        "source_url": "https://reddit.com/r/Supabase/comments/seed-w2-discord",
        "days_ago": 33,
    },
    {
        "competitor": "appwrite",
        "signal_type": "community_growth",
        "threat_score": 4,
        "summary": "Appwrite community survey shows demand for built-in AI inference endpoints.",
        "source": "reddit",
        "source_url": "https://reddit.com/r/appwrite/comments/seed-w2-survey",
        "days_ago": 32,
    },
    # Week 3
    {
        "competitor": "pocketbase",
        "signal_type": "feature_release",
        "threat_score": 6,
        "summary": "PocketBase v0.22 adds realtime subscriptions, closing gap with hosted BaaS rivals.",
        "source": "github",
        "source_url": "https://github.com/pocketbase/pocketbase/releases/tag/seed-w3",
        "days_ago": 27,
    },
    {
        "competitor": "supabase",
        "signal_type": "security_issue",
        "threat_score": 7,
        "summary": "Security advisory: RLS policy misconfiguration reported in community projects.",
        "source": "github",
        "source_url": "https://github.com/supabase/supabase/security/advisories/seed-w3",
        "days_ago": 26,
    },
    {
        "competitor": "convex",
        "signal_type": "community_growth",
        "threat_score": 5,
        "summary": "HN front page: Convex praised for developer experience in AI agent prototypes.",
        "source": "hackernews",
        "source_url": "https://news.ycombinator.com/item?id=seed-w3-convex",
        "days_ago": 25,
    },
    # Week 4
    {
        "competitor": "appwrite",
        "signal_type": "feature_release",
        "threat_score": 6,
        "summary": "Appwrite adds serverless functions v2 with cold-start improvements.",
        "source": "github",
        "source_url": "https://github.com/appwrite/appwrite/releases/tag/seed-w4",
        "days_ago": 20,
    },
    {
        "competitor": "supabase",
        "signal_type": "deprecation",
        "threat_score": 4,
        "summary": "Supabase deprecates legacy realtime API — migration guide published.",
        "source": "github",
        "source_url": "https://github.com/supabase/supabase/releases/tag/seed-w4-deprecate",
        "days_ago": 19,
    },
    {
        "competitor": "pocketbase",
        "signal_type": "community_growth",
        "threat_score": 5,
        "summary": "PocketBase subreddit hits 8k members; self-hosting trend accelerating.",
        "source": "reddit",
        "source_url": "https://reddit.com/r/pocketbase/comments/seed-w4-growth",
        "days_ago": 18,
    },
    # Week 5 — Supabase AI pattern repeats
    {
        "competitor": "supabase",
        "signal_type": "feature_release",
        "threat_score": 9,
        "summary": "Supabase launches native vector search (pgvector) in GA for AI-native apps.",
        "source": "github",
        "source_url": "https://github.com/supabase/supabase/releases/tag/seed-w5-vector",
        "days_ago": 13,
    },
    {
        "competitor": "supabase",
        "signal_type": "community_growth",
        "threat_score": 7,
        "summary": "Reddit backlash: pricing concerns resurface after Supabase AI/vector GA launch.",
        "source": "reddit",
        "source_url": "https://reddit.com/r/Supabase/comments/seed-w5-pricing2",
        "days_ago": 11,
    },
    {
        "competitor": "convex",
        "signal_type": "feature_release",
        "threat_score": 7,
        "summary": "Convex ships agent workflow templates for multi-step AI pipelines.",
        "source": "github",
        "source_url": "https://github.com/get-convex/convex-backend/releases/tag/seed-w5-agents",
        "days_ago": 12,
    },
    {
        "competitor": "appwrite",
        "signal_type": "announcement",
        "threat_score": 5,
        "summary": "Appwrite announces cloud GA in EU region with GDPR-focused positioning.",
        "source": "hackernews",
        "source_url": "https://news.ycombinator.com/item?id=seed-w5-appwrite",
        "days_ago": 10,
    },
    # Week 6 — recent
    {
        "competitor": "pocketbase",
        "signal_type": "feature_release",
        "threat_score": 6,
        "summary": "PocketBase adds OAuth2 provider plugins, expanding auth parity with rivals.",
        "source": "github",
        "source_url": "https://github.com/pocketbase/pocketbase/releases/tag/seed-w6",
        "days_ago": 6,
    },
    {
        "competitor": "convex",
        "signal_type": "community_growth",
        "threat_score": 6,
        "summary": "Convex Dev Discord activity up 35% — AI agent builders migrating from Firebase.",
        "source": "reddit",
        "source_url": "https://reddit.com/r/ConvexDev/comments/seed-w6-growth",
        "days_ago": 5,
    },
    {
        "competitor": "supabase",
        "signal_type": "announcement",
        "threat_score": 6,
        "summary": "Supabase blog: enterprise tier expansion and dedicated support for AI workloads.",
        "source": "hackernews",
        "source_url": "https://news.ycombinator.com/item?id=seed-w6-supabase",
        "days_ago": 4,
    },
    {
        "competitor": "appwrite",
        "signal_type": "security_issue",
        "threat_score": 6,
        "summary": "Appwrite patches SSRF vulnerability in cloud functions runtime.",
        "source": "github",
        "source_url": "https://github.com/appwrite/appwrite/security/advisories/seed-w6",
        "days_ago": 3,
    },
    {
        "competitor": "pocketbase",
        "signal_type": "announcement",
        "threat_score": 4,
        "summary": "PocketBase featured on HN: single-binary backend gaining traction with indie devs.",
        "source": "hackernews",
        "source_url": "https://news.ycombinator.com/item?id=seed-w6-pb",
        "days_ago": 2,
    },
    {
        "competitor": "convex",
        "signal_type": "feature_release",
        "threat_score": 8,
        "summary": "Convex releases RAG cookbook with built-in memory patterns for AI agents.",
        "source": "github",
        "source_url": "https://github.com/get-convex/convex-backend/releases/tag/seed-w6-rag",
        "days_ago": 1,
    },
]


def _iso_days_ago(days: float) -> str:
    dt = datetime.now(timezone.utc) - timedelta(days=days)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _append_seed_entry(entry: dict) -> bool:
    if source_url_exists(entry["source_url"]):
        return False
    date = _iso_days_ago(entry["days_ago"])
    signal = Signal(
        id=str(uuid.uuid4())[:8],
        competitor=entry["competitor"],
        signal_type=SignalType(entry["signal_type"]),
        threat_score=entry["threat_score"],
        summary=entry["summary"],
        source=SOURCE_DISPLAY.get(entry["source"], entry["source"]),
        source_url=entry["source_url"],
        date=date,
    )
    append_signal(signal)
    return True


def load_store_from_seed() -> int:
    """Populate in-memory store from seed data (no Hindsight writes)."""
    loaded = 0
    for entry in SEED_ENTRIES:
        if _append_seed_entry(entry):
            loaded += 1
    return loaded


async def _run_seed_async() -> int:
    """Write historical signals to Hindsight and in-memory store."""
    written = 0
    for entry in SEED_ENTRIES:
        date = _iso_days_ago(entry["days_ago"])
        metadata = {
            "namespace": "events",
            "competitor": entry["competitor"],
            "signal_type": entry["signal_type"],
            "threat_score": entry["threat_score"],
            "source": entry["source"],
            "source_url": entry["source_url"],
            "date": date,
        }
        if not source_url_exists(entry["source_url"]):
            if await write_memory_async(entry["summary"], metadata):
                written += 1
            _append_seed_entry(entry)
    return written


def run_seed() -> int:
    return asyncio.run(_run_seed_async())


if __name__ == "__main__":
    count = run_seed()
    print(f"Seeded {count} new memories ({len(SEED_ENTRIES)} total entries)")
