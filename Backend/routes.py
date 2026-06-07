"""API routes — contract matches frontend-facing plan (do not rename fields)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from competitors import TRACKED_COMPETITORS, get_competitor_by_id
from memory import recall
from models import (
    ChatRequest,
    ChatResponse,
    CollectRunResponse,
    CompetitorDetail,
    CompetitorSummary,
    DigestResponse,
    HealthResponse,
    Metrics,
    Recommendation,
    RecommendationStatusUpdate,
    Signal,
    SourceCitation,
    ThreatPoint,
)
from store import (
    get_metrics,
    get_recommendations,
    get_signals,
    update_recommendation_status,
)

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/signals", response_model=list[Signal])
async def list_signals(
    competitor: str | None = Query(default=None),
) -> list[Signal]:
    return [Signal(**s) for s in get_signals(competitor=competitor)]


@router.get("/competitors", response_model=list[CompetitorSummary])
async def list_competitors() -> list[CompetitorSummary]:
    summaries: list[CompetitorSummary] = []
    for comp in TRACKED_COMPETITORS:
        signals = get_signals(competitor=comp["id"], limit=100)
        threat_scores = [int(s.get("threat_score", 5)) for s in signals[:3]]
        threat_score = max(threat_scores) if threat_scores else 5
        last_date = signals[0]["date"] if signals else ""
        sparkline = _compute_sparkline(signals)
        summaries.append(
            CompetitorSummary(
                id=comp["id"],
                name=comp["name"],
                threat_score=threat_score,
                stars=0,
                stars_delta_week=0,
                last_signal_date=last_date,
                sparkline=sparkline,
            )
        )
    return summaries


@router.get("/competitors/{competitor_id}", response_model=CompetitorDetail)
async def get_competitor(competitor_id: str) -> CompetitorDetail:
    comp = get_competitor_by_id(competitor_id)
    if comp is None:
        raise HTTPException(status_code=404, detail="Competitor not found")

    signals = get_signals(competitor=competitor_id, limit=100)
    events = [Signal(**s) for s in signals]
    threat_scores = [int(s.get("threat_score", 5)) for s in signals[:3]]
    threat_score = max(threat_scores) if threat_scores else 5
    last_date = signals[0]["date"] if signals else ""

    memories = recall(f"{comp['name']} recent pattern", k=1)
    pattern_insight = (
        memories[0]["text"][:200] if memories else "No pattern insight yet — run seed or collection."
    )

    comp_recs = [
        Recommendation(**r)
        for r in get_recommendations()
        if r.get("competitor") == comp["name"] or r.get("competitor") == competitor_id
    ]

    return CompetitorDetail(
        id=comp["id"],
        name=comp["name"],
        threat_score=threat_score,
        stars=0,
        stars_delta_week=0,
        last_signal_date=last_date,
        sparkline=_compute_sparkline(signals),
        tracking_since="2025-04-22",
        threat_over_time=[
            ThreatPoint(date=s["date"], score=int(s.get("threat_score", 5))) for s in reversed(signals[:20])
        ],
        events=events,
        pattern_insight=pattern_insight,
        recommendations=comp_recs,
    )


@router.get("/metrics", response_model=Metrics)
async def metrics() -> Metrics:
    return get_metrics()


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    if body.use_memory:
        memories = recall(body.question, k=8)
        sources = [
            SourceCitation(
                competitor=m.get("competitor", "unknown"),
                date=m.get("date", ""),
                threat_score=int(m.get("threat_score", 5)),
            )
            for m in memories
        ]
        context = "\n".join(
            f"[{i + 1}] {m.get('date', '')} | {m.get('competitor', '')} | Score: {m.get('threat_score', 5)}/10 — {m.get('text', '')}"
            for i, m in enumerate(memories)
        )
        answer = (
            f"Memory-backed analysis for: {body.question}\n\n"
            f"Used {len(memories)} memories.\n"
            f"{context[:500] if context else 'No memories found yet.'}"
        )
        return ChatResponse(answer=answer, memories_used=len(memories), sources=sources)

    return ChatResponse(
        answer=f"General knowledge answer (no memory) for: {body.question}",
        memories_used=0,
        sources=[],
    )


@router.get("/recommendations", response_model=list[Recommendation])
async def list_recommendations() -> list[Recommendation]:
    priority_order = {"high": 0, "medium": 1, "low": 2}
    recs = get_recommendations()
    recs.sort(key=lambda r: priority_order.get(r.get("priority", "low"), 3))
    return [Recommendation(**r) for r in recs]


@router.post("/recommendations/{rec_id}/status", response_model=Recommendation)
async def set_recommendation_status(
    rec_id: str, body: RecommendationStatusUpdate
) -> Recommendation:
    if body.status.value not in ("implemented", "dismissed"):
        raise HTTPException(status_code=400, detail="Status must be implemented or dismissed")
    updated = update_recommendation_status(rec_id, body.status.value)
    if updated is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return Recommendation(**updated)


@router.post("/digest", response_model=DigestResponse)
async def digest() -> DigestResponse:
    memories = recall("recent competitor threats and opportunities", k=10)
    return DigestResponse(
        top_threats=memories[:3],
        top_opportunities=memories[3:5],
        emerging_pattern="Weekly digest will synthesize patterns once seed data is loaded.",
    )


@router.post("/collect/run", response_model=CollectRunResponse)
async def collect_run() -> CollectRunResponse:
    try:
        from collector import run_collection_pipeline

        result = await run_collection_pipeline()
        return CollectRunResponse(
            collected=result.get("collected", 0),
            new_signals=result.get("new_signals", 0),
        )
    except NotImplementedError:
        return CollectRunResponse(collected=0, new_signals=0)


def _compute_sparkline(signals: list[dict]) -> list[int]:
    """Average threat score per week for last 6 weeks, oldest first."""
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    buckets: list[list[int]] = [[] for _ in range(6)]
    for sig in signals:
        try:
            dt = datetime.fromisoformat(sig.get("date", "").replace("Z", "+00:00"))
        except ValueError:
            continue
        weeks_ago = (now - dt).days // 7
        if 0 <= weeks_ago < 6:
            buckets[5 - weeks_ago].append(int(sig.get("threat_score", 5)))
    return [round(sum(b) / len(b)) if b else 3 for b in buckets]
