import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Star, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ThreatBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";

export const Route = createFileRoute("/competitors")({
  head: () => ({
    meta: [{ title: "Competitors — Agent Arena" }],
  }),
  component: CompetitorsList,
});

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

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            to="/competitor/$id"
            params={{ id: c.id }}
            className="rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                  {c.initial}
                </span>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
              </div>
              <ThreatBadge value={c.threat} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3" /> {c.stars.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-primary">
                View detail <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && !isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">No competitors match "{q}".</p>
      )}
    </AppShell>
  );
}
