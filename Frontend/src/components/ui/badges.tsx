import { cn } from "@/lib/utils";

export function ThreatBadge({ value, className }: { value: number; className?: string }) {
  const level = value >= 7 ? "high" : value >= 4 ? "med" : "low";
  const styles = {
    high: "bg-[color-mix(in_oklab,var(--color-threat-high)_12%,transparent)] text-[var(--color-threat-high)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-threat-high)_25%,transparent)]",
    med: "bg-[color-mix(in_oklab,var(--color-threat-med)_14%,transparent)] text-[var(--color-threat-med)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-threat-med)_30%,transparent)]",
    low: "bg-[color-mix(in_oklab,var(--color-threat-low)_12%,transparent)] text-[var(--color-threat-low)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-threat-low)_28%,transparent)]",
  }[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        styles,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      Threat {value}
    </span>
  );
}

export function SignalTypeTag({ type }: { type: string }) {
  const label = type.replace(/_/g, " ");
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "High" | "Medium" | "Low" }) {
  const map = {
    High: "bg-[color-mix(in_oklab,var(--color-threat-high)_12%,transparent)] text-[var(--color-threat-high)]",
    Medium: "bg-[color-mix(in_oklab,var(--color-threat-med)_14%,transparent)] text-[var(--color-threat-med)]",
    Low: "bg-[color-mix(in_oklab,var(--color-threat-low)_12%,transparent)] text-[var(--color-threat-low)]",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", map[priority])}>
      <span className="size-1.5 rounded-full bg-current" />
      {priority} priority
    </span>
  );
}
