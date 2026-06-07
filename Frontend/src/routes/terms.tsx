import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Agent Arena" }] }),
  component: () => (
    <SiteLayout>
      <div className="container-x py-16 max-w-3xl space-y-6 animate-fade-up">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer">
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Legal</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground mt-1">Last updated: June 7, 2026</p>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
          <p>
            Welcome to Agent Arena. By accessing or using our website and competitor monitoring services, you agree to comply with and be bound by the following terms.
          </p>
          <h2 className="text-sm font-bold text-foreground mt-6">1. Permitted Use</h2>
          <p>
            You agree to use the competitor scrapers in compliance with all local, state, and international laws. Do not configure scrapers for abusive or spamming purposes.
          </p>
          <h2 className="text-sm font-bold text-foreground mt-6">2. Subscription & Credit Quotas</h2>
          <p>
            Your monthly credit limits (Groq tokens, Vector storage) are determined by your active plan tier. Exceeding monthly limits will pause auto-updating collections.
          </p>
          <h2 className="text-sm font-bold text-foreground mt-6">3. Limitation of Liability</h2>
          <p>
            Agent Arena collects public logs and RSS entries. We do not guarantee the completeness or accuracy of third-party competitor signal feeds.
          </p>
        </div>
      </div>
    </SiteLayout>
  )
});
