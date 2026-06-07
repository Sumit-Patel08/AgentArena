import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft, Bot, Cpu, Zap } from "lucide-react";

export const Route = createFileRoute("/changelog")({
  head: () => ({ meta: [{ title: "Changelog — Agent Arena" }] }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const updates = [
    {
      version: "v1.2.0",
      date: "June 7, 2026",
      title: "Settings panel & Workspace Setup separation",
      desc: "Promoted Workspace Setup to a top-level sidebar navigation link for clearer onboarding. Redesigned settings view into nested tabs including billing, invoices download tables, profile configurations, and API token limits dashboards.",
      icon: Bot,
    },
    {
      version: "v1.1.0",
      date: "June 3, 2026",
      title: "Realtime synchronized competitor tracking",
      desc: "Added automated background scrapers that query Github releases and RSS feeds on a continuous schedule. Enabled vector embeddings via hindsight-client to detect threat levels.",
      icon: Zap,
    },
    {
      version: "v1.0.0",
      date: "May 28, 2026",
      title: "Initial Launch of Agent Arena",
      desc: "Autopilot competitor intelligence tracking starts now. Configure your startup domain, auto-discover competitors via LLM, and build your threat dashboard.",
      icon: Cpu,
    },
  ];

  return (
    <SiteLayout>
      <div className="container-x py-16 max-w-3xl space-y-8 animate-fade-up">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer">
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Release Notes</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Changelog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow the latest product updates, new scrapers, and features shipped to Agent Arena.
          </p>
        </div>

        <div className="relative border-l border-border pl-6 ml-3 space-y-10">
          {updates.map((up, idx) => {
            const Icon = up.icon;
            return (
              <div key={idx} className="relative group">
                <div className="absolute -left-9.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-background border border-border group-hover:border-primary transition-colors">
                  <Icon className="size-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {up.version}
                    </span>
                    <span className="text-xs text-muted-foreground">{up.date}</span>
                  </div>
                  <h2 className="text-base font-semibold text-foreground">{up.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {up.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
