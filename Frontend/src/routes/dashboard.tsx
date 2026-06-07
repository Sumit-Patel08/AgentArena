import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {
  Search,
  Calendar,
  Github,
  MessagesSquare,
  Newspaper,
  MessageCircle,
  FileText,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ThreatBadge, SignalTypeTag } from "@/components/ui/badges";
import { api, type Signal, type Competitor } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — Nazar" },
      { name: "description", content: "Your competitor monitoring dashboard." },
    ],
  }),
  component: Dashboard,
});

const sourceIcon: Record<string, typeof Github> = {
  GitHub: Github,
  Reddit: MessagesSquare,
  "Hacker News": Newspaper,
  Discord: MessageCircle,
  Blog: FileText,
};

function relTime(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function Dashboard() {
  const { data: signals = [] } = useQuery({ queryKey: ["signals"], queryFn: api.listSignals });
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: api.listCompetitors });

  const high = signals.filter((s) => s.threat >= 7).length;
  const med = signals.filter((s) => s.threat >= 4 && s.threat < 7).length;
  const low = signals.filter((s) => s.threat < 4).length;
  const threatData = [
    { name: "High", value: high || 1, color: "var(--color-threat-high)" },
    { name: "Medium", value: med || 1, color: "var(--color-threat-med)" },
    { name: "Low", value: low || 1, color: "var(--color-threat-low)" },
  ];

  const metrics = [
    { l: "Total signals", v: 142, d: "+18", up: true },
    { l: "Active competitors", v: competitors.length || 4, d: "+1", up: true },
    { l: "High threats this week", v: high, d: "+2", up: true, threat: true },
    { l: "New recommendations", v: 5, d: "+3", up: true },
  ];

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search competitors or signals"
              className="h-9 w-64 rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
            <Calendar className="size-3.5" /> Last 6 weeks
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.l} className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{m.v}</p>
            <p
              className={`mt-1 inline-flex items-center gap-1 text-xs ${
                m.up ? "text-[var(--color-threat-low)]" : "text-[var(--color-threat-high)]"
              }`}
            >
              {m.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {m.d} vs last week
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Signal timeline</h2>
            <span className="text-xs text-muted-foreground">{signals.length} signals</span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {signals.slice(0, 8).map((s) => (
              <SignalRow key={s.id} signal={s} competitors={competitors} />
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-sm font-semibold">Threats by level</h2>
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={threatData}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {threatData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-around text-xs">
              {threatData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-sm font-semibold">Top movers this week</h2>
            <ul className="mt-3 space-y-2">
              {competitors.map((c) => {
                const last = c.history[c.history.length - 1];
                const prev = c.history[c.history.length - 2];
                const delta = last.threat - prev.threat;
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded bg-primary/10 text-xs font-medium text-primary">
                        {c.initial}
                      </span>
                      {c.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        delta > 0
                          ? "text-[var(--color-threat-high)]"
                          : delta < 0
                            ? "text-[var(--color-threat-low)]"
                            : "text-muted-foreground"
                      }`}
                    >
                      {delta > 0 ? "▲" : delta < 0 ? "▼" : "→"}{" "}
                      {delta > 0 ? "rising" : delta < 0 ? "cooling" : "steady"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Competitors</h2>
          <Link
            to="/competitor/supabase"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {competitors.map((c) => (
            <CompetitorCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function SignalRow({ signal, competitors }: { signal: Signal; competitors: Competitor[] }) {
  const comp = competitors.find((c) => c.id === signal.competitorId);
  const Icon = sourceIcon[signal.source] ?? FileText;
  return (
    <li className="flex items-start gap-3 py-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
        {comp?.initial ?? "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{comp?.name}</span>
          <SignalTypeTag type={signal.type} />
          <ThreatBadge value={signal.threat} />
          <span className="ml-auto text-xs text-muted-foreground">{relTime(signal.timestamp)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{signal.summary}</p>
        <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Icon className="size-3" /> {signal.source}
        </div>
      </div>
    </li>
  );
}

function CompetitorCard({ c }: { c: Competitor }) {
  return (
    <Link
      to="/competitor/$id"
      params={{ id: c.id }}
      className="group block rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(40,30,90,0.18)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
            {c.initial}
          </span>
          <span className="text-sm font-medium">{c.name}</span>
        </div>
        <ThreatBadge value={c.threat} />
      </div>
      <div className="mt-3 h-12">
        <ResponsiveContainer>
          <AreaChart data={c.history}>
            <defs>
              <linearGradient id={`g-${c.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="threat"
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              fill={`url(#g-${c.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Star className="size-3" /> {c.stars.toLocaleString()}{" "}
          <span className="text-[var(--color-threat-low)]">+{c.starsDelta}</span>
        </span>
        <span>last signal today</span>
      </div>
    </Link>
  );
}
