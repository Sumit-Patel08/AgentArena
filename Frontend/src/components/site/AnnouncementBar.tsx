import { useState } from "react";
import { X, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-[var(--color-primary-tint)] text-[var(--color-accent-foreground)]">
      <div className="container-x flex h-9 items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-xs sm:text-sm">
          <Sparkles className="size-3.5" />
          <span>
            New: Agent Arena now remembers 6 weeks of competitor history →{" "}
            <a href="#" className="font-medium underline-offset-4 hover:underline">
              Read more
            </a>
          </span>
        </p>
        <button
          aria-label="Dismiss"
          onClick={() => setOpen(false)}
          className="grid size-6 place-items-center rounded hover:bg-black/5"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
