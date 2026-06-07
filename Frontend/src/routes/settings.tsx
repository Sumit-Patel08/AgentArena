import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  CreditCard, 
  BarChart3, 
  Check, 
  Download,
  ArrowRight
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { api } from "@/lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Agent Arena" }] }),
  component: SettingsPage,
});

// Mock credit usage data for chart
const creditUsageData = [
  { week: "Wk 1", usage: 120 },
  { week: "Wk 2", usage: 250 },
  { week: "Wk 3", usage: 410 },
  { week: "Wk 4", usage: 620 },
  { week: "Wk 5", usage: 780 },
  { week: "Wk 6", usage: 984 },
];

function SettingsPage() {
  const { data: workspace } = useQuery({ queryKey: ["workspace"], queryFn: api.getWorkspace, retry: 1 });

  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "credits">("profile");

  const { user } = useAuth();
  
  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("Competitor Intelligence Analyst");
  const [profileCompany, setProfileCompany] = useState("Pied Piper Tech");
  
  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || "";
      const lastName = user.user_metadata?.last_name || "";
      setProfileName(`${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Unknown User");
      setProfileEmail(user.email || "");
    }
  }, [user]);
  
  // Notification states
  const [notifyHighThreats, setNotifyHighThreats] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(true);
  const [notifyCreditLimit, setNotifyCreditLimit] = useState(true);

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "credits", label: "Credit Usage", icon: BarChart3 },
  ] as const;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Settings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Account & Billing</h1>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Inner Sidebar tabs (Stripe / Klue style sub-nav) */}
          <aside className="w-full shrink-0 space-y-1 lg:w-64">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Main Settings Panel */}
          <div className="flex-1 rounded-2xl border border-border bg-background p-6 shadow-xs">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold">My Profile</h2>
                  <p className="text-xs text-muted-foreground">
                    Manage your personal settings, display name, and preferences.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 border-b border-border pb-6 sm:flex-row">
                  <div className="flex size-14 items-center justify-center rounded-full bg-linear-to-tr from-primary to-primary/60 text-lg font-bold text-white shadow-sm">
                    {profileName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-foreground">{profileName}</p>
                    <p className="text-xs text-muted-foreground">{profileRole}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Display Name</label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <input
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Role</label>
                    <input
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Company</label>
                    <input
                      value={profileCompany}
                      onChange={(e) => setProfileCompany(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Notification Preferences</h3>
                    <p className="text-xs text-muted-foreground">Choose when you want to get notified.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyHighThreats}
                        onChange={(e) => setNotifyHighThreats(e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-medium">Critical Threat Alerts</span>
                        <p className="text-xs text-muted-foreground">Receive real-time push notifications on threat levels &ge; 7.</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyDigest}
                        onChange={(e) => setNotifyDigest(e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-medium">Weekly Intelligence Digest</span>
                        <p className="text-xs text-muted-foreground">A detailed analysis of competitor actions delivered every Monday morning.</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyCreditLimit}
                        onChange={(e) => setNotifyCreditLimit(e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-medium">API Credit Warnings</span>
                        <p className="text-xs text-muted-foreground">Get notified when workspace consumption reaches 80% or 95% of monthly limit.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold">Billing & Subscriptions</h2>
                  <p className="text-xs text-muted-foreground">
                    View your active plan, update credit cards, or check monthly billing history.
                  </p>
                </div>

                {/* Main Subscription Card */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-tr from-primary to-primary/70 p-6 text-white shadow-md">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 rounded-full bg-white/5 p-20" />
                  <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="space-y-1.5">
                      <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">Pro Tier</span>
                      <h3 className="text-2xl font-bold">Pro Plan ($49/month)</h3>
                      <p className="text-xs text-primary-foreground/90">Next renewal: July 1, 2026</p>
                    </div>
                    <div className="flex flex-col gap-1 sm:text-right">
                      <p className="text-sm font-semibold">Payment Method</p>
                      <p className="text-xs text-primary-foreground/90 flex items-center gap-1.5 sm:justify-end">
                        <CreditCard className="size-3.5" /> Visa ending in 4242 (expires 12/28)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold">Available Subscription Plans</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { name: "Starter", price: "$0", desc: "For developer side-projects", active: false, features: ["3 tracked competitors", "6 weeks history limit", "Basic alerts"] },
                      { name: "Pro Plan", price: "$49", desc: "For growth-stage startups", active: true, features: ["10 tracked competitors", "Unlimited history", "AI insights & summary generation", "Critical threat alerts"] },
                      { name: "Enterprise", price: "Custom", desc: "For high scale monitoring", active: false, features: ["Unlimited competitors", "Advanced dashboard API", "Custom scrapers", "Dedicated LLM instance"] }
                    ].map((plan) => (
                      <div
                        key={plan.name}
                        className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                          plan.active
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-border hover:border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {plan.active && (
                          <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            Active
                          </span>
                        )}
                        <div className="space-y-2">
                          <p className="text-sm font-bold">{plan.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold">{plan.price}</span>
                            <span className="text-xs text-muted-foreground">{plan.price !== "Custom" && "/mo"}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-normal">{plan.desc}</p>
                        </div>
                        <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground flex-1">
                          {plan.features.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <Check className="size-3 shrink-0 text-primary" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold">Billing Invoices</h3>
                  <div className="overflow-hidden border border-border rounded-xl">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-muted/40 border-b border-border font-medium text-muted-foreground">
                        <tr>
                          <th className="p-3">Billing Date</th>
                          <th className="p-3">Invoice ID</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">PDF Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { date: "June 1, 2026", id: "INV-2026-004", amt: "$49.00", status: "Paid" },
                          { date: "May 1, 2026", id: "INV-2026-003", amt: "$49.00", status: "Paid" },
                          { date: "April 1, 2026", id: "INV-2026-002", amt: "$49.00", status: "Paid" },
                          { date: "March 1, 2026", id: "INV-2026-001", amt: "$0.00", status: "Paid (Trial)" }
                        ].map((inv) => (
                          <tr key={inv.id} className="hover:bg-muted/10">
                            <td className="p-3 font-medium text-foreground">{inv.date}</td>
                            <td className="p-3 text-muted-foreground font-mono">{inv.id}</td>
                            <td className="p-3 font-semibold text-foreground">{inv.amt}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/20">
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
                                <Download className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "credits" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold">API Limits & Usage</h2>
                  <p className="text-xs text-muted-foreground">
                    Track your current API request quotas, vector db capacities, and Groq LLM tokens consumed.
                  </p>
                </div>

                {/* Quotas grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Groq LLM Tokens", val: "724 / 1,000 queries", pct: 72.4, color: "var(--color-primary)" },
                    { label: "Vector database", val: "4.8 / 10.0 MB memory", pct: 48, color: "var(--color-threat-med)" },
                    { label: "GitHub Scraper Quota", val: "4,230 / 5,000 calls", pct: 84.6, color: "var(--color-threat-high)" },
                  ].map((quota) => (
                    <div key={quota.label} className="rounded-xl border border-border bg-background p-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{quota.label}</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-foreground">{quota.val}</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: quota.color }}>{quota.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${quota.pct}%`, backgroundColor: quota.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recharts chart */}
                <div className="border border-border rounded-xl p-5 bg-background space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Usage Over Last 6 Weeks</h3>
                    <p className="text-xs text-muted-foreground">Cumulative monthly tokens and search queries counted in system.</p>
                  </div>
                  <div className="h-48 w-full mt-2">
                    <ResponsiveContainer>
                      <AreaChart data={creditUsageData}>
                        <defs>
                          <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="week" 
                          stroke="var(--color-muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <Tooltip 
                          contentStyle={{
                            background: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="usage"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#usageGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex flex-wrap gap-4 items-center justify-between">
                  <p className="text-xs text-muted-foreground max-w-md">
                    Monthly credits replenish automatically on the 1st of every month. Need larger limit? Contact support.
                  </p>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer shadow-xs">
                    Upgrade Quota <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
