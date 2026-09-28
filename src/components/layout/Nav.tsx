"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Plane, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore" },
  { href: "/pair-calendar", label: "Pair Calendar" },
  { href: "/alerts", label: "Alerts" },
  { href: "/wallet", label: "My Wallet" },
] as const;

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[var(--radius-sm)] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setIsMenuOpen(false)}
        >
          <Plane aria-hidden="true" className="h-5 w-5 -rotate-45 text-primary" />
          <span className="text-lg font-semibold tracking-tight">AwardPair</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button variant="secondary" size="sm">
            Sign In / Account
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-foreground md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-nav-menu"
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-200 ease-out md:hidden",
          isMenuOpen ? "max-h-96" : "max-h-0 border-t-0",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-sm)] px-3 py-3 text-base font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-border pt-3">
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In / Account
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
