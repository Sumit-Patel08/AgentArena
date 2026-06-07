import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Users, Lightbulb, Brain, Settings, Play } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  match?: string;
  disabled?: boolean;
};

const nav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/competitor/supabase", label: "Competitors", icon: Users, match: "/competitor" },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/dashboard", label: "Memory", icon: Brain, disabled: true },
  { to: "/dashboard", label: "Settings", icon: Settings, disabled: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
        <div className="px-5 py-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = n.match
              ? pathname.startsWith(n.match)
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
                  n.disabled && "pointer-events-none opacity-50",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
            <Play className="size-3.5 text-primary" /> Run scan now
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3 md:hidden">
          <Logo />
          <Link to="/" className="text-xs text-muted-foreground">Exit</Link>
        </div>
        <div className="px-5 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
