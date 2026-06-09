// Number formatting pinned to a fixed locale.
//
// Bare `Number.prototype.toLocaleString()` formats using the HOST's default locale,
// which differs between the SSR/prerender environment and the user's browser (e.g.
// "878.220" vs "878,220"). That divergence triggers React hydration mismatches. Always
// format through these helpers so server and client agree on the same string.

const GROUPED = new Intl.NumberFormat("en-US");

/** Thousands-grouped integer string, locale-stable (e.g. 878220 → "878,220"). */
export function formatNumber(n: number): string {
  return GROUPED.format(n);
}
