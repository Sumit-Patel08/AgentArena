"""Shared Groq LLM helpers."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

PRIMARY_MODEL = "qwen/qwen3-32b"
FALLBACK_MODEL = "openai/gpt-oss-120b"


def _get_client():
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    return Groq(api_key=api_key)


def _sync_complete(system: str, user: str, temperature: float = 0.3, max_tokens: int = 1024) -> str:
    client = _get_client()
    messages = [
        {
            "role": "system",
            "content": system + "\nNever output reasoning or thinking tags. Respond with the final answer only.",
        },
        {"role": "user", "content": user},
    ]
    try:
        response = client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return strip_thinking(response.choices[0].message.content or "")
    except Exception as primary_exc:
        logger.warning("Primary Groq model failed (%s), using fallback", primary_exc)
        response = client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return strip_thinking(response.choices[0].message.content or "")


async def groq_complete(
    system: str,
    user: str,
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> str:
    """Run Groq chat completion in a thread pool (safe inside async handlers)."""
    return await asyncio.to_thread(_sync_complete, system, user, temperature, max_tokens)


def strip_thinking(text: str) -> str:
    """Remove qwen3 reasoning blocks from model output."""
    close_tags = [
        "</" + "redacted_thinking" + ">",
        "</" + "think" + ">",
    ]
    open_tags = [
        "<" + "redacted_thinking" + ">",
        "<" + "think" + ">",
    ]
    cleaned = text
    for close_tag in close_tags:
        while close_tag in cleaned:
            cleaned = cleaned.split(close_tag, 1)[-1]
    stripped = cleaned.strip()
    if any(stripped.startswith(tag) for tag in open_tags):
        return ""
    return stripped


def parse_json_response(text: str) -> dict | None:
    cleaned = strip_thinking(text)
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                data = json.loads(match.group())
                return data if isinstance(data, dict) else None
            except json.JSONDecodeError:
                return None
        return None


def format_memory_block(memories: list[dict]) -> str:
    lines = []
    for i, m in enumerate(memories):
        lines.append(
            f"[{i + 1}] {m.get('date', 'unknown')} | {m.get('competitor', 'unknown')} | "
            f"Score: {m.get('threat_score', 5)}/10\n{m.get('text', '')}"
        )
    return "\n\n".join(lines) if lines else "No memories available."
