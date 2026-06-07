import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Sparkles, Radar } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { API_BASE_URL, api, type WorkspaceCompetitor, type WorkspaceInfo } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Setup — Agent Arena" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const {
    data: workspace,
    isError: workspaceError,
  } = useQuery({ queryKey: ["workspace"], queryFn: api.getWorkspace, retry: 1 });
  const { data: health, isError } = useQuery({ queryKey: ["health"], queryFn: api.health });

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
      <h1 className="text-2xl font-semibold tracking-tight">Workspace Setup</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your company — we discover similar competitors only, then collect live signals for them.
      </p>

      {workspaceError && (
        <div className="mt-4 rounded-xl border border-[var(--color-threat-high)]/40 bg-red-50 p-4 text-sm text-[var(--color-threat-high)] dark:bg-red-950/30">
          Backend missing workspace API (404). Stop and restart the backend so new routes load.
        </div>
      )}

      <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm">
        Backend: <span className="font-mono">{API_BASE_URL}</span> ·{" "}
        <span className={isError ? "text-[var(--color-threat-high)]" : "text-[var(--color-threat-low)]"}>
          {isError ? "Offline" : "Connected"}
        </span>
        {ws?.configured && (
          <p className="mt-2">
            Monitoring <strong>{ws.company_name}</strong> · {ws.competitors.length} competitors ·{" "}
            {ws.signals_count} live signals
            {ws.using_demo_data && " (demo mode)"}
          </p>
        )}
      </div>

      {showForm ? (
        <div className="mt-6 max-w-xl space-y-4">
          <input
            placeholder="Your company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm"
          />
          <input
            placeholder="Website (e.g. https://yourcompany.com)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm"
          />
          <input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm"
          />
          <input
            placeholder="Industry (e.g. BaaS, fintech, devtools)"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm"
          />

          <button
            type="button"
            disabled={!company || !website || discover.isPending}
            onClick={() => discover.mutate()}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            {discover.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Discover competitors (Groq AI)
          </button>

          {discovered.length > 0 && (
            <ul className="space-y-2 rounded-xl border border-border p-4">
              {discovered.map((c) => (
                <li key={c.id} className="text-sm">
                  <strong>{c.name}</strong>
                  <span className="text-muted-foreground"> — {c.description}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            disabled={!company || !website || setup.isPending}
            onClick={() => setup.mutate()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {setup.isPending ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}
            Start real-time monitoring
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm font-medium">Tracked competitors</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {ws.competitors.map((c) => (
              <li key={c.id}>
                {c.name} {c.github_owner && `· GitHub: ${c.github_owner}/${c.github_repo}`}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => reset.mutate()}
            className="mt-4 text-xs text-muted-foreground underline"
          >
            Reset to demo mode
          </button>
        </div>
      )}
    </AppShell>
  );
}
