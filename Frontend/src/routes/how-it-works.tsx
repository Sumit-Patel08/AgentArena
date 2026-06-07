import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eye, Brain, Database, Network, Lightbulb, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Agent Arena thinks — from raw noise to a recommended action" },
      {
        name: "description",
        content:
          "The five steps Agent Arena takes — watch, understand, remember, connect, recommend — explained in plain English.",
      },
      { property: "og:title", content: "How Agent Arena thinks" },
      { property: "og:description", content: "From raw noise to a recommended action, in five steps." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: Eye,
    title: "Watch",
    body:
      "Agent Arena collects signals from GitHub releases, Reddit, Hacker News, Discord, and competitor blogs on a continuous schedule. Nothing slips through.",
    visual: "Sources connected: GitHub, Reddit, HN, Discord, Blogs",
  },
  {
    icon: Brain,
    title: "Understand",
    body:
      "An LLM classifies every signal — feature release, growth, security, announcement — and scores its threat level from 1 to 10 based on your context.",
    visual: "Classifier · threat scoring",
  },
  {
    icon: Database,
    title: "Remember",
    body:
      "Every signal is stored in long-term memory as a vector, alongside its date, type, and impact. Your living history starts here.",
    visual: "Memory store · vector index",
  },
  {
    icon: Network,
    title: "Connect",
    body:
      "When something new happens, Agent Arena recalls similar past events and detects the pattern — so a single release becomes part of a six-week story.",
    visual: "Retrieval · pattern matching",
  },
  {
    icon: Lightbulb,
    title: "Recommend",
    body:
      "Finally, Agent Arena tells you what to do next — ranked by impact, with the reasoning shown so you understand why and decide in minutes.",
    visual: "Ranked actions · with reasoning",
  },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <section className="container-x pt-20 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">The pipeline</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          How Agent Arena thinks.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          From raw noise to a recommended action — in five steps.
        </p>
      </section>

      <section className="container-x py-12">
        <ol className="relative mx-auto max-w-3xl space-y-6">
          <span
            aria-hidden
            className="absolute left-[27px] top-4 bottom-4 w-px bg-border md:left-[31px]"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative pl-16 md:pl-20">
              <div className="absolute left-0 top-0 grid size-14 place-items-center rounded-2xl border border-border bg-card md:size-16">
                <s.icon className="size-5 text-primary" />
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">Step {i + 1}</span>
                  <span className="rounded-md bg-muted px-2 py-0.5">{s.visual}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Want to see it on your competitors?
        </h2>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open the dashboard <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-muted"
          >
            See pricing
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
