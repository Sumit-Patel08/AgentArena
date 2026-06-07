"""Data collectors — GitHub, Reddit, Hacker News."""

from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv

from classifier import classify_signal
from competitors import get_all_competitors
from memory import write_memory_async
from models import Signal, SignalType
from store import append_signal, source_url_exists

load_dotenv()

logger = logging.getLogger(__name__)

SOURCE_DISPLAY = {
    "github": "GitHub",
    "reddit": "Reddit",
    "hackernews": "Hacker News",
}

_star_cache: dict[str, int] = {}


def _github_headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "AgentArena-CI/1.0"}
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def _fetch_github_signals(client: httpx.AsyncClient, comp: dict) -> list[dict]:
    owner, repo = comp["github_owner"], comp["github_repo"]
    base = f"https://api.github.com/repos/{owner}/{repo}"
    signals: list[dict] = []

    repo_resp = await client.get(base, headers=_github_headers())
    if repo_resp.status_code == 200:
        data = repo_resp.json()
        stars = int(data.get("stargazers_count", 0))
        _star_cache[comp["id"]] = stars

    releases_resp = await client.get(
        f"{base}/releases",
        headers=_github_headers(),
        params={"per_page": 5},
    )
    if releases_resp.status_code != 200:
        logger.warning("GitHub releases failed for %s: %s", comp["id"], releases_resp.status_code)
        return signals

    for release in releases_resp.json():
        tag = release.get("tag_name", "")
        body = (release.get("body") or "")[:1500]
        published = release.get("published_at") or datetime.now(timezone.utc).isoformat()
        url = release.get("html_url", f"https://github.com/{owner}/{repo}/releases")
        raw_text = f"Release {tag}: {body}".strip()
        if not raw_text or raw_text == f"Release {tag}:":
            continue
        signals.append(
            {
                "competitor": comp["id"],
                "raw_text": raw_text,
                "source_url": url,
                "date": published,
                "source": "github",
            }
        )
    return signals


async def _fetch_reddit_signals(client: httpx.AsyncClient, comp: dict) -> list[dict]:
    sub = comp["reddit_subreddit"]
    url = f"https://old.reddit.com/r/{sub}/new.json"
    signals: list[dict] = []
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    resp = await client.get(
        url,
        headers={
            "User-Agent": "AgentArena-CI/1.0 (HackBaroda2026; contact@agentarena.dev)",
            "Accept": "application/json",
        },
        params={"limit": 15},
        follow_redirects=True,
    )
    if resp.status_code != 200:
        logger.warning("Reddit fetch failed for %s: %s", comp["id"], resp.status_code)
        return signals

    for child in resp.json().get("data", {}).get("children", []):
        post = child.get("data", {})
        created = datetime.fromtimestamp(post.get("created_utc", 0), tz=timezone.utc)
        if created < week_ago:
            continue
        title = post.get("title", "")
        selftext = (post.get("selftext") or "")[:1000]
        permalink = post.get("permalink", "")
        if not title:
            continue
        signals.append(
            {
                "competitor": comp["id"],
                "raw_text": f"{title}\n{selftext}".strip(),
                "source_url": f"https://www.reddit.com{permalink}",
                "date": created.isoformat(),
                "source": "reddit",
            }
        )
    return signals


async def _fetch_hn_signals(client: httpx.AsyncClient, comp: dict) -> list[dict]:
    signals: list[dict] = []
    week_ago_ts = int((datetime.now(timezone.utc) - timedelta(days=7)).timestamp())

    resp = await client.get(
        "https://hn.algolia.com/api/v1/search",
        params={
            "query": comp["hn_search"],
            "tags": "story",
            "numericFilters": f"created_at_i>{week_ago_ts}",
            "hitsPerPage": 10,
        },
    )
    if resp.status_code != 200:
        logger.warning("HN fetch failed for %s: %s", comp["id"], resp.status_code)
        return signals

    for hit in resp.json().get("hits", []):
        title = hit.get("title", "")
        points = hit.get("points", 0)
        url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}"
        created = datetime.fromtimestamp(hit.get("created_at_i", 0), tz=timezone.utc).isoformat()
        if not title:
            continue
        signals.append(
            {
                "competitor": comp["id"],
                "raw_text": f"{title} ({points} points on Hacker News)",
                "source_url": url,
                "date": created,
                "source": "hackernews",
            }
        )
    return signals


async def collect_all() -> list[dict]:
    """Fetch raw signals for all tracked competitors."""
    all_signals: list[dict] = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        for comp in get_all_competitors():
            try:
                gh = await _fetch_github_signals(client, comp)
                rd = await _fetch_reddit_signals(client, comp)
                hn = await _fetch_hn_signals(client, comp)
                all_signals.extend(gh + rd + hn)
                logger.info(
                    "Collected %s: github=%s reddit=%s hn=%s",
                    comp["id"],
                    len(gh),
                    len(rd),
                    len(hn),
                )
            except Exception as exc:
                logger.exception("Collection failed for %s: %s", comp["id"], exc)
    return all_signals


def get_star_count(competitor_id: str) -> int:
    return _star_cache.get(competitor_id, 0)


async def run_collection_pipeline() -> dict:
    """Fetch → classify → write_memory → store."""
    raw_signals = await collect_all()
    new_count = 0

    for raw in raw_signals:
        if source_url_exists(raw["source_url"]):
            continue

        classified = classify_signal(raw["competitor"], raw["raw_text"], raw["source_url"])
        threat_score = int(classified.get("threat_score", 5))
        if threat_score < 3:
            continue

        signal_type = classified.get("signal_type", "announcement")
        summary = classified.get("summary", raw["raw_text"][:200])
        date = raw["date"]
        if date.endswith("+00:00"):
            date = date.replace("+00:00", "Z")
        elif not date.endswith("Z") and "+" not in date:
            date = f"{date}Z" if "T" in date else date

        metadata = {
            "namespace": "events",
            "competitor": raw["competitor"],
            "signal_type": signal_type,
            "threat_score": threat_score,
            "source": raw["source"],
            "source_url": raw["source_url"],
            "date": date,
        }
        await write_memory_async(summary, metadata)

        signal = Signal(
            id=str(uuid.uuid4())[:8],
            competitor=raw["competitor"],
            signal_type=SignalType(signal_type),
            threat_score=threat_score,
            summary=summary,
            source=SOURCE_DISPLAY.get(raw["source"], raw["source"]),
            source_url=raw["source_url"],
            date=date,
        )
        append_signal(signal)
        new_count += 1

    return {"collected": len(raw_signals), "new_signals": new_count}
