import {
  competitors,
  signals,
  recommendations,
  patternInsight,
  type Competitor,
  type Signal,
  type Recommendation,
} from "@/data/mockData";

const wait = <T,>(v: T, ms = 0) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const api = {
  listCompetitors: () => wait(competitors),
  getCompetitor: (id: string) =>
    wait<Competitor | undefined>(competitors.find((c) => c.id === id)),
  listSignals: () =>
    wait(
      [...signals].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    ),
  signalsFor: (competitorId: string) =>
    wait(
      signals
        .filter((s) => s.competitorId === competitorId)
        .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)),
    ),
  listRecommendations: () => wait(recommendations),
  patternFor: (id: string) =>
    wait<string | undefined>((patternInsight as Record<string, string>)[id]),
};

export type { Competitor, Signal, Recommendation };
