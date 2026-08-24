/**
 * Deterministic gradient picker so each card gets a distinct-but-branded cover
 * (varies by a seed like a slug), without needing an image file.
 */
const GRADIENTS = [
  "from-chart-1/30 to-chart-4/20",
  "from-chart-3/30 to-chart-1/20",
  "from-chart-4/30 to-chart-7/20",
  "from-chart-5/30 to-chart-2/20",
  "from-chart-2/30 to-chart-10/20",
  "from-chart-7/30 to-chart-9/20",
  "from-chart-9/30 to-chart-5/20",
  "from-chart-10/30 to-chart-3/20",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickGradient(seed: string): string {
  return GRADIENTS[hash(seed) % GRADIENTS.length];
}
