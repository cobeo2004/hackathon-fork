// REAL DATA — Clean Energy Regulator (Australian Government).
// Source: "SRES postcode data — Installations 2011 to present and totals", SGU-Solar.
// https://cer.gov.au/document_page/sres-postcode-data-installations-2011-to-present
// Downloaded 2026-06-06 to app/data-real/cer_sgu_solar_postcode.csv (2,811 postcodes,
// monthly installs 2001 → Apr 2026). The numbers below were extracted from that file
// for the nine demo postcodes and baked in so the app stays deterministic and offline.

export const CER_SOURCE = {
  name: "Clean Energy Regulator - SRES small-scale solar (SGU) postcode installations",
  url: "https://cer.gov.au/document_page/sres-postcode-data-installations-2011-to-present",
  retrieved: "2026-06-06",
  coverage: "2001 – Apr 2026",
};

// Real cumulative rooftop-solar installations per postcode (CER total column).
export const CER_INSTALLS: Record<string, number> = {
  "3029": 26873, // Wyndham
  "3337": 6022, // Melton
  "3020": 4566, // Brimbank
  "3752": 3255, // Whittlesea
  "3072": 3118, // Darebin
  "3058": 3652, // Merri-bek
  "3012": 2093, // Maribyrnong
  "3061": 1060, // Hume
  "3039": 980, // Moonee Valley
};

// Real "pre-2011" install cohort per postcode (CER historic 2001–2010 column).
// These panels reach the standard 25-year end-of-life around 2026–2035, i.e. the
// near-term recovery wave. Used for a data-backed end-of-life forecast.
export const CER_EOL_COHORT_PRE2011: Record<string, number> = {
  "3029": 764,
  "3337": 310,
  "3020": 572,
  "3752": 129,
  "3072": 157,
  "3058": 219,
  "3012": 146,
  "3061": 18,
  "3039": 84,
};

export const CER_TOTAL_INSTALLS = Object.values(CER_INSTALLS).reduce((a, b) => a + b, 0);
export const CER_TOTAL_EOL_COHORT = Object.values(CER_EOL_COHORT_PRE2011).reduce(
  (a, b) => a + b,
  0,
);
