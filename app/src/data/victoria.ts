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

export interface PostcodeInstallTotal {
  postcode: string;
  name: string;
  installs: number;
  historicPre2011: number;
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

// Top Victorian postcodes by all-time total rooftop-solar systems in the CER file.
// Sorted by "Total Installation Quantity"; includes the historic 2001-2010 cohort.
export const VIC_TOP_POSTCODES: PostcodeInstallTotal[] = [
  { postcode: "3029", name: "Hoppers Crossing / Tarneit / Truganina", installs: 26873, historicPre2011: 764 },
  { postcode: "3977", name: "Cranbourne", installs: 19979, historicPre2011: 646 },
  { postcode: "3064", name: "Craigieburn / Mickleham", installs: 19852, historicPre2011: 397 },
  { postcode: "3030", name: "Werribee / Point Cook", installs: 18356, historicPre2011: 781 },
  { postcode: "3978", name: "Clyde / Clyde North", installs: 11601, historicPre2011: 12 },
  { postcode: "3805", name: "Narre Warren", installs: 9074, historicPre2011: 477 },
  { postcode: "3023", name: "Caroline Springs / Burnside", installs: 8717, historicPre2011: 676 },
  { postcode: "3806", name: "Berwick / Harkaway", installs: 8623, historicPre2011: 424 },
  { postcode: "3810", name: "Pakenham", installs: 8420, historicPre2011: 306 },
  { postcode: "3350", name: "Ballarat", installs: 8205, historicPre2011: 362 },
  { postcode: "3551", name: "Bendigo region", installs: 7910, historicPre2011: 314 },
  { postcode: "3216", name: "Belmont / Grovedale", installs: 7757, historicPre2011: 499 },
  { postcode: "3150", name: "Glen Waverley", installs: 7713, historicPre2011: 594 },
  { postcode: "3754", name: "Doreen / Mernda", installs: 7427, historicPre2011: 145 },
  { postcode: "3024", name: "Wyndham Vale / Manor Lakes", installs: 7297, historicPre2011: 194 },
];

export const VIC_SOURCES = [
  { label: "Clean Energy Regulator - small-scale installs by postcode (2026)", short: "Clean Energy Regulator" },
  { label: "Sustainability Victoria - PV panel systems material flow analysis", short: "Sustainability Victoria" },
];
