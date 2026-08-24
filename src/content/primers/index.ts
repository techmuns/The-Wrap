import type { Primer } from "@/types/primer";
import cement from "./cement";
import footwear from "./footwear";
import solar from "./solar";

/** All industry primers. */
export const primers: Primer[] = [cement, footwear, solar].sort((a, b) =>
  a.title.localeCompare(b.title)
);

export function getPrimer(slug: string): Primer | undefined {
  return primers.find((p) => p.slug === slug);
}

export function getPrimerSlugs(): string[] {
  return primers.map((p) => p.slug);
}
