import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ArrowRight, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ThreatBadge } from "@/components/ui/badges";
import { api, type Competitor } from "@/lib/api";

export const Route = createFileRoute("/competitors")({
  head: () => ({
    meta: [{ title: "Competitors — Agent Arena" }],
  }),
  component: CompetitorsList,
});

function getSector(desc: string) {
  const d = desc.toLowerCase();
  if (
    d.includes("pharma") ||
    d.includes("medication") ||
    d.includes("drug") ||
    d.includes("healthcare") ||
    d.includes("api")
  ) {
    return "Healthcare & Pharma";
  }
  if (
    d.includes("firebase") ||
    d.includes("backend") ||
    d.includes("sqlite") ||
    d.includes("database") ||
    d.includes("typescript")
  ) {
    return "Dev Infrastructure";
  }
  return "Market Competitor";
}

function CompetitorsList() {
  const [q, setQ] = useState("");
  const { data: competitors = [], isLoading } = useQuery({
    queryKey: ["competitors"],
    queryFn: api.listCompetitors,
  });

  const filtered = competitors.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.id.toLowerCase().includes(q.toLowerCase()) ||
      c.description.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Competitors</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {competitors.length} tracked · live from backend
      </p>

      <div className="relative mt-4 max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search competitors…"
          className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {filtered.map((c) => {
          const sector = getSector(c.description);
          
          // Determine threat trend based on history
          let trend = "stable";
          if (c.history && c.history.length >= 2) {
            const last = c.history[c.history.length - 1].threat;
            const prev = c.history[0].threat; // compare overall timeline trend
            if (last > prev) trend = "rising";
            if (last < prev) trend = "falling";
          }

          // Generate SVG Sparkline polyline coordinates
          const sparkWidth = 64;
          const sparkHeight = 16;
          const points = c.history && c.history.length > 0
            ? c.history
                .map((h, i) => {
                  const x = (i * sparkWidth) / (c.history.length - 1);
                  const y = sparkHeight - (h.threat * (sparkHeight - 2)) / 10 - 1;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ")
            : "";

          return (
            <Link
              key={c.id}
              to="/competitor/$id"
              params={{ id: c.id }}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-gradient-to-b from-card to-muted/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_24px_-8px_rgba(91,75,214,0.12)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      {c.initial}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {c.name}
                      </p>
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60">
                        {sector}
                      </span>
                    </div>
                  </div>
                  <ThreatBadge value={c.threat} />
                </div>
                
                <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {trend === "rising" && (
                    <span className="inline-flex items-center gap-0.5 text-[var(--color-threat-high)] font-medium">
                      <TrendingUp className="size-3.5" /> Rising threat
                    </span>
                  )}
                  {trend === "falling" && (
                    <span className="inline-flex items-center gap-0.5 text-[var(--color-threat-low)] font-medium">
                      <TrendingDown className="size-3.5" /> Receding threat
                    </span>
                  )}
                  {trend === "stable" && (
                    <span className="inline-flex items-center gap-0.5 text-muted-foreground font-medium">
                      <Minus className="size-3.5" /> Stable activity
                    </span>
                  )}

                  {points && (
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-muted-foreground">Trend:</span>
                      <svg width={sparkWidth} height={sparkHeight} className="stroke-primary fill-none stroke-[1.5]">
                        <polyline points={points} />
                      </svg>
                    </div>
                  )}
                </div>

                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  Intel Center <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && !isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">No competitors match "{q}".</p>
      )}
    </AppShell>
  );
}

