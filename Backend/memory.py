"""Hindsight memory seam — write_memory() and recall()."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_api_key = os.getenv("HINDSIGHT_API_KEY", "")
_bank_id = os.getenv("HINDSIGHT_COLLECTION_ID", "agent-arena-ci")
_base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")

_client: Any = None
_bank_ready = False


def _get_client() -> Any | None:
    global _client
    if _client is not None:
        return _client
    if not _api_key or not _base_url:
        logger.warning("Hindsight credentials missing — memory operations disabled")
        return None
    try:
        from hindsight_client import Hindsight

        _client = Hindsight(base_url=_base_url, api_key=_api_key, timeout=30.0)
        return _client
    except Exception as exc:
        logger.exception("Failed to initialize Hindsight client: %s", exc)
        return None


def _stringify_metadata(metadata: dict[str, Any]) -> dict[str, str]:
    return {k: str(v) for k, v in metadata.items() if v is not None}


async def _ensure_bank(client: Any) -> None:
    global _bank_ready
    if _bank_ready:
        return
    try:
        await client.acreate_bank(
            bank_id=_bank_id,
            name="Agent Arena CI",
            mission="Track competitor signals across GitHub, Reddit, and Hacker News.",
        )
    except Exception:
        pass
    _bank_ready = True


def _normalize_results(response: Any, k: int) -> list[dict[str, Any]]:
    results = getattr(response, "results", response) or []
    normalized: list[dict[str, Any]] = []
    for item in results[:k]:
        text = getattr(item, "text", None) or (
            item.get("text") if isinstance(item, dict) else str(item)
        )
        meta = getattr(item, "metadata", None) or (
            item.get("metadata") if isinstance(item, dict) else {}
        ) or {}
        normalized.append(
            {
                "text": text,
                "metadata": meta,
                "competitor": meta.get("competitor", "unknown"),
                "date": meta.get("date", ""),
                "threat_score": int(meta.get("threat_score", 5) or 5),
                "source_url": meta.get("source_url", ""),
            }
        )
    return normalized


async def write_memory_async(text: str, metadata: dict[str, Any]) -> bool:
    client = _get_client()
    if client is None:
        return False
    try:
        await _ensure_bank(client)
        namespace = metadata.get("namespace", "events")
        safe_meta = _stringify_metadata(metadata)
        await client.aretain(
            bank_id=_bank_id,
            content=text,
            metadata=safe_meta,
            context=f"agent-arena:{namespace}",
        )
        return True
    except Exception as exc:
        logger.exception("write_memory failed: %s", exc)
        return False


async def recall_async(query: str, k: int = 8) -> list[dict[str, Any]]:
    client = _get_client()
    if client is None:
        return []
    try:
        response = await client.arecall(
            bank_id=_bank_id,
            query=query,
            max_tokens=4096,
            budget="mid",
        )
        return _normalize_results(response, k)
    except Exception as exc:
        logger.exception("recall failed: %s", exc)
        return []


def write_memory(text: str, metadata: dict[str, Any]) -> bool:
    """Sync wrapper for scripts. Use write_memory_async inside async code."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(write_memory_async(text, metadata))
    raise RuntimeError("Use await write_memory_async() inside async contexts")


def recall(query: str, k: int = 8) -> list[dict[str, Any]]:
    """Sync wrapper for scripts. Use recall_async inside async code."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(recall_async(query, k))
    raise RuntimeError("Use await recall_async() inside async contexts")
