"""Tracked competitors — dynamic from workspace or demo fallback."""

from __future__ import annotations

from typing import TypedDict

from workspace_store import get_tracked_competitors, is_configured


class CompetitorConfig(TypedDict):
    id: str
    name: str
    github_owner: str
    github_repo: str
    reddit_subreddit: str
    reddit_search: str
    hn_search: str
    description: str


# Demo fallback when no workspace configured (hackathon default)
DEMO_COMPETITORS: list[CompetitorConfig] = [
    {
        "id": "supabase",
        "name": "Supabase",
        "github_owner": "supabase",
        "github_repo": "supabase",
        "reddit_subreddit": "Supabase",
        "reddit_search": "supabase",
        "hn_search": "Supabase",
        "description": "Open-source Firebase alternative. Postgres + auth + storage.",
    },
    {
        "id": "appwrite",
        "name": "Appwrite",
        "github_owner": "appwrite",
        "github_repo": "appwrite",
        "reddit_subreddit": "appwrite",
        "reddit_search": "appwrite",
        "hn_search": "Appwrite",
        "description": "Self-hosted backend platform for web, mobile, and Flutter.",
    },
    {
        "id": "pocketbase",
        "name": "PocketBase",
        "github_owner": "pocketbase",
        "github_repo": "pocketbase",
        "reddit_subreddit": "pocketbase",
        "reddit_search": "pocketbase",
        "hn_search": "PocketBase",
        "description": "Open-source backend in a single file. SQLite under the hood.",
    },
    {
        "id": "convex",
        "name": "Convex",
        "github_owner": "get-convex",
        "github_repo": "convex-backend",
        "reddit_subreddit": "ConvexDev",
        "reddit_search": "convex backend",
        "hn_search": "Convex",
        "description": "Reactive backend for TypeScript apps. End-to-end type safe.",
    },
]


def get_all_competitors() -> list[CompetitorConfig]:
    dynamic = get_tracked_competitors()
    if dynamic:
        return dynamic  # type: ignore[return-value]
    return DEMO_COMPETITORS


def get_competitor_by_id(competitor_id: str) -> CompetitorConfig | None:
    return next((c for c in get_all_competitors() if c["id"] == competitor_id), None)


def using_demo_data() -> bool:
    return not is_configured()


def get_tracked_ids() -> set[str]:
    return {c["id"] for c in get_all_competitors()}
