"""APScheduler background collection job."""

from __future__ import annotations

import logging
import os

from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def start_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler

    interval = int(os.getenv("COLLECT_INTERVAL_MINUTES", "60"))
    _scheduler = AsyncIOScheduler()

    async def _collect_job() -> None:
        try:
            from collector import run_collection_pipeline

            result = await run_collection_pipeline()
            logger.info("Scheduled collection: %s", result)
        except Exception as exc:
            logger.exception("Scheduled collection failed: %s", exc)

    _scheduler.add_job(_collect_job, "interval", minutes=interval, id="collect_all")
    _scheduler.start()
    logger.info("Scheduler started — collection every %s minutes", interval)
    return _scheduler


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
