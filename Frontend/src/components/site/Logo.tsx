import { Link } from "@tanstack/react-router";
import { Bot } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <Bot className="size-4" />
      </span>
      <span className="text-base font-semibold tracking-tight">Agent Arena</span>
    </Link>
  );
}

