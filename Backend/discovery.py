"""Auto-discover competitors from company website/domain via Groq."""

from __future__ import annotations

import logging
import re
from urllib.parse import urlparse

import httpx

from llm import groq_complete, parse_json_response
from workspace_store import slugify

logger = logging.getLogger(__name__)

DISCOVERY_SYSTEM = """You are a competitive intelligence analyst.
Given a company's website and domain, identify 4-6 DIRECT competitors in the SAME niche and market segment.

Rules:
- Only companies that sell a similar product to the same customer type.
- Do NOT include mega-cloud platforms (AWS, Google Cloud, Azure) unless the company IS a cloud provider.
- Do NOT include the user's own company.
- Prefer startups/SMBs and focused products over huge unrelated platforms.
- Be specific and real — no fictional companies.

Return ONLY valid JSON (no markdown):
{
  "competitors": [
    {
      "name": "Company Name",
      "website": "https://competitor.com",
      "description": "one sentence what they do",
      "github_owner": "org or empty string",
      "github_repo": "repo or empty string",
      "reddit_subreddit": "subreddit name without r/",
      "reddit_search": "search term",
      "hn_search": "Hacker News search term"
    }
  ]
}
Prefer companies with public GitHub repos when relevant."""


async def _fetch_site_context(website: str) -> str:
    if not website:
        return ""
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(
                website if website.startswith("http") else f"https://{website}",
                headers={"User-Agent": "AgentArena-CI/1.0"},
            )
            if resp.status_code != 200:
                return ""
            text = resp.text[:8000]
            title = re.search(r"<title[^>]*>([^<]+)</title>", text, re.I)
            desc = re.search(
                r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)',
                text,
                re.I,
            )
            parts = []
            if title:
                parts.append(f"Page title: {title.group(1).strip()}")
            if desc:
                parts.append(f"Meta description: {desc.group(1).strip()}")
            return "\n".join(parts)
    except Exception as exc:
        logger.warning("Site fetch failed: %s", exc)
        return ""


def _normalize_competitor(raw: dict) -> dict | None:
    name = str(raw.get("name", "")).strip()
    if not name:
        return None
    cid = slugify(name)
    owner = str(raw.get("github_owner", "")).strip()
    repo = str(raw.get("github_repo", "")).strip()
    return {
        "id": cid,
        "name": name,
        "github_owner": owner,
        "github_repo": repo,
        "reddit_subreddit": str(raw.get("reddit_subreddit", name)).strip(),
        "reddit_search": str(raw.get("reddit_search", name)).strip().lower(),
        "hn_search": str(raw.get("hn_search", name)).strip(),
        "description": str(raw.get("description", "")).strip()[:300],
        "website": str(raw.get("website", "")).strip(),
    }


async def discover_competitors(
    company_name: str,
    website: str,
    domain: str = "",
    industry: str = "",
) -> list[dict]:
    """Use Groq + optional site scrape to find real competitors."""
    if not domain and website:
        parsed = urlparse(website if "://" in website else f"https://{website}")
        domain = parsed.netloc or website

    site_context = await _fetch_site_context(website)
    user_prompt = f"""Company: {company_name}
Website: {website}
Domain: {domain}
Industry hint: {industry or "infer from website"}

{site_context}

List 4-6 direct competitors in the same niche only. Exclude unrelated global platforms."""

    raw = await groq_complete(DISCOVERY_SYSTEM, user_prompt, temperature=0.2, max_tokens=2000)
    parsed = parse_json_response(raw)
    if not parsed:
        logger.warning("Discovery JSON parse failed")
        return []

    own_slug = slugify(company_name)
    competitors: list[dict] = []
    seen: set[str] = {own_slug}
    for item in parsed.get("competitors", []):
        if not isinstance(item, dict):
            continue
        norm = _normalize_competitor(item)
        if norm and norm["id"] not in seen:
            seen.add(norm["id"])
            competitors.append(norm)
    return competitors[:6]
