"""Data collectors — GitHub, Reddit, Hacker News. Phase 2 implementation."""

from __future__ import annotations


async def collect_all() -> list[dict]:
    """Fetch raw signals for all tracked competitors. Phase 2."""
    raise NotImplementedError("collector.collect_all — implement in Phase 2")


async def run_collection_pipeline() -> dict:
    """Fetch → classify → write_memory → store. Phase 2."""
    raise NotImplementedError("collector.run_collection_pipeline — implement in Phase 2")
