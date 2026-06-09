// Real Victorian solar data for the Problem section.
//
// Install series: aggregated from the Clean Energy Regulator's "Small-scale
// installations by postcode" dataset (data-real/cer_sgu_solar_postcode.csv),
// summed over all Victorian postcodes (3000–3999). Pre-computed here so the app
// stays deterministic and doesn't parse 2,800 rows at runtime.
//
// Waste figures: Sustainability Victoria, "Victorian photovoltaic panel systems
// material flow analysis" + national projections (see SOURCES below).

export interface InstallYear {
  year: number;
  installs: number;
  /** age-based lifecycle bucket relative to ~2026 */
  band: "eol" | "ageing" | "healthy";
}

// Victorian rooftop systems installed per year (CER). "≤2010" folds in the
// historic 2001–2010 total. 2026 is partial (Jan–Apr) so it is omitted.
export const VIC_INSTALLS: InstallYear[] = [
  { year: 2010, installs: 47721, band: "eol" }, // 2001–2010 combined
  { year: 2011, installs: 60255, band: "eol" },
  { year: 2012, installs: 66238, band: "eol" },
  { year: 2013, installs: 33384, band: "eol" },
  { year: 2014, installs: 40105, band: "eol" },
  { year: 2015, installs: 31382, band: "ageing" },
  { year: 2016, installs: 26757, band: "ageing" },
  { year: 2017, installs: 31386, band: "ageing" },
  { year: 2018, installs: 47244, band: "ageing" },
  { year: 2019, installs: 61784, band: "ageing" },
  { year: 2020, installs: 74341, band: "healthy" },
  { year: 2021, installs: 83180, band: "healthy" },
  { year: 2022, installs: 62525, band: "healthy" },
  { year: 2023, installs: 68543, band: "healthy" },
  { year: 2024, installs: 67382, band: "healthy" },
  { year: 2025, installs: 60562, band: "healthy" },
];

export const VIC_FACTS = {
  totalSystems: 878220, // VIC total installs, CER (2001–Apr 2026)
  vicShareOfNationalPct: 20, // VIC is ~20% of Australia's 4.4M systems
  eolNowSystems: 247703, // installed ≤2014 → 12+ yrs old, at inverter end-of-life
  wasteTonnes2021: 3000, // Sustainability Victoria
  wasteTonnes2035: 26000, // Sustainability Victoria (up to)
  wasteCagrPct: 15, // compound annual growth rate, Sustainability Victoria
  panelsPerYear2035: 1000000, // "almost a million panels a year" by 2035
};

export const VIC_SOURCES = [
  { label: "Clean Energy Regulator — small-scale installs by postcode (2026)", short: "Clean Energy Regulator" },
  { label: "Sustainability Victoria — PV panel systems material flow analysis", short: "Sustainability Victoria" },
];
