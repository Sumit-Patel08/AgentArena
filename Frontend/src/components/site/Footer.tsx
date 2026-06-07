import { Logo } from "./Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

const cols = [
  {
    title: "Product",
    items: ["Overview", "How it works", "Pricing", "Changelog"],
  },
  {
    title: "Resources",
    items: ["Documentation", "Blog", "Guides", "API reference"],
  },
  {
    title: "Company",
    items: ["About", "Careers", "Contact", "Security"],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[var(--color-surface-2)]">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The ultimate arena for competitive agent intelligence.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="social"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-medium text-foreground">{c.title}</h4>
              <ul className="mt-3 space-y-2">
                {c.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Agent Arena, Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
