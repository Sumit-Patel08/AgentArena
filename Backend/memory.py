"""Hindsight memory seam — write_memory() and recall()."""

from __future__ import annotations

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


def write_memory(text: str, metadata: dict[str, Any]) -> bool:
    """Store a memory entry in Hindsight. Returns True on success."""
    client = _get_client()
    if client is None:
        return False
    try:
        tags = []
        namespace = metadata.get("namespace", "events")
        tags.append(f"namespace:{namespace}")
        for key in ("competitor", "signal_type", "source"):
            if key in metadata:
                tags.append(f"{key}:{metadata[key]}")

        client.retain(
            bank_id=_bank_id,
            content=text,
            metadata=metadata,
            context=f"agent-arena:{namespace}",
        )
        return True
    except Exception as exc:
        logger.exception("write_memory failed: %s", exc)
        return False


def recall(query: str, k: int = 8) -> list[dict[str, Any]]:
    """Semantic search over Hindsight memories. Returns normalized dicts."""
    client = _get_client()
    if client is None:
        return []
    try:
        response = client.recall(
            bank_id=_bank_id,
            query=query,
            max_tokens=4096,
            budget="mid",
        )
        results = getattr(response, "results", response) or []
        normalized: list[dict[str, Any]] = []
        for item in results[:k]:
            text = getattr(item, "text", None) or (item.get("text") if isinstance(item, dict) else str(item))
            meta = getattr(item, "metadata", None) or (item.get("metadata") if isinstance(item, dict) else {}) or {}
            normalized.append(
                {
                    "text": text,
                    "metadata": meta,
                    "competitor": meta.get("competitor", "unknown"),
                    "date": meta.get("date", ""),
                    "threat_score": int(meta.get("threat_score", 5)),
                    "source_url": meta.get("source_url", ""),
                }
            )
        return normalized
    except Exception as exc:
        logger.exception("recall failed: %s", exc)
        return []
