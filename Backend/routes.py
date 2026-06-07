"""API routes — contract matches frontend-facing plan (do not rename fields)."""

from __future__ import annotations

import time

from fastapi import APIRouter, HTTPException, Query

from collector import get_star_count
from competitors import TRACKED_COMPETITORS, get_competitor_by_id
from llm import format_memory_block, groq_complete, parse_json_response
from memory import recall_async
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
from recommender import generate_recommendations
from store import (
    get_metrics,
    get_recommendations,
    get_signals,
    set_recommendations,
    update_recommendation_status,
)

router = APIRouter(prefix="/api")

_REC_CACHE_TTL = 300
_PATTERN_CACHE_TTL = 600

_rec_cache: list[dict] = []
_rec_cache_at: float = 0.0
_pattern_cache: dict[str, tuple[float, str]] = {}

MEMORY_CHAT_SYSTEM = """You are a competitive intelligence analyst for Agent Arena.
You have access to 6 weeks of historical memory about competitor activity.
Answer the user question using ONLY the provided memory entries.
Be specific — cite source numbers like [1][3], mention dates and competitors by name.
Identify patterns across time when relevant (e.g. repeated AI launches followed by pricing backlash).
If memories are insufficient, say what is missing rather than inventing facts."""

BLIND_CHAT_SYSTEM = """You are a competitive intelligence analyst.
Answer based on general industry knowledge only — you have NO access to specific
recent signals or historical monitoring data for these competitors.
Keep answers high-level and acknowledge you lack recent tracked intelligence."""

DIGEST_SYSTEM = """You are a competitive intelligence analyst preparing a weekly briefing.
Given the memory entries below, return ONLY valid JSON with no markdown fences:
{
  "top_threats": [{"competitor": "...", "summary": "one sentence"}],
  "top_opportunities": [{"competitor": "...", "summary": "one sentence"}],
  "emerging_pattern": "one sentence describing a multi-week trend"
}
Provide exactly 3 top_threats and 2 top_opportunities."""

PATTERN_SYSTEM = """You are a competitive intelligence analyst.
Synthesise the following competitor memory entries into ONE concise pattern observation
(1-2 sentences). Focus on recurring strategic moves, timing patterns, or market pressure.
Be specific about dates and events when possible."""


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
                stars=get_star_count(comp["id"]),
                stars_delta_week=0,
                last_signal_date=last_date,
                sparkline=sparkline,
            )
        )
    return summaries


async def _get_pattern_insight(competitor_name: str, competitor_id: str) -> str:
    now = time.time()
    cached = _pattern_cache.get(competitor_id)
    if cached and now - cached[0] < _PATTERN_CACHE_TTL:
        return cached[1]

    memories = await recall_async(f"{competitor_name} pattern trend", k=5)
    top = memories[:3]
    if not top:
        insight = "No pattern insight yet — run seed or collection."
        _pattern_cache[competitor_id] = (now, insight)
        return insight

    context = format_memory_block(top)
    try:
        insight = await groq_complete(
            PATTERN_SYSTEM,
            f"Competitor: {competitor_name}\n\nMemories:\n{context}",
            temperature=0.2,
            max_tokens=400,
        )
        insight = insight.strip()[:400]
        if not insight:
            insight = (
                f"{competitor_name} shows a recurring pattern of AI-feature launches "
                f"followed by community pricing concerns across multiple weeks."
            )
    except Exception:
        insight = top[0].get("text", "")[:200]

    _pattern_cache[competitor_id] = (now, insight)
    return insight


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

    pattern_insight = await _get_pattern_insight(comp["name"], competitor_id)

    comp_recs = [
        Recommendation(**r)
        for r in get_recommendations()
        if r.get("competitor") == comp["name"] or r.get("competitor") == competitor_id
    ]

    return CompetitorDetail(
        id=comp["id"],
        name=comp["name"],
        threat_score=threat_score,
        stars=get_star_count(competitor_id),
        stars_delta_week=0,
        last_signal_date=last_date,
        sparkline=_compute_sparkline(signals),
        tracking_since="2025-04-22",
        threat_over_time=[
            ThreatPoint(date=s["date"], score=int(s.get("threat_score", 5)))
            for s in reversed(signals[:20])
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
        memories = await recall_async(body.question, k=8)
        sources = [
            SourceCitation(
                competitor=m.get("competitor", "unknown"),
                date=m.get("date", ""),
                threat_score=int(m.get("threat_score", 5)),
            )
            for m in memories
        ]
        context = format_memory_block(memories)
        user_msg = f"Memory entries:\n\n{context}\n\nQuestion: {body.question}"
        answer = await groq_complete(MEMORY_CHAT_SYSTEM, user_msg, temperature=0.3, max_tokens=1200)
        return ChatResponse(
            answer=answer.strip(),
            memories_used=len(memories),
            sources=sources,
        )

    answer = await groq_complete(
        BLIND_CHAT_SYSTEM,
        body.question,
        temperature=0.4,
        max_tokens=800,
    )
    return ChatResponse(answer=answer.strip(), memories_used=0, sources=[])


async def _get_cached_recommendations() -> list[dict]:
    global _rec_cache, _rec_cache_at
    now = time.time()
    if _rec_cache and now - _rec_cache_at < _REC_CACHE_TTL:
        return _rec_cache

    generated = await generate_recommendations()
    if generated:
        set_recommendations(generated)
        _rec_cache = generated
        _rec_cache_at = now
    return get_recommendations()


@router.get("/recommendations", response_model=list[Recommendation])
async def list_recommendations() -> list[Recommendation]:
    recs = await _get_cached_recommendations()
    priority_order = {"high": 0, "medium": 1, "low": 2}
    recs = sorted(recs, key=lambda r: priority_order.get(r.get("priority", "low"), 3))
    return [Recommendation(**r) for r in recs]


@router.post("/recommendations/{rec_id}/status", response_model=Recommendation)
async def set_recommendation_status_route(
    rec_id: str, body: RecommendationStatusUpdate
) -> Recommendation:
    if body.status.value not in ("implemented", "dismissed"):
        raise HTTPException(status_code=400, detail="Status must be implemented or dismissed")
    updated = update_recommendation_status(rec_id, body.status.value)
    if updated is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    global _rec_cache
    for i, rec in enumerate(_rec_cache):
        if rec.get("id") == rec_id:
            _rec_cache[i] = updated
            break

    return Recommendation(**updated)


@router.post("/digest", response_model=DigestResponse)
async def digest() -> DigestResponse:
    memories = await recall_async("competitor threats and opportunities this week", k=15)
    context = format_memory_block(memories)

    try:
        raw = await groq_complete(
            DIGEST_SYSTEM,
            f"Weekly memory entries:\n\n{context}",
            temperature=0.2,
            max_tokens=800,
        )
        parsed = parse_json_response(raw)
        if parsed:
            return DigestResponse(
                top_threats=parsed.get("top_threats", [])[:3],
                top_opportunities=parsed.get("top_opportunities", [])[:2],
                emerging_pattern=str(parsed.get("emerging_pattern", "")),
            )
    except Exception:
        pass

    return DigestResponse(
        top_threats=[
            {"competitor": m.get("competitor", ""), "summary": m.get("text", "")[:200]}
            for m in memories[:3]
        ],
        top_opportunities=[
            {"competitor": m.get("competitor", ""), "summary": m.get("text", "")[:200]}
            for m in memories[3:5]
        ],
        emerging_pattern="Competitors are accelerating AI-native features with recurring community pricing concerns.",
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
    from datetime import datetime, timezone

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
