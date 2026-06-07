import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Loader2, 
  Sparkles, 
  Radar, 
  Building, 
  Check, 
  AlertCircle,
  Globe,
  Mail,
  Server
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { API_BASE_URL, api, type WorkspaceCompetitor } from "@/lib/api";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "Workspace Setup — Agent Arena" }] }),
  component: WorkspaceSetupPage,
});

function WorkspaceSetupPage() {
  const qc = useQueryClient();
  const {
    data: workspace,
    isError: workspaceError,
  } = useQuery({ queryKey: ["workspace"], queryFn: api.getWorkspace, retry: 1 });
  const { isError: isHealthError } = useQuery({ queryKey: ["health"], queryFn: api.health });

  // Workspace Form States
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [discovered, setDiscovered] = useState<WorkspaceCompetitor[]>([]);

  const discover = useMutation({
    mutationFn: () =>
      api.discoverCompetitors({
        company_name: company,
        website: website,
        industry,
      }),
    onSuccess: (res) => setDiscovered(res.competitors),
    onError: (err) => alert(`Discover failed: ${err.message}\n\nRestart backend: cd Backend && venv\\Scripts\\uvicorn main:app --reload --port 8000`),
  });

  const setup = useMutation({
    mutationFn: () =>
      api.setupWorkspace({
        company_name: company,
        website: website,
        email,
        industry,
        competitors: discovered.length ? discovered : undefined,
        run_collection: true,
      }),
    onSuccess: () => {
      void qc.invalidateQueries();
      alert("Monitoring started! Only your discovered competitors are tracked. Run scan if dashboard is empty.");
    },
    onError: (err) => alert(`Setup failed: ${err.message}\n\nRestart backend: cd Backend && venv\\Scripts\\uvicorn main:app --reload --port 8000`),
  });

  const reset = useMutation({
    mutationFn: api.resetWorkspace,
    onSuccess: () => {
      void qc.invalidateQueries();
      setDiscovered([]);
    },
  });

  const ws = workspace;
  const showForm = !ws?.configured;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Setup</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Workspace Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your tracked domain, email triggers, and discover competitors to start real-time intelligence monitoring.
          </p>
        </div>

        {workspaceError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex gap-2.5 items-start animate-fade-in">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Backend Connection Missing (404)</strong> — Please make sure the python dev server is active:
              <code className="block mt-2 bg-background/50 p-1.5 rounded font-mono text-xs text-foreground">
                cd Backend && .\venv\Scripts\uvicorn main:app --reload --port 8000
              </code>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main workspace settings card */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Building className="size-4.5 text-primary" /> Company Profile
              </h2>

              {showForm ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Your Company Name</label>
                      <input
                        placeholder="e.g. Pied Piper, Stripe"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Company Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          placeholder="e.g. https://yourcompany.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Billing/Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          placeholder="e.g. admin@company.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Industry / Sector</label>
                      <input
                        placeholder="e.g. BaaS, Devtools, Fintech"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={!company || !website || discover.isPending}
                      onClick={() => discover.mutate()}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {discover.isPending ? <Loader2 className="size-4 animate-spin text-primary" /> : <Sparkles className="size-4 text-primary" />}
                      Discover Competitors (Groq AI)
                    </button>

                    <button
                      type="button"
                      disabled={!company || !website || setup.isPending}
                      onClick={() => setup.mutate()}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {setup.isPending ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}
                      Start Live Monitoring
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Tracked Competitors</p>
                      <p className="text-xs text-muted-foreground">These competitors are active in your arena:</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => reset.mutate()}
                      className="text-xs text-muted-foreground hover:text-destructive underline cursor-pointer"
                    >
                      Reset to demo mode
                    </button>
                  </div>

                  <ul className="divide-y divide-border border border-border rounded-xl bg-muted/5 overflow-hidden">
                    {ws.competitors.map((c) => (
                      <li key={c.id} className="p-3 text-sm flex items-center justify-between flex-wrap gap-2 hover:bg-muted/10 transition-colors">
                        <span className="font-semibold text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-full border border-border">
                          {c.github_owner ? `GitHub: ${c.github_owner}/${c.github_repo}` : "Public Feed Scraper"}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-end pt-2 text-xs text-muted-foreground items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> Scrapers running continuously
                  </div>
                </div>
              )}
            </div>

            {discovered.length > 0 && (
              <div className="rounded-2xl border border-border bg-background p-6 shadow-xs animate-fade-up">
                <h3 className="text-sm font-semibold mb-3">AI Discovered Candidates ({discovered.length})</h3>
                <ul className="divide-y divide-border border border-border rounded-xl bg-muted/5 overflow-hidden">
                  {discovered.map((c) => (
                    <li key={c.id} className="p-3 text-sm flex flex-col gap-0.5">
                      <strong className="text-foreground">{c.name}</strong>
                      <span className="text-xs text-muted-foreground leading-relaxed">{c.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Connection sidebar card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Server className="size-4.5 text-primary" /> API Connection
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Backend Host URL</p>
                  <p className="font-mono text-xs bg-muted/40 p-2 rounded-lg border border-border break-all">{API_BASE_URL}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Server Connection</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isHealthError ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                  }`}>
                    <span className={`size-1.5 rounded-full ${isHealthError ? "bg-destructive" : "bg-emerald-500"}`} />
                    {isHealthError ? "Offline" : "Connected"}
                  </span>
                </div>

                <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2">
                  <p>
                    Ensure your backend remains active on port 8000 for scrapers and AI signals to populate.
                  </p>
                  <p>
                    Vector intelligence queries will be billed directly to Pied Piper Tech workspace credits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
