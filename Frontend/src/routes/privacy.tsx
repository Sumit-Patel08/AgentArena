import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Agent Arena" }] }),
  component: () => (
    <SiteLayout>
      <div className="container-x py-16 max-w-3xl space-y-6 animate-fade-up">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer">
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Legal</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-1">Last updated: June 7, 2026</p>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
          <p>
            At Agent Arena, we value your trust. This Privacy Policy details how we handle the information you provide when using our competitor intelligence tools.
          </p>
          <h2 className="text-sm font-bold text-foreground mt-6">1. Data Collection</h2>
          <p>
            We collect the company names, websites, emails, and industries that you provide during setup. This data is used to configure competitor tracking scrapers.
          </p>
          <h2 className="text-sm font-bold text-foreground mt-6">2. Third-Party Integrations</h2>
          <p>
            Competitor discovery requests are processed via Groq LLM services. Competitor update signals are scored and archived using our hindsight vector storage partner.
          </p>
          <h2 className="text-sm font-bold text-foreground mt-6">3. Cookies & Security</h2>
          <p>
            We use local session cookies to manage workspace configurations. All api communication with port 8000 is performed locally or over secure channels.
          </p>
        </div>
      </div>
    </SiteLayout>
  )
});
