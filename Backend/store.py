"""In-memory store for signals and recommendations."""

from __future__ import annotations

import threading
from datetime import datetime, timedelta, timezone
from typing import Any

from competitors import get_all_competitors, get_tracked_ids
from workspace_store import is_configured
from models import Metrics, MetricsDeltas, Recommendation, Signal

_lock = threading.Lock()
signals_store: list[dict[str, Any]] = []
recommendations_store: list[dict[str, Any]] = []


def append_signal(signal: dict[str, Any] | Signal) -> None:
    payload = signal.model_dump() if isinstance(signal, Signal) else signal
    with _lock:
        signals_store.append(payload)


def append_recommendation(rec: dict[str, Any] | Recommendation) -> None:
    payload = rec.model_dump() if isinstance(rec, Recommendation) else rec
    with _lock:
        recommendations_store.append(payload)


def get_signals(competitor: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    tracked = get_tracked_ids() if is_configured() else None
    with _lock:
        items = list(signals_store)
    if tracked is not None:
        items = [s for s in items if s.get("competitor") in tracked]
    if competitor:
        items = [s for s in items if s.get("competitor") == competitor]
    items.sort(key=lambda s: s.get("date", ""), reverse=True)
    return items[:limit]


def get_recommendations() -> list[dict[str, Any]]:
    with _lock:
        return list(recommendations_store)


def set_recommendations(recs: list[dict[str, Any]]) -> None:
    with _lock:
        recommendations_store.clear()
        recommendations_store.extend(recs)


def clear_all() -> None:
    with _lock:
        signals_store.clear()
        recommendations_store.clear()


def source_url_exists(source_url: str) -> bool:
    with _lock:
        return any(s.get("source_url") == source_url for s in signals_store)


def update_recommendation_status(rec_id: str, status: str) -> dict[str, Any] | None:
    with _lock:
        for rec in recommendations_store:
            if rec.get("id") == rec_id:
                rec["status"] = status
                return dict(rec)
    return None


def get_metrics() -> Metrics:
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    tracked = get_tracked_ids() if is_configured() else None
    with _lock:
        signals = list(signals_store)
        recs = list(recommendations_store)
    if tracked is not None:
        signals = [s for s in signals if s.get("competitor") in tracked]
        recs = [r for r in recs if r.get("competitor") in tracked]

    def parse_date(value: str) -> datetime | None:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None

    this_week = [
        s for s in signals if (d := parse_date(s.get("date", ""))) and d >= week_ago
    ]
    last_week = [
        s
        for s in signals
        if (d := parse_date(s.get("date", ""))) and two_weeks_ago <= d < week_ago
    ]

    active = {s.get("competitor") for s in signals if s.get("competitor")}
    active_last = {s.get("competitor") for s in last_week if s.get("competitor")}

    high_this = sum(1 for s in this_week if int(s.get("threat_score", 0)) >= 8)
    high_last = sum(1 for s in last_week if int(s.get("threat_score", 0)) >= 8)

    open_recs = [r for r in recs if r.get("status") == "open"]
    open_last = len([r for r in recs if r.get("status") == "open"])  # simplified

    def delta_str(current: int, previous: int) -> str:
        diff = current - previous
        return f"+{diff}" if diff >= 0 else str(diff)

    return Metrics(
        total_signals=len(signals),
        active_competitors=len(get_all_competitors()) if is_configured() else (len(active) or len(get_all_competitors())),
        high_threats_week=high_this,
        new_recommendations=len(open_recs),
        deltas=MetricsDeltas(
            total_signals=delta_str(len(this_week), len(last_week)),
            active_competitors=delta_str(len(active), len(active_last)),
            high_threats_week=delta_str(high_this, high_last),
            new_recommendations=delta_str(len(open_recs), open_last),
        ),
    )
