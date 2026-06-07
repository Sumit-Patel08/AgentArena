from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SignalType(str, Enum):
    feature_release = "feature_release"
    community_growth = "community_growth"
    security_issue = "security_issue"
    deprecation = "deprecation"
    announcement = "announcement"


class Priority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class RecommendationStatus(str, Enum):
    open = "open"
    implemented = "implemented"
    dismissed = "dismissed"


class Signal(BaseModel):
    id: str
    competitor: str
    signal_type: SignalType
    threat_score: int = Field(ge=1, le=10)
    summary: str
    source: str
    source_url: str
    date: str


class ThreatPoint(BaseModel):
    date: str
    score: int = Field(ge=1, le=10)


class CompetitorSummary(BaseModel):
    id: str
    name: str
    threat_score: int = Field(ge=1, le=10)
    stars: int
    stars_delta_week: int
    last_signal_date: str
    sparkline: list[int] = Field(min_length=6, max_length=6)


class Recommendation(BaseModel):
    id: str
    priority: Priority
    title: str
    reasoning: str
    competitor: str
    impact: str
    source_signal_ids: list[str]
    status: RecommendationStatus = RecommendationStatus.open


class CompetitorDetail(CompetitorSummary):
    tracking_since: str
    threat_over_time: list[ThreatPoint]
    events: list[Signal]
    pattern_insight: str
    recommendations: list[Recommendation]


class SourceCitation(BaseModel):
    competitor: str
    date: str
    threat_score: int


class ChatRequest(BaseModel):
    question: str
    use_memory: bool = True


class ChatResponse(BaseModel):
    answer: str
    memories_used: int
    sources: list[SourceCitation]


class MetricsDeltas(BaseModel):
    total_signals: str = "+0"
    active_competitors: str = "+0"
    high_threats_week: str = "+0"
    new_recommendations: str = "+0"


class Metrics(BaseModel):
    total_signals: int
    active_competitors: int
    high_threats_week: int
    new_recommendations: int
    deltas: MetricsDeltas | dict[str, Any]


class DigestResponse(BaseModel):
    top_threats: list[dict[str, Any]]
    top_opportunities: list[dict[str, Any]]
    emerging_pattern: str


class CollectRunResponse(BaseModel):
    collected: int
    new_signals: int


class HealthResponse(BaseModel):
    status: str
    service: str = "agent-arena-backend"


class RecommendationStatusUpdate(BaseModel):
    status: RecommendationStatus
