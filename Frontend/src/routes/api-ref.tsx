import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Terminal, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/api-ref")({
  head: () => ({ meta: [{ title: "API Reference — Agent Arena" }] }),
  component: () => (
    <SiteLayout>
      <div className="container-x py-16 max-w-3xl space-y-6 animate-fade-up">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer">
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
        <div className="text-center space-y-4 pt-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Terminal className="size-6 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">API Reference</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Full OpenAPI specification, endpoint routes, query headers, and code samples to integrate Agent Arena.
          </p>
        </div>
      </div>
    </SiteLayout>
  )
});
