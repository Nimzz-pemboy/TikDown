import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { SiteLogo } from "@/components/site-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

const NAV = [
  { href: "#top", label: "Home" },
  { href: "#cara-download", label: "Cara Download" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#top" aria-label={siteConfig.name} className="flex items-center">
          <SiteLogo />
        </a>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {siteConfig.repoUrl && (
            <a
              href={siteConfig.repoUrl}
              rel="noreferrer noopener"
              target="_blank"
              aria-label="Repositori open source"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <i className="fa-brands fa-github" aria-hidden="true" />
            </a>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Buka menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground sm:hidden"
          >
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Navigasi mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/70 sm:hidden"
          >
            <div className="mx-auto flex max-w-5xl flex-col px-4 py-2">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
              {siteConfig.repoUrl && (
                <a
                  href={siteConfig.repoUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <i className="fa-brands fa-github mr-2" aria-hidden="true" />
                  Open source
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
