import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

type FooterLink = {
  label: string;
  to: string;
};

type FooterColumn = {
  title: string;
  items: FooterLink[];
};

const cols: FooterColumn[] = [
  {
    title: "Product",
    items: [
      { label: "Overview", to: "/" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "Changelog", to: "/changelog" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Security", to: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[var(--color-surface-2)] transition-colors duration-300">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              The ultimate arena for competitive agent intelligence.
            </p>
            <div className="flex items-center gap-2">
              {[
                { Icon: Github, href: "https://github.com/Sumit-Patel08/AgentArena" },
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:border-primary cursor-pointer shadow-xs"
                  aria-label="social"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="space-y-3">
              <h4 className="text-sm font-semibold tracking-tight text-foreground uppercase text-xs opacity-80">{c.title}</h4>
              <ul className="space-y-2">
                {c.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary duration-200 block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border/80 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Agent Arena, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
