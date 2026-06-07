import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ThreatBadge, SignalTypeTag } from "@/components/ui/badges";
import { Card4 } from "@/components/ui/card-4";
import {
  ArrowRight,
  Github,
  MessagesSquare,
  Newspaper,
  Brain,
  Activity,
  Sparkles,
  CheckCircle2,
  Quote,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Arena — Know what your competitors did, before your users tell you" },
      {
        name: "description",
        content:
          "Agent Arena watches every competitor across GitHub, Reddit, and the web, remembers everything, and tells you exactly what to do next.",
      },
      { property: "og:title", content: "Agent Arena — Competitive intelligence on autopilot" },
      {
        property: "og:description",
        content:
          "Continuous monitoring with memory. Patterns, not just alerts. Recommended actions for indie hackers and small teams.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SiteLayout showAnnouncement>
      <Hero />
      <TrustBar />
      <ArenaShowcase />
      <Problem />
      <Features />
      <MemorySection />
      <Metrics />
      <FinalCTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 10%, transparent), transparent 70%)",
        }}
      />
      <div className="container-x pt-16 pb-12 text-center md:pt-24 md:pb-20 fade-up">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Competitive intelligence, on autopilot
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Know what your competitors did —{" "}
          <span className="font-bold text-foreground">
            before your users tell you.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
          Agent Arena watches every competitor across GitHub, Reddit, and the web, remembers
          everything, and tells you exactly what to do next.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started free
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            See it in action
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card · Tracks unlimited competitors · Set up in 5 minutes.
        </p>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="mx-auto mt-14 max-w-5xl">
      <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_30px_60px_-30px_rgba(40,30,90,0.25)]">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 text-xs text-muted-foreground">agentarena.app / overview</span>
        </div>
        <div className="rounded-xl bg-[var(--color-surface)] p-5 text-left">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { l: "Total signals", v: "142", d: "+18" },
              { l: "Active competitors", v: "4", d: "+1" },
              { l: "High threats", v: "3", d: "+2" },
              { l: "Recommendations", v: "5", d: "+3" },
            ].map((m) => (
              <div key={m.l} className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] text-muted-foreground">{m.l}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{m.v}</p>
                <p className="text-[11px] text-[var(--color-threat-low)]">▲ {m.d} this week</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {[
              {
                n: "S",
                name: "Supabase",
                t: "feature_release",
                threat: 8,
                s: "Launched native vector search (pgvector) in GA, targeting AI-native apps.",
                ago: "6h ago",
              },
              {
                n: "P",
                name: "PocketBase",
                t: "feature_release",
                threat: 6,
                s: "v0.22 adds realtime subscriptions, closing the gap with Supabase.",
                ago: "2d ago",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                  {s.n}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <SignalTypeTag type={s.t} />
                    <ThreatBadge value={s.threat} />
                    <span className="ml-auto text-xs text-muted-foreground">{s.ago}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="container-x py-16">
      <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Watching the fastest-moving projects
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-semibold tracking-tight text-muted-foreground/80">
        {["Supabase", "Appwrite", "PocketBase", "Convex", "Neon"].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </section>
  );
}

function ArenaShowcase() {
  const items = [
    {
      title: "Supabase GA Vector Search",
      description: "Launched native vector database capabilities (pgvector) in GA, directly targeting AI-native application architectures.",
      imageSrc: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      threat: 8,
    },
    {
      title: "PocketBase Realtime Sync",
      description: "v0.22 release introduces native realtime subscriptions, closing the offline-sync gap for client-heavy web applications.",
      imageSrc: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
      threat: 6,
    },
    {
      title: "Appwrite Cloud Pro Launch",
      description: "Unveiled their managed Cloud Pro plan, shifting focus upstream towards startup and enterprise-scale workloads.",
      imageSrc: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      threat: 7,
    },
  ];

  return (
    <section className="container-x py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Live Tracking</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Inside the Agent Arena
        </h2>
        <p className="mt-4 text-muted-foreground">
          See the actual competitor events currently being parsed and analyzed by Agent Arena.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 justify-items-center">
        {items.map((it) => (
          <Card4
            key={it.title}
            title={it.title}
            description={it.description}
            imageSrc={it.imageSrc}
            badge={<ThreatBadge value={it.threat} />}
          />
        ))}
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="container-x py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">The problem</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            You're shipping. They're shipping faster.
          </h2>
          <p className="mt-4 text-muted-foreground">
            You're heads-down on the roadmap. Meanwhile a competitor launched an AI feature,
            got 340 stars in two days, and your users are already asking why you don't have it.
            You found out three days late — from an angry thread in your Discord.
          </p>
          <p className="mt-3 text-muted-foreground">
            Manually watching GitHub, Reddit, HN, and four blogs is a full-time job. So nobody
            does it. Until it costs you.
          </p>
        </div>
        <div className="relative h-[320px]">
          {[
            { x: "left-2 top-2", icon: Github, label: "supabase/supabase", text: "released v2.45" },
            { x: "left-16 top-20 rotate-[-3deg]", icon: MessagesSquare, label: "r/webdev", text: "Why doesn't X support vector search?" },
            { x: "right-4 top-10 rotate-[2deg]", icon: Newspaper, label: "Hacker News", text: "Show HN: Appwrite Cloud Pro" },
            { x: "left-10 bottom-6 rotate-[1deg]", icon: MessagesSquare, label: "Discord #general", text: "anyone else seeing this from PocketBase?" },
            { x: "right-10 bottom-10 rotate-[-2deg]", icon: Github, label: "convex-dev/convex", text: "Reactive queries shipped" },
          ].map((c, i) => (
            <div
              key={i}
              className={`absolute w-60 rounded-xl border border-border bg-card p-3 shadow-sm ${c.x}`}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <c.icon className="size-3.5" />
                {c.label}
              </div>
              <p className="mt-1 text-sm">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      kicker: "Always on",
      title: "It never sleeps.",
      body: "Agent Arena monitors GitHub releases, Reddit, Hacker News, Discord, and competitor blogs around the clock — so you wake up to a feed, not a fire.",
      visual: <FeedVisual />,
    },
    {
      kicker: "Long memory",
      title: "It never forgets.",
      body: "Every signal becomes durable memory. The longer Agent Arena runs, the sharper its pattern detection — because today's event is compared to everything that came before.",
      visual: <MemoryGrowthVisual />,
      reverse: true,
    },
    {
      kicker: "Action layer",
      title: "It tells you what to do.",
      body: "Don't drown in alerts. Get a recommended next action, ranked by impact, with the reasoning shown — so you decide in minutes, not hours.",
      visual: <RecCardVisual />,
    },
  ];
  return (
    <section className="container-x space-y-24 py-20">
      {items.map((it, i) => (
        <div
          key={i}
          className={`grid items-center gap-10 md:grid-cols-2 ${it.reverse ? "md:[&>*:first-child]:order-2" : ""}`}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{it.kicker}</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{it.title}</h3>
            <p className="mt-4 max-w-md text-muted-foreground">{it.body}</p>
          </div>
          <div>{it.visual}</div>
        </div>
      ))}
    </section>
  );
}

function FeedVisual() {
  const rows = [
    { ago: "6h", t: "Supabase shipped pgvector GA", src: "GitHub" },
    { ago: "1d", t: "Appwrite Discord +12k members", src: "Discord" },
    { ago: "2d", t: "PocketBase v0.22 realtime", src: "GitHub" },
    { ago: "4d", t: "Supabase Series C announced", src: "Hacker News" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <div className="flex items-center gap-2 pb-3 text-xs text-muted-foreground">
          <Activity className="size-3.5 text-primary" />
          Live signal feed
        </div>
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate">{r.t}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                <span>{r.src}</span>
                <span>·</span>
                <span>{r.ago}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MemoryGrowthVisual() {
  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <div className="rounded-xl bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Brain className="size-3.5 text-primary" />
            Insight quality vs. memory
          </span>
          <span>Week 1 → 6</span>
        </div>
        <svg viewBox="0 0 320 140" className="mt-3 w-full">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,110 C40,100 70,90 110,72 C150,55 180,40 220,28 C260,18 290,14 320,10 L320,140 L0,140 Z" fill="url(#g)" />
          <path d="M0,110 C40,100 70,90 110,72 C150,55 180,40 220,28 C260,18 290,14 320,10" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
          {[
            [40, 100], [110, 72], [180, 40], [260, 18], [320, 10],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--color-primary)" />
          ))}
        </svg>
      </div>
    </div>
  );
}

function RecCardVisual() {
  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <div className="rounded-xl bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-threat-high)_12%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-threat-high)]">
            <span className="size-1.5 rounded-full bg-current" /> High priority
          </span>
          <span className="text-xs text-muted-foreground">Supabase</span>
        </div>
        <h4 className="mt-3 text-base font-semibold">
          Publish a roadmap post addressing vector search.
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          17 community requests + Supabase pgvector GA. A roadmap post within 48h historically
          retains 60%+ of at-risk users.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Est. impact: high — retention</span>
          <button className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
            Implement
          </button>
        </div>
      </div>
    </div>
  );
}

function MemorySection() {
  return (
    <section className="bg-[var(--color-surface)]">
      <div className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            The memory advantage
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            How memory makes Agent Arena smarter every week.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most tools alert you. Agent Arena reasons — across everything it has ever seen.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-muted px-2 py-0.5">Day 1 — no memory</span>
            </div>
            <p className="mt-4 text-base text-foreground/85">
              "Supabase released a new feature."
            </p>
            <p className="mt-6 text-xs text-muted-foreground">Generic. Vague. Not actionable.</p>
          </div>
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-[0_20px_50px_-30px_rgba(91,75,214,0.45)]">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-md bg-[var(--color-primary-tint)] px-2 py-0.5 text-primary">
                Week 6 — with memory
              </span>
            </div>
            <p className="mt-4 text-base text-foreground">
              "Supabase's vector search matches a pattern. The last 2 times they shipped AI
              features you lost ~8% of users within 60 days — but their pricing drew backlash
              both times, which is happening again now.{" "}
              <span className="font-medium">This is an opportunity, not just a threat.</span>"
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Pattern-aware. Specific. Tells you what to do.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Same agent. Six weeks of memory. That's the difference.
        </p>
      </div>
    </section>
  );
}

function Metrics() {
  const stats = [
    { v: "10 hrs", l: "saved per week on competitor research" },
    { v: "12+", l: "competitors tracked automatically per workspace" },
    { v: "3 days", l: "average head start on every competitor move" },
  ];
  return (
    <section className="container-x py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.v} className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-4xl font-semibold tracking-tight md:text-5xl">{s.v}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
      <figure className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-8">
        <Quote className="size-5 text-primary" />
        <blockquote className="mt-3 text-lg leading-relaxed text-foreground">
          "I used to refresh GitHub and Reddit ten times a day. Agent Arena gives me a morning
          digest that's better than my whole previous routine — and it remembers context I'd
          forgotten about."
        </blockquote>
        <figcaption className="mt-4 text-sm text-muted-foreground">
          Indie maintainer · 4.2k-star open-source project
        </figcaption>
      </figure>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-x py-24 text-center">
      <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        Stop finding out last.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
        Set up Agent Arena in five minutes. By next week it will already know more about your
        competitors than you do.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Get started free <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/pricing"
          className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-muted"
        >
          See pricing
        </Link>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5 text-[var(--color-threat-low)]"/> Free forever plan</span>
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5 text-[var(--color-threat-low)]"/> No credit card</span>
      </div>
    </section>
  );
}
