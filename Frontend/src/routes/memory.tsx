import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Sparkles, Send, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { api, type ChatResponse } from "@/lib/api";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Chat — Agent Arena" },
      { name: "description", content: "Ask the competitive intelligence agent with Hindsight memory." },
    ],
  }),
  component: MemoryChat,
});

const DEMO_QUESTIONS = [
  "What is Supabase's most consistent strategic move over the last month?",
  "Which competitor is creating the most pressure on AI features right now?",
  "What pattern do you see around Supabase pricing complaints?",
];

function MemoryChat() {
  const [question, setQuestion] = useState("");
  const [useMemory, setUseMemory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.chat(q.trim(), useMemory);
      setResult(res);
      setQuestion(q.trim());
    } catch {
      setError("Chat failed — check backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Agent</p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Brain className="size-6 text-primary" /> Memory Chat
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Powered by <strong>Hindsight</strong> (vector memory) + <strong>Groq</strong> (LLM).
        Toggle memory to see the before/after demo.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={useMemory}
            onChange={(e) => setUseMemory(e.target.checked)}
            className="accent-primary"
          />
          <Sparkles className="size-3.5 text-primary" />
          Use Hindsight memory
        </label>
        <span className="text-xs text-muted-foreground">
          {useMemory ? "RAG mode — recalls 6 weeks of signals" : "Blind mode — no memory"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {DEMO_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
          >
            {q.slice(0, 48)}…
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(question)}
          placeholder="Ask about competitor patterns, threats, opportunities…"
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => ask(question)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Ask
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-[var(--color-threat-high)]">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-xs font-medium text-primary">
              {useMemory ? `Answer (${result.memories_used} memories used)` : "Answer (no memory)"}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{result.answer}</p>
          </div>
          {result.sources.length > 0 && (
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="text-xs font-semibold">Sources cited from memory</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {result.sources.map((s, i) => (
                  <li key={i}>
                    {s.competitor} · {s.date?.slice(0, 10) || "—"} · threat {s.threat_score}/10
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
