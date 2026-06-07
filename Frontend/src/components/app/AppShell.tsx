import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Users, Lightbulb, Brain, Settings, Play, Loader2, Layers } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  match?: string;
};

const nav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/competitors", label: "Competitors", icon: Users, match: "/competitor" },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/workspace", label: "Workspace", icon: Layers },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    navigate({ to: "/" });
  };

  const scan = useMutation({
    mutationFn: api.runCollect,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ["signals"] });
      void qc.invalidateQueries({ queryKey: ["competitors"] });
      void qc.invalidateQueries({ queryKey: ["metrics"] });
      void qc.invalidateQueries({ queryKey: ["recs"] });
      alert(`Scan complete: ${data.collected} fetched, ${data.new_signals} new signals added.`);
    },
    onError: () => alert("Scan failed — is the backend running on port 8000?"),
  });

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
        <div className="px-5 py-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = n.match
              ? pathname.startsWith(n.match) || pathname === n.to
              : pathname === n.to;
            return (
              <Link
                key={n.label}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--color-primary-tint)] text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            disabled={scan.isPending}
            onClick={() => scan.mutate()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {scan.isPending ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Play className="size-3.5 text-primary" />
            )}
            {scan.isPending ? "Scanning…" : "Run scan now"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3 md:hidden">
          <Logo />
          <button onClick={handleSignOut} className="text-xs text-muted-foreground cursor-pointer">
            Sign out
          </button>
        </div>
        <div className="px-5 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
