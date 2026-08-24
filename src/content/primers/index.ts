import type { Primer } from "@/types/primer";
import automobiles from "./automobiles";
import banks from "./banks";
import cement from "./cement";
import fmcg from "./fmcg";
import footwear from "./footwear";
import itServices from "./it-services";
import pharma from "./pharma";
import solar from "./solar";

/** All industry primers. */
export const primers: Primer[] = [
  automobiles,
  banks,
  cement,
  fmcg,
  footwear,
  itServices,
  pharma,
  solar,
].sort((a, b) => a.title.localeCompare(b.title));

export function getPrimer(slug: string): Primer | undefined {
  return primers.find((p) => p.slug === slug);
}

export function getPrimerSlugs(): string[] {
  return primers.map((p) => p.slug);
}
