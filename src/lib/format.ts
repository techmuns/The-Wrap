const DASH = "—"; // em dash for missing values

/** Plain number with Indian digit grouping. */
export function formatQty(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return DASH;
  return n.toLocaleString("en-IN");
}

/** Rupee price, e.g. ₹302.04 */
export function formatPrice(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return DASH;
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Rupee value rendered in crore (1 cr = 10,000,000), e.g. ₹25.41 cr.
 * Falls back to lakh for small values so tiny deals don't read as ₹0.00 cr.
 */
export function formatCrore(rupees: number | null | undefined): string {
  if (rupees == null || !Number.isFinite(rupees)) return DASH;
  const cr = rupees / 1e7;
  if (Math.abs(cr) < 0.01 && rupees !== 0) {
    const lakh = rupees / 1e5;
    return `₹${lakh.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} L`;
  }
  return `₹${cr.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} cr`;
}
