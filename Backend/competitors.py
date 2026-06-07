"""Tracked competitors and their public data sources (Phase 0.3)."""

from typing import TypedDict


class CompetitorConfig(TypedDict):
    id: str
    name: str
    github_owner: str
    github_repo: str
    reddit_subreddit: str
    reddit_search: str
    hn_search: str
    description: str


TRACKED_COMPETITORS: list[CompetitorConfig] = [
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


def get_competitor_by_id(competitor_id: str) -> CompetitorConfig | None:
    return next((c for c in TRACKED_COMPETITORS if c["id"] == competitor_id), None)
