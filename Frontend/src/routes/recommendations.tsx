import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, X, Sparkles, AlertTriangle, Compass, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PriorityBadge } from "@/components/ui/badges";
import { api, type Recommendation } from "@/lib/api";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — Agent Arena" },
      { name: "description", content: "What to do next, ranked by impact." },
    ],
  }),
  component: Recs,
});

type Status = "open" | "done" | "dismissed";

function Recs() {
  const { data: recs = [] } = useQuery({ queryKey: ["recs"], queryFn: api.listRecommendations });
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: api.listCompetitors });
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [selectedComp, setSelectedComp] = useState<string>("all");

  const update = (id: string, s: Status) => {
    setStatuses((prev) => ({ ...prev, [id]: s }));
    if (s === "done") api.updateRecommendationStatus(id, "implemented").catch(() => {});
    if (s === "dismissed") api.updateRecommendationStatus(id, "dismissed").catch(() => {});
  };

  const order: Record<Recommendation["priority"], number> = { High: 0, Medium: 1, Low: 2 };
  
  const open = recs
    .filter((r) => (statuses[r.id] ?? "open") === "open")
    .sort((a, b) => order[a.priority] - order[b.priority]);

  const filteredOpen = open.filter(
    (r) =>
      selectedComp === "all" ||
      r.competitorId.toLowerCase() === selectedComp.toLowerCase() ||
      r.competitorId === selectedComp
  );

  const done = recs.filter((r) => statuses[r.id] === "done");
  const dismissed = recs.filter((r) => statuses[r.id] === "dismissed");

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Action Center</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">What to do next.</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
        Ranked by strategic impact, based on everything Agent Arena has learned about your competitors.
      </p>

      {/* Filters bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-4 rounded-xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="size-4 text-primary" />
          <label htmlFor="comp-filter" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Filter Competitor:
          </label>
          <select
            id="comp-filter"
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer"
          >
            <option value="all">All Tracked Competitors</option>
            {competitors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          Showing {filteredOpen.length} actionable {filteredOpen.length === 1 ? "recommendation" : "recommendations"}
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {filteredOpen.map((r) => (
          <RecCard
            key={r.id}
            r={r}
            competitorName={competitors.find((c) => c.id === r.competitorId)?.name ?? r.competitorId}
            onImplement={() => update(r.id, "done")}
            onDismiss={() => update(r.id, "dismissed")}
          />
        ))}
        {filteredOpen.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active recommendations match your filters. Agent Arena will surface new actions as patterns emerge.
          </div>
        )}
      </div>

      {(done.length > 0 || dismissed.length > 0) && (
        <div className="mt-10 space-y-6">
          {done.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-foreground">Implemented Actions · {done.length}</h2>
              <ul className="mt-3 space-y-2">
                {done.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    <CheckCircle2 className="size-4 text-[var(--color-threat-low)]" />
                    <span className="line-through opacity-70 font-medium">{r.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {dismissed.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-muted-foreground">Dismissed · {dismissed.length}</h2>
              <ul className="mt-3 space-y-2">
                {dismissed.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm"
                  >
                    <X className="size-4" />
                    <span className="font-medium">{r.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}

function RecCard({
  r,
  competitorName,
  onImplement,
  onDismiss,
}: {
  r: Recommendation;
  competitorName: string;
  onImplement: () => void;
  onDismiss: () => void;
}) {
  const isHigh = r.priority === "High";
  const isMed = r.priority === "Medium";

  const cardStyle = isHigh
    ? "border-[color-mix(in_oklab,var(--color-threat-high)_25%,transparent)] shadow-[0_4px_12px_rgba(220,38,38,0.03)] hover:border-destructive/40 bg-gradient-to-r from-card to-[color-mix(in_oklab,var(--color-threat-high)_2%,transparent)]"
    : isMed
    ? "border-[color-mix(in_oklab,var(--color-threat-med)_30%,transparent)] bg-gradient-to-r from-card to-[color-mix(in_oklab,var(--color-threat-med)_2%,transparent)]"
    : "border-border hover:border-primary/30";

  return (
    <article className={`rounded-xl border-[1.5px] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardStyle}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={r.priority} />
          <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {competitorName}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Sparkles className="size-3 text-primary animate-pulse" /> Reasoned from memory
        </span>
      </div>
      
      <div className="mt-3 flex items-start gap-2 justify-between">
        <h3 className="text-base font-bold tracking-tight text-foreground leading-snug">{r.title}</h3>
        {isHigh && <AlertTriangle className="size-4 text-[var(--color-threat-high)] flex-shrink-0 mt-0.5" />}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.reasoning}</p>
      
      <div className="mt-3 flex flex-wrap gap-1.5">
        {r.sources.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded bg-muted/60 border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            Source: {s}
          </span>
        ))}
      </div>

      <div className="mt-5 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Compass className="size-3.5 text-primary" /> Impact: <span className="text-foreground">{r.impact}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-semibold hover:bg-muted transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onImplement}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 shadow-sm transition-all"
          >
            <CheckCircle2 className="size-3.5" /> Mark as implemented
          </button>
        </div>
      </div>
    </article>
  );
}

