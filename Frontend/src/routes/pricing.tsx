import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Check, Minus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Nazar" },
      {
        name: "description",
        content:
          "Simple pricing for solo developers and small teams. Free forever for hobby projects.",
      },
      { property: "og:title", content: "Nazar pricing" },
      { property: "og:description", content: "Simple pricing. Serious advantage." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Hobby",
    price: "Free",
    cadence: "",
    blurb: "For solo devs evaluating the space.",
    cta: "Start free",
    features: [
      "Track up to 2 competitors",
      "Weekly scans",
      "2 weeks of memory",
      "Email digest",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "/mo",
    blurb: "For indie hackers shipping a product.",
    cta: "Start free trial",
    popular: true,
    features: [
      "Unlimited competitors",
      "Daily scans",
      "Full memory history",
      "Recommendations with reasoning",
      "Daily digest emails",
    ],
  },
  {
    name: "Team",
    price: "$149",
    cadence: "/mo",
    blurb: "For small product teams moving fast.",
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Multiple seats",
      "Slack alerts",
      "API access",
      "Priority support",
    ],
  },
];

const compareRows = [
  ["Competitors", "2", "Unlimited", "Unlimited"],
  ["Scan frequency", "Weekly", "Daily", "Hourly"],
  ["Memory history", "2 weeks", "Full", "Full"],
  ["Recommendations", false, true, true],
  ["Slack alerts", false, false, true],
  ["API access", false, false, true],
] as const;

const faqs = [
  {
    q: "How does the memory work?",
    a: "Every signal Nazar collects is embedded and stored alongside its metadata. When a new event arrives, Nazar retrieves the most similar past events and uses that context to score and explain what's happening.",
  },
  {
    q: "Which sources does Nazar watch?",
    a: "GitHub releases and stars, Reddit, Hacker News, public Discord servers, and competitor blogs. We're adding LinkedIn job posts and Product Hunt next.",
  },
  {
    q: "Can I add private competitors?",
    a: "Yes — anything with a public footprint on the supported sources. Strictly private companies with no public activity aren't a great fit (yet).",
  },
  {
    q: "Is there a free trial?",
    a: "Pro has a 14-day free trial, no credit card required. The Hobby plan stays free forever.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings and you'll keep access until the end of the billing period.",
  },
];

function Pricing() {
  return (
    <SiteLayout>
      <section className="container-x pt-20 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Pricing</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Simple pricing. Serious advantage.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start free. Upgrade when Nazar pays for itself — usually in the first week.
        </p>
      </section>

      <section className="container-x">
        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border bg-card p-7 ${
                t.popular
                  ? "border-primary/60 border-2 shadow-[0_30px_60px_-30px_rgba(91,75,214,0.3)]"
                  : "border-border"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-7 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold tracking-tight">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                {t.cadence && <span className="pb-1.5 text-muted-foreground">{t.cadence}</span>}
              </div>
              <Link
                to="/dashboard"
                className={`mt-5 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium ${
                  t.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {t.cta}
              </Link>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-center text-xl font-semibold tracking-tight">Compare plans</h2>
        <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Feature</th>
                <th className="px-5 py-3 text-left font-medium">Hobby</th>
                <th className="px-5 py-3 text-left font-medium">Pro</th>
                <th className="px-5 py-3 text-left font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row[0] as string} className="border-t border-border">
                  {row.map((cell, i) => (
                    <td key={i} className="px-5 py-3">
                      {typeof cell === "boolean" ? (
                        cell ? <Check className="size-4 text-primary" /> : <Minus className="size-4 text-muted-foreground" />
                      ) : (
                        <span className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-x pb-24">
        <h2 className="text-center text-xl font-semibold tracking-tight">Frequently asked</h2>
        <div className="mx-auto mt-6 max-w-2xl divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="block w-full text-left"
      aria-expanded={open}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium">{q}</span>
        <span className="ml-3 text-muted-foreground">{open ? "−" : "+"}</span>
      </div>
      {open && <p className="px-5 pb-4 text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}
