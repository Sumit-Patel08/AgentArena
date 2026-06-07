"""Groq signal classifier."""

from __future__ import annotations

import json
import logging
import os
import re

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

PRIMARY_MODEL = "qwen/qwen3-32b"
FALLBACK_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a competitive intelligence classifier.
Return ONLY valid JSON with no markdown fences.
Required fields:
- signal_type: one of feature_release, community_growth, security_issue, deprecation, announcement
- threat_score: integer 1-10 (8-10 high threat, 4-7 medium, 1-3 low)
- summary: one sentence describing the competitive signal
- tags: list of 2-5 keyword strings
"""

RETRY_PROMPT = """Return JSON only: {"signal_type":"announcement","threat_score":5,"summary":"...","tags":["..."]}
Classify this competitor signal."""


def _parse_json(text: str) -> dict | None:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        return None


def _default_classification(raw_text: str) -> dict:
    return {
        "signal_type": "announcement",
        "threat_score": 5,
        "summary": raw_text[:200] if raw_text else "Unclassified competitor signal.",
        "tags": ["unclassified"],
    }


def _call_groq(competitor: str, raw_text: str, source_url: str, simplified: bool = False) -> str:
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    client = Groq(api_key=api_key)
    model = PRIMARY_MODEL

    user_content = (
        f"Competitor: {competitor}\n"
        f"Source URL: {source_url}\n"
        f"Raw signal:\n{raw_text[:3000]}"
    )
    messages = [
        {"role": "system", "content": RETRY_PROMPT if simplified else SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    kwargs: dict = {
        "model": model,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": 512,
    }
    try:
        response = client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""
    except Exception as primary_exc:
        logger.warning("Primary model failed (%s), trying fallback", primary_exc)
        response = client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=messages,
            temperature=0.1,
            max_tokens=512,
        )
        return response.choices[0].message.content or ""


def classify_signal(competitor: str, raw_text: str, source_url: str) -> dict:
    """Classify a raw signal via Groq. Retries once on failure."""
    valid_types = {
        "feature_release",
        "community_growth",
        "security_issue",
        "deprecation",
        "announcement",
    }

    for attempt, simplified in enumerate([False, True]):
        try:
            content = _call_groq(competitor, raw_text, source_url, simplified=simplified)
            parsed = _parse_json(content)
            if parsed is None:
                logger.warning("Groq returned non-JSON (attempt %s)", attempt + 1)
                continue

            signal_type = parsed.get("signal_type", "announcement")
            if signal_type not in valid_types:
                signal_type = "announcement"

            threat_score = int(parsed.get("threat_score", 5))
            threat_score = max(1, min(10, threat_score))

            return {
                "signal_type": signal_type,
                "threat_score": threat_score,
                "summary": str(parsed.get("summary", raw_text[:200]))[:500],
                "tags": list(parsed.get("tags", []))[:10] or ["signal"],
            }
        except Exception as exc:
            logger.warning("classify_signal attempt %s failed: %s", attempt + 1, exc)

    return _default_classification(raw_text)
