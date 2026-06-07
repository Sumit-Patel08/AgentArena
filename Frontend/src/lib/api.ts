export type ThreatLevel = "high" | "medium" | "low";
export type SignalType =
  | "feature_release"
  | "community_growth"
  | "announcement"
  | "security_issue"
  | "content";
export type Source = "GitHub" | "Reddit" | "Hacker News" | "Discord" | "Blog";

export interface Signal {
  id: string;
  competitorId: string;
  type: SignalType;
  threat: number;
  summary: string;
  source: Source;
  timestamp: string;
}

export interface Competitor {
  id: string;
  name: string;
  initial: string;
  description: string;
  stars: number;
  starsDelta: number;
  trackingSince: string;
  threat: number;
  history: { week: string; threat: number; signals: number }[];
}

export interface Recommendation {
  id: string;
  priority: "High" | "Medium" | "Low";
  title: string;
  reasoning: string;
  competitorId: string;
  sources: string[];
  impact: string;
}

export interface ChatSource {
  competitor: string;
  date: string;
  threat_score: number;
}

export interface ChatResponse {
  answer: string;
  memories_used: number;
  sources: ChatSource[];
}

export interface CollectResponse {
  collected: number;
  new_signals: number;
}

export interface DigestResponse {
  top_threats: { competitor?: string; summary?: string }[];
  top_opportunities: { competitor?: string; summary?: string }[];
  emerging_pattern: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

type BackendSignal = {
  id: string;
  competitor: string;
  signal_type: string;
  threat_score: number;
  summary: string;
  source: string;
  source_url: string;
  date: string;
};

type BackendCompetitorSummary = {
  id: string;
  name: string;
  description?: string;
  threat_score: number;
  stars: number;
  stars_delta_week: number;
  last_signal_date: string;
  sparkline: number[];
};

type BackendCompetitorDetail = BackendCompetitorSummary & {
  tracking_since: string;
  pattern_insight: string;
  events: BackendSignal[];
};

type BackendRecommendation = {
  id: string;
  priority: string;
  title: string;
  reasoning: string;
  competitor: string;
  impact: string;
  source_signal_ids: string[];
  status: string;
};

const DESCRIPTIONS: Record<string, string> = {
  supabase: "Open-source Firebase alternative. Postgres + auth + storage.",
  appwrite: "Self-hosted backend platform for web, mobile, and Flutter.",
  pocketbase: "Open-source backend in a single file. SQLite under the hood.",
  convex: "Reactive backend for TypeScript apps. End-to-end type safe.",
};

function mapSignal(s: BackendSignal): Signal {
  return {
    id: s.id,
    competitorId: s.competitor,
    type: (s.signal_type as SignalType) || "announcement",
    threat: s.threat_score,
    summary: s.summary,
    source: (s.source as Source) || "GitHub",
    timestamp: s.date,
  };
}

function mapCompetitor(c: BackendCompetitorSummary | BackendCompetitorDetail): Competitor {
  return {
    id: c.id,
    name: c.name,
    initial: c.name.charAt(0).toUpperCase(),
    description: c.description || DESCRIPTIONS[c.id] || "",
    stars: c.stars,
    starsDelta: c.stars_delta_week,
    trackingSince: "tracking_since" in c ? c.tracking_since : "",
    threat: c.threat_score,
    history: c.sparkline.map((threat, i) => ({
      week: `W${i + 1}`,
      threat,
      signals: 0,
    })),
  };
}

export interface WorkspaceCompetitor {
  id: string;
  name: string;
  description: string;
  github_owner?: string;
  github_repo?: string;
  website?: string;
}

export interface WorkspaceInfo {
  configured: boolean;
  company_name: string;
  website: string;
  domain: string;
  email: string;
  competitors: WorkspaceCompetitor[];
  using_demo_data: boolean;
  signals_count: number;
}

function mapRecommendation(r: BackendRecommendation): Recommendation {
  const p = r.priority.toLowerCase();
  const priority =
    p === "high" ? "High" : p === "low" ? "Low" : ("Medium" as const);
  return {
    id: r.id,
    priority,
    title: r.title,
    reasoning: r.reasoning,
    competitorId: r.competitor,
    sources: r.source_signal_ids,
    impact: r.impact,
  };
}

export const api = {
  health: () => fetchJson<{ status: string; service: string }>("/api/health"),

  listCompetitors: async (): Promise<Competitor[]> => {
    const data = await fetchJson<BackendCompetitorSummary[]>("/api/competitors");
    return data.map(mapCompetitor);
  },

  getCompetitor: async (id: string): Promise<Competitor | undefined> => {
    try {
      const data = await fetchJson<BackendCompetitorDetail>(`/api/competitors/${id}`);
      return mapCompetitor(data);
    } catch {
      return undefined;
    }
  },

  listSignals: async (): Promise<Signal[]> => {
    const data = await fetchJson<BackendSignal[]>("/api/signals");
    return data.map(mapSignal);
  },

  signalsFor: async (competitorId: string): Promise<Signal[]> => {
    const data = await fetchJson<BackendSignal[]>(
      `/api/signals?competitor=${encodeURIComponent(competitorId)}`,
    );
    return data.map(mapSignal).sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  },

  listRecommendations: async (): Promise<Recommendation[]> => {
    const data = await fetchJson<BackendRecommendation[]>("/api/recommendations");
    return data.map(mapRecommendation);
  },

  patternFor: async (id: string): Promise<string | null> => {
    try {
      const data = await fetchJson<BackendCompetitorDetail>(`/api/competitors/${id}`);
      return data.pattern_insight || null;
    } catch {
      return null;
    }
  },

  getMetrics: async () =>
    fetchJson<{
      total_signals: number;
      active_competitors: number;
      high_threats_week: number;
      new_recommendations: number;
      deltas: Record<string, string>;
    }>("/api/metrics"),

  chat: (question: string, useMemory: boolean) =>
    fetchJson<ChatResponse>("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, use_memory: useMemory }),
    }),

  runCollect: () =>
    fetchJson<CollectResponse>("/api/collect/run", { method: "POST" }),

  getDigest: () => fetchJson<DigestResponse>("/api/digest", { method: "POST" }),

  updateRecommendationStatus: async (id: string, status: "implemented" | "dismissed") =>
    fetchJson<BackendRecommendation>(`/api/recommendations/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),

  getWorkspace: () => fetchJson<WorkspaceInfo>("/api/workspace"),

  discoverCompetitors: (body: {
    company_name: string;
    website: string;
    domain?: string;
    industry?: string;
  }) =>
    fetchJson<{ competitors: WorkspaceCompetitor[]; count: number }>("/api/workspace/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  setupWorkspace: (body: {
    company_name: string;
    website: string;
    email?: string;
    domain?: string;
    industry?: string;
    competitors?: WorkspaceCompetitor[];
    run_collection?: boolean;
  }) =>
    fetchJson<WorkspaceInfo>("/api/workspace/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  resetWorkspace: () =>
    fetchJson<WorkspaceInfo>("/api/workspace/reset", { method: "POST" }),
};

export const API_BASE_URL = API_BASE;
