"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { contentGroup, communityGroup, type NavItem } from "@/lib/nav";
import { ThemeToggle } from "./ThemeToggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function BrandMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-sm font-bold text-background">
        W
      </span>
      <span className="text-sm">The Wrap</span>
    </Link>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(true);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand row */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <BrandMark onNavigate={onClose} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
          {/* Collapsible "Content & Learning" group */}
          <button
            type="button"
            onClick={() => setContentOpen((v) => !v)}
            aria-expanded={contentOpen}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>{contentGroup.label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                !contentOpen && "-rotate-90"
              )}
            />
          </button>
          {contentOpen && (
            <ul className="mt-1 space-y-0.5">
              {contentGroup.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    pathname={pathname}
                    onNavigate={onClose}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Community & Indicators group */}
          <div className="mt-4 border-t pt-4">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {communityGroup.label}
            </div>
            <ul className="mt-1 space-y-0.5">
              {communityGroup.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} pathname={pathname} onNavigate={onClose} />
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t px-4 py-3">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
