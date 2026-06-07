"""RAG recommendation generator."""

from __future__ import annotations

import logging
import uuid
from collections import defaultdict

from llm import groq_complete, parse_json_response
from memory import recall_async
from store import get_signals

logger = logging.getLogger(__name__)

REC_SYSTEM = """You are a competitive intelligence analyst.
Based on the competitor signals provided, generate a specific, actionable recommendation
for what the product team should do in the next 48 hours.
Do NOT use thinking tags or reasoning blocks.
Return ONLY valid JSON with no markdown fences:
{"title":"...", "reasoning":"...", "impact":"...", "priority":"high|medium|low"}
The reasoning must cite specific signals and explain why action is needed now."""


def _format_signals(signals: list[dict]) -> str:
    lines = []
    for i, s in enumerate(signals):
        lines.append(
            f"[{i + 1}] {s.get('date', '')} | threat {s.get('threat_score', 5)}/10 | "
            f"{s.get('summary', s.get('text', ''))}"
        )
    return "\n".join(lines)


def _priority_rank(priority: str) -> int:
    return {"high": 0, "medium": 1, "low": 2}.get(priority, 3)


def _fallback_recommendation(competitor: str, signals: list[dict]) -> dict:
    top = max(signals, key=lambda s: int(s.get("threat_score", 5)))
    score = int(top.get("threat_score", 7))
    priority = "high" if score >= 8 else "medium"
    return {
        "id": str(uuid.uuid4())[:8],
        "priority": priority,
        "title": f"Respond to {competitor}'s latest competitive move within 48 hours",
        "reasoning": (
            f"Recent signals show {competitor} activity at threat level {score}/10: "
            f"{top.get('summary', top.get('text', ''))[:200]}. "
            "Competitors are moving fast on AI-native features — delay risks user churn."
        ),
        "competitor": competitor,
        "impact": "Maintain feature parity and reduce competitive pressure",
        "source_signal_ids": [s.get("id", f"mem-{i}") for i, s in enumerate(signals[:3])],
        "status": "open",
    }


async def generate_recommendations() -> list[dict]:
    store_signals = get_signals(limit=100)
    high_threat = [s for s in store_signals if int(s.get("threat_score", 0)) >= 6]

    if not high_threat:
        memories = await recall_async("high threat competitor activity recent", k=10)
        high_threat = [
            {
                "id": f"mem-{i}",
                "competitor": m.get("competitor", "unknown"),
                "threat_score": m.get("threat_score", 7),
                "summary": m.get("text", ""),
                "date": m.get("date", ""),
            }
            for i, m in enumerate(memories)
            if int(m.get("threat_score", 5)) >= 6 or m.get("text")
        ]

    if not high_threat:
        high_threat = store_signals[:8]

    by_competitor: dict[str, list[dict]] = defaultdict(list)
    for sig in high_threat:
        comp = sig.get("competitor", "unknown")
        if comp == "unknown":
            continue
        by_competitor[comp].append(sig)

    recommendations: list[dict] = []
    for competitor, comp_signals in by_competitor.items():
        context = _format_signals(comp_signals)
        user = f"Competitor: {competitor}\n\nSignals:\n{context}"

        try:
            raw = await groq_complete(REC_SYSTEM, user, temperature=0.2, max_tokens=800)
            parsed = parse_json_response(raw)
            if not parsed:
                recommendations.append(_fallback_recommendation(competitor, comp_signals))
                continue

            priority = str(parsed.get("priority", "medium")).lower()
            if priority not in ("high", "medium", "low"):
                priority = "medium"

            recommendations.append(
                {
                    "id": str(uuid.uuid4())[:8],
                    "priority": priority,
                    "title": str(parsed.get("title", f"Monitor {competitor} activity"))[:200],
                    "reasoning": str(parsed.get("reasoning", ""))[:600],
                    "competitor": competitor,
                    "impact": str(parsed.get("impact", "Improved competitive positioning"))[:200],
                    "source_signal_ids": [s.get("id", f"mem-{i}") for i, s in enumerate(comp_signals[:3])],
                    "status": "open",
                }
            )
        except Exception as exc:
            logger.exception("Failed to generate recommendation for %s: %s", competitor, exc)
            recommendations.append(_fallback_recommendation(competitor, comp_signals))

    recommendations.sort(key=lambda r: _priority_rank(r.get("priority", "low")))
    return recommendations
