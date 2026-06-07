import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { Star, ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ThreatBadge, SignalTypeTag } from "@/components/ui/badges";
import { api } from "@/lib/api";

export const Route = createFileRoute("/competitor/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Competitor detail · Agent Arena` },
      { name: "description", content: `Memory and pattern insights for ${params.id}.` },
    ],
  }),
  component: CompetitorDetail,
  notFoundComponent: () => (
    <AppShell>
      <p className="text-sm text-muted-foreground">Competitor not found.</p>
    </AppShell>
  ),
});

function CompetitorDetail() {
  const { id } = Route.useParams();
  const { data: competitor } = useQuery({
    queryKey: ["competitor", id],
    queryFn: async () => {
      const c = await api.getCompetitor(id);
      if (!c) throw notFound();
      return c;
    },
  });
  const { data: signals = [] } = useQuery({
    queryKey: ["signals", id],
    queryFn: () => api.signalsFor(id),
  });
  const { data: pattern } = useQuery({
    queryKey: ["pattern", id],
    queryFn: () => api.patternFor(id),
  });
  const { data: recs = [] } = useQuery({
    queryKey: ["recs"],
    queryFn: api.listRecommendations,
  });

  if (!competitor) return <AppShell><div /></AppShell>;

  const events = signals.map((s, i) => {
    const week = `W${Math.min(6, Math.max(1, 6 - Math.floor((Date.now() - +new Date(s.timestamp)) / (7 * 86400_000))))}`;
    return { ...s, week, weekIdx: i };
  });
  const peakWeeks = events.map((e) => e.week);

  const compRecs = recs.filter((r) => r.competitorId === id).slice(0, 3);

  return (
    <AppShell>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to overview
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
            {competitor.initial}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{competitor.name}</h1>
            <p className="text-sm text-muted-foreground">{competitor.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThreatBadge value={competitor.threat} />
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5" /> {competitor.stars.toLocaleString()}
            <span className="text-[var(--color-threat-low)]">+{competitor.starsDelta}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Tracking since {new Date(competitor.trackingSince).toLocaleDateString()}
          </span>
          <label className="inline-flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Watching</span>
            <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary">
              <span className="ml-4 size-4 rounded-full bg-white" />
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Threat over time</h2>
          <span className="text-xs text-muted-foreground">Last 6 weeks</span>
        </div>
        <div className="mt-3 h-64">
          <ResponsiveContainer>
            <AreaChart data={competitor.history}>
              <defs>
                <linearGradient id="ct" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
              <Area type="monotone" dataKey="threat" stroke="var(--color-primary)" strokeWidth={2} fill="url(#ct)" />
              {competitor.history
                .filter((h) => peakWeeks.includes(h.week))
                .map((h) => (
                  <ReferenceDot key={h.week} x={h.week} y={h.threat} r={4} fill="var(--color-primary)" stroke="white" />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {pattern && (
        <div className="mt-6 rounded-xl border-2 border-primary/40 bg-[var(--color-primary-tint)] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> Pattern insight
          </div>
          <p className="mt-2 text-base text-foreground">{pattern}</p>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-sm font-semibold">Memory · event timeline</h2>
          <ol className="relative mt-4 space-y-4 pl-5">
            <span aria-hidden className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
            {signals.map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[18px] top-1.5 size-2 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.timestamp).toLocaleDateString()}
                  </span>
                  <SignalTypeTag type={s.type} />
                  <ThreatBadge value={s.threat} />
                  <span className="text-[11px] text-muted-foreground">· {s.source}</span>
                </div>
                <p className="mt-1 text-sm">{s.summary}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Recommended actions</h2>
          {compRecs.length === 0 && (
            <p className="text-sm text-muted-foreground">No actions for this competitor right now.</p>
          )}
          {compRecs.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-background p-4">
              <span className="text-xs font-medium text-primary">{r.priority} priority</span>
              <h3 className="mt-1 text-sm font-semibold">{r.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.reasoning}</p>
              <Link
                to="/recommendations"
                className="mt-3 inline-flex items-center text-xs text-primary hover:underline"
              >
                Open in Action Center →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
