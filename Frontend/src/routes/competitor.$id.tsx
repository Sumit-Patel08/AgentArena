import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  ArrowLeft,
  Sparkles,
  Globe,
  Shield,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  Compass,
} from "lucide-react";
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
  const [tab, setTab] = useState<"feed" | "intel">("feed");

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
  const { data: pattern, isLoading: isPatternLoading } = useQuery({
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


  const compRecs = recs
    .filter(
      (r) =>
        r.competitorId === id ||
        r.competitorId.toLowerCase() === id.toLowerCase() ||
        r.competitorId.toLowerCase() === competitor?.name.toLowerCase(),
    )
    .slice(0, 3);

  return (
    <AppShell>
      <Link
        to="/competitors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to competitors
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-xl bg-primary/10 text-xl font-bold text-primary shadow-sm border border-primary/20">
            {competitor.initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{competitor.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">{competitor.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/80">
          <ThreatBadge value={competitor.threat} />
          <span className="h-4 w-px bg-border" />
          {competitor.website && (
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <Globe className="size-3.5" /> Site <Compass className="size-3" />
            </a>
          )}
          <span className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            Tracked since {new Date(competitor.trackingSince).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border">
        <button
          onClick={() => setTab("feed")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            tab === "feed"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Strategic Activity Feed
        </button>
        <button
          onClick={() => setTab("intel")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            tab === "intel"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Profile & Market Intel
        </button>
      </div>

      {tab === "feed" && (
        <div className="space-y-6">


          {/* Pattern Insight */}
          {(pattern || isPatternLoading) && (
            <div className="rounded-xl border-[1.5px] border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className={`size-4 ${isPatternLoading ? "animate-pulse text-primary/60" : ""}`} /> Pattern insight
              </div>
              {isPatternLoading ? (
                <div className="mt-2 space-y-2 animate-pulse">
                  <div className="h-4 bg-primary/10 rounded w-[90%]" />
                  <div className="h-4 bg-primary/10 rounded w-[70%]" />
                </div>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-foreground font-medium">{pattern}</p>
              )}
            </div>
          )}

          {/* Grid: Events and Actions */}
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Timeline */}
            <div className="rounded-xl border-[1.5px] border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-bold text-foreground">Competitor Signal Timeline</h2>
              <p className="text-xs text-muted-foreground">Historical milestones and intelligence captures.</p>
              
              <ol className="relative mt-6 space-y-5 pl-6">
                <span aria-hidden className="absolute left-2.5 top-1.5 bottom-1 w-0.5 bg-border" />
                {signals.map((s) => {
                  const isHighThreat = s.threat >= 7;
                  return (
                    <li key={s.id} className="relative group">
                      <span className={`absolute -left-[20px] top-1.5 size-2.5 rounded-full border-2 border-background transition-transform group-hover:scale-125 ${
                        isHighThreat ? "bg-[var(--color-threat-high)] shadow-[0_0_8px_rgba(220,38,38,0.5)]" : "bg-primary"
                      }`} />
                      <div className={`rounded-xl border-[1.5px] p-4 transition-all duration-200 hover:border-primary/30 ${
                        isHighThreat 
                          ? "bg-[color-mix(in_oklab,var(--color-threat-high)_4%,transparent)] border-[color-mix(in_oklab,var(--color-threat-high)_15%,transparent)]" 
                          : "bg-muted/10 border-border"
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" /> {new Date(s.timestamp).toLocaleDateString()}
                            </span>
                            <SignalTypeTag type={s.type} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                              {s.source}
                            </span>
                            <ThreatBadge value={s.threat} />
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground font-medium">{s.summary}</p>

                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground">Strategic Actions Required</h2>
              {compRecs.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No critical recommendations surfaced for this competitor.
                </div>
              )}
              {compRecs.map((r) => {
                const isHigh = r.priority === "High";
                return (
                  <div 
                    key={r.id} 
                    className={`rounded-xl border-[1.5px] p-5 shadow-sm transition-all hover:shadow-md ${
                      isHigh 
                        ? "border-[color-mix(in_oklab,var(--color-threat-high)_30%,transparent)] bg-gradient-to-br from-card to-[color-mix(in_oklab,var(--color-threat-high)_4%,transparent)]" 
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isHigh ? "bg-[var(--color-threat-high)]/10 text-[var(--color-threat-high)]" : "bg-primary/10 text-primary"
                      }`}>
                        {r.priority} Priority
                      </span>
                      {isHigh && <AlertTriangle className="size-4 text-[var(--color-threat-high)]" />}
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-foreground leading-snug">{r.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.reasoning}</p>
                    
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[140px] flex items-center gap-1">
                        <FileText className="size-3" /> Impact: {r.impact}
                      </span>
                      <Link
                        to="/recommendations"
                        className="inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:underline"
                      >
                        Action Center →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "intel" && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Competitor Profile Info */}
          <div className="rounded-xl border-[1.5px] border-border bg-gradient-to-b from-card to-muted/10 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Competitor Profile</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {competitor.description}
            </p>

            <div className="mt-6 space-y-4">
              {competitor.website && (
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Globe className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Corporate Website</p>
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:underline break-all inline-flex items-center gap-1"
                    >
                      {competitor.website} <Compass className="size-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Monitoring Activated</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(competitor.trackingSince).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Signal Trust Level</p>
                  <p className="text-sm font-semibold text-foreground">98% Verified Corporate News & Filings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scraper Configuration details */}
          <div className="rounded-xl border-[1.5px] border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Intelligence Scrapers</h2>
            <p className="mt-1 text-xs text-muted-foreground leading-normal">
              Active ingestion scrapers and endpoints monitored for {competitor.name}.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-lg border-[1.5px] border-border bg-muted/20 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Regulatory Press RSS</span>
                <p className="mt-1 text-xs font-semibold text-foreground leading-relaxed">
                  Ingesting corporate news feeds, regulatory warnings, product announcements, and press logs.
                </p>
              </div>

              <div className="rounded-lg border-[1.5px] border-border bg-muted/20 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Social Sentiment Indices</span>
                <p className="mt-1 text-xs font-semibold text-foreground leading-relaxed">
                  Scanning Reddit discussions and Hacker News threads for industry conversations and threat indicators.
                </p>
              </div>

              <div className="rounded-lg border-[1.5px] border-border bg-muted/20 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Registry Feeds</span>
                <p className="mt-1 text-xs font-semibold text-foreground leading-relaxed">
                  Indexing patent applications, licensing registrations, and international drug directory updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

