"use client";

import { useEffect } from "react";

/**
 * If the page is opened with ?download=1 (e.g. from the home "Download report"
 * button), open the print dialog automatically so the reader lands straight on
 * the Save-as-PDF flow. The query param is stripped afterwards so a refresh
 * doesn't re-trigger it.
 */
export function AutoPrint() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("download") !== "1" && params.get("print") !== "1") return;
    window.history.replaceState(null, "", window.location.pathname);
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
