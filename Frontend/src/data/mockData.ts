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
  threat: number; // 1-10
  summary: string;
  source: Source;
  timestamp: string; // ISO
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

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();

export const competitors: Competitor[] = [
  {
    id: "supabase",
    name: "Supabase",
    initial: "S",
    description: "Open-source Firebase alternative. Postgres + auth + storage.",
    stars: 74210,
    starsDelta: 642,
    trackingSince: "2025-04-22",
    threat: 8,
    history: [
      { week: "W1", threat: 4, signals: 3 },
      { week: "W2", threat: 5, signals: 5 },
      { week: "W3", threat: 6, signals: 4 },
      { week: "W4", threat: 7, signals: 6 },
      { week: "W5", threat: 7, signals: 8 },
      { week: "W6", threat: 8, signals: 9 },
    ],
  },
  {
    id: "appwrite",
    name: "Appwrite",
    initial: "A",
    description: "Self-hosted backend platform for web, mobile, and Flutter.",
    stars: 45120,
    starsDelta: 318,
    trackingSince: "2025-04-22",
    threat: 5,
    history: [
      { week: "W1", threat: 3, signals: 2 },
      { week: "W2", threat: 3, signals: 3 },
      { week: "W3", threat: 4, signals: 4 },
      { week: "W4", threat: 4, signals: 5 },
      { week: "W5", threat: 5, signals: 6 },
      { week: "W6", threat: 5, signals: 5 },
    ],
  },
  {
    id: "pocketbase",
    name: "PocketBase",
    initial: "P",
    description: "Open-source backend in a single file. SQLite under the hood.",
    stars: 41980,
    starsDelta: 224,
    trackingSince: "2025-04-22",
    threat: 6,
    history: [
      { week: "W1", threat: 4, signals: 2 },
      { week: "W2", threat: 4, signals: 3 },
      { week: "W3", threat: 5, signals: 4 },
      { week: "W4", threat: 5, signals: 4 },
      { week: "W5", threat: 6, signals: 5 },
      { week: "W6", threat: 6, signals: 6 },
    ],
  },
  {
    id: "convex",
    name: "Convex",
    initial: "C",
    description: "Reactive backend for TypeScript apps. End-to-end type safe.",
    stars: 6420,
    starsDelta: 142,
    trackingSince: "2025-04-22",
    threat: 6,
    history: [
      { week: "W1", threat: 3, signals: 1 },
      { week: "W2", threat: 4, signals: 2 },
      { week: "W3", threat: 4, signals: 3 },
      { week: "W4", threat: 5, signals: 3 },
      { week: "W5", threat: 5, signals: 4 },
      { week: "W6", threat: 6, signals: 5 },
    ],
  },
];

export const signals: Signal[] = [
  {
    id: "s1",
    competitorId: "supabase",
    type: "feature_release",
    threat: 8,
    summary:
      "Launched native vector search (pgvector) in GA, directly targeting AI-native apps.",
    source: "GitHub",
    timestamp: daysAgo(0.25),
  },
  {
    id: "s2",
    competitorId: "appwrite",
    type: "community_growth",
    threat: 5,
    summary: "Discord crossed 12,000 members, up 40% in six weeks.",
    source: "Discord",
    timestamp: daysAgo(1),
  },
  {
    id: "s3",
    competitorId: "pocketbase",
    type: "feature_release",
    threat: 6,
    summary:
      "v0.22 adds realtime subscriptions, closing the gap with Supabase.",
    source: "GitHub",
    timestamp: daysAgo(2),
  },
  {
    id: "s4",
    competitorId: "supabase",
    type: "announcement",
    threat: 7,
    summary: "Raised a Series C; signals aggressive enterprise hiring.",
    source: "Hacker News",
    timestamp: daysAgo(4),
  },
  {
    id: "s5",
    competitorId: "convex",
    type: "feature_release",
    threat: 6,
    summary: "Shipped reactive queries with end-to-end type safety.",
    source: "Blog",
    timestamp: daysAgo(6),
  },
  {
    id: "s6",
    competitorId: "appwrite",
    type: "security_issue",
    threat: 4,
    summary: "Patched an auth token edge case reported by community.",
    source: "GitHub",
    timestamp: daysAgo(9),
  },
  {
    id: "s7",
    competitorId: "supabase",
    type: "content",
    threat: 6,
    summary: "Blog post: 'Building AI agents on Postgres' hit HN front page.",
    source: "Reddit",
    timestamp: daysAgo(12),
  },
  {
    id: "s8",
    competitorId: "supabase",
    type: "feature_release",
    threat: 7,
    summary: "Beta: edge functions with streaming responses for LLMs.",
    source: "GitHub",
    timestamp: daysAgo(18),
  },
  {
    id: "s9",
    competitorId: "pocketbase",
    type: "community_growth",
    threat: 5,
    summary: "Hit 42k GitHub stars; trending in Go and self-hosted categories.",
    source: "GitHub",
    timestamp: daysAgo(22),
  },
  {
    id: "s10",
    competitorId: "supabase",
    type: "feature_release",
    threat: 7,
    summary: "Released 'Studio' v2 with built-in AI SQL assistant.",
    source: "GitHub",
    timestamp: daysAgo(28),
  },
  {
    id: "s11",
    competitorId: "convex",
    type: "content",
    threat: 4,
    summary: "Tutorial series on building agents got 320 Reddit upvotes.",
    source: "Reddit",
    timestamp: daysAgo(31),
  },
  {
    id: "s12",
    competitorId: "supabase",
    type: "feature_release",
    threat: 6,
    summary: "Vector embeddings tutorial; first hint at pgvector GA roadmap.",
    source: "Blog",
    timestamp: daysAgo(38),
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "r1",
    priority: "High",
    title: "Publish a roadmap post addressing vector search.",
    reasoning:
      "Supabase shipped vector search (pgvector) in GA. Your community has requested this 17 times across Discord and GitHub. Historically, a roadmap post within 48 hours retains 60%+ of at-risk users.",
    competitorId: "supabase",
    sources: ["GitHub release", "17 community requests"],
    impact: "Est. impact: high — user retention",
  },
  {
    id: "r2",
    priority: "High",
    title: "Ship a better quickstart guide this week.",
    reasoning:
      "Appwrite's growth is community-led, not feature-led. Opportunity: their docs are weak — 14 Reddit complaints in the last six weeks. A polished quickstart can convert their frustrated users.",
    competitorId: "appwrite",
    sources: ["Discord growth", "14 Reddit threads"],
    impact: "Est. impact: medium — top-of-funnel",
  },
  {
    id: "r3",
    priority: "Medium",
    title: "Benchmark realtime latency vs. PocketBase v0.22.",
    reasoning:
      "PocketBase just closed the realtime gap. The last time a competitor matched a key feature you waited two weeks to publish numbers — and lost the narrative on HN. Move first this time.",
    competitorId: "pocketbase",
    sources: ["GitHub v0.22 release"],
    impact: "Est. impact: medium — positioning",
  },
  {
    id: "r4",
    priority: "Medium",
    title: "Counter Convex's type-safety narrative.",
    reasoning:
      "Convex is winning the 'end-to-end TypeScript' story with shipped reactive queries plus tutorials. Publish a comparison page showing how your stack already covers this with fewer lock-in tradeoffs.",
    competitorId: "convex",
    sources: ["Convex blog", "Reddit tutorial 320↑"],
    impact: "Est. impact: medium — competitive comparison",
  },
  {
    id: "r5",
    priority: "Low",
    title: "Monitor Supabase enterprise hires on LinkedIn.",
    reasoning:
      "Series C plus aggressive enterprise hiring usually precedes a new pricing tier within 90 days. Set a memory trigger to alert when their pricing page changes.",
    competitorId: "supabase",
    sources: ["HN funding thread"],
    impact: "Est. impact: low — early signal",
  },
];

export const patternInsight = {
  supabase:
    "Supabase has shipped 3 AI-adjacent features in 6 weeks — an unusually fast cadence. The last two times they shipped AI features you lost 8% of users within 60 days, but both times their pricing drew backlash. The same pattern is starting again. This is an opportunity, not just a threat.",
};
