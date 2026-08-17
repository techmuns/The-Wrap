"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

/** Mobile-only top bar: menu toggle + wordmark + theme toggle. Hidden on lg+
 *  where the persistent left sidebar takes over. */
export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold tracking-tight">The Wrap</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
