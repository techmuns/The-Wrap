"use client";

import { Download } from "lucide-react";

/**
 * "Download report" — opens the browser's print dialog with the print-optimized
 * stylesheet applied, so the reader can Save as PDF. No server or library needed.
 */
export function DownloadReport() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      <Download className="h-4 w-4" />
      Download report
    </button>
  );
}
