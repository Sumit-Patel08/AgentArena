import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, X, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PriorityBadge } from "@/components/ui/badges";
import { api, type Recommendation } from "@/lib/api";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — Nazar" },
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

  const update = (id: string, s: Status) =>
    setStatuses((prev) => ({ ...prev, [id]: s }));

  const order: Record<Recommendation["priority"], number> = { High: 0, Medium: 1, Low: 2 };
  const open = recs
    .filter((r) => (statuses[r.id] ?? "open") === "open")
    .sort((a, b) => order[a.priority] - order[b.priority]);
  const done = recs.filter((r) => statuses[r.id] === "done");
  const dismissed = recs.filter((r) => statuses[r.id] === "dismissed");

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Action Center</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">What to do next.</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Ranked by impact, based on everything Nazar has learned about your competitors.
      </p>

      <div className="mt-6 space-y-3">
        {open.map((r) => (
          <RecCard
            key={r.id}
            r={r}
            competitorName={competitors.find((c) => c.id === r.competitorId)?.name ?? r.competitorId}
            onImplement={() => update(r.id, "done")}
            onDismiss={() => update(r.id, "dismissed")}
          />
        ))}
        {open.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            All caught up. Nazar will surface new actions as patterns emerge.
          </div>
        )}
      </div>

      {(done.length > 0 || dismissed.length > 0) && (
        <div className="mt-10 space-y-6">
          {done.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold">Implemented · {done.length}</h2>
              <ul className="mt-3 space-y-2">
                {done.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <CheckCircle2 className="size-4 text-[var(--color-threat-low)]" />
                    <span className="line-through opacity-70">{r.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {dismissed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground">Dismissed · {dismissed.length}</h2>
              <ul className="mt-3 space-y-2">
                {dismissed.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
                  >
                    <X className="size-4" />
                    <span>{r.title}</span>
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
  return (
    <article className="rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-[0_10px_30px_-15px_rgba(40,30,90,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={r.priority} />
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {competitorName}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-primary" /> Reasoned from memory
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{r.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{r.reasoning}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {r.sources.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{r.impact}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm hover:bg-muted"
          >
            Dismiss
          </button>
          <button
            onClick={onImplement}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle2 className="size-3.5" /> Mark as implemented
          </button>
        </div>
      </div>
    </article>
  );
}
