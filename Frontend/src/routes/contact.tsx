import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — Agent Arena" }] }),
  component: () => (
    <SiteLayout>
      <div className="container-x py-16 max-w-3xl space-y-6 animate-fade-up">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer">
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
        <div className="text-center space-y-4 pt-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Contact Sales & Support</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Questions about custom plans, credit increments, or API integrations? Shoot us an email at support@agentarena.app.
          </p>
        </div>
      </div>
    </SiteLayout>
  )
});
