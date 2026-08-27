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
      className="no-print inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
    >
      <Download className="h-4 w-4" />
      Download report
    </button>
  );
}
