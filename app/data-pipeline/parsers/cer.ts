import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readCsv } from '../csv-utils.ts';
import type { SolarAreaNode } from '../schemas.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CER_FILE = join(__dirname, '../../data-real/cer_sgu_solar_postcode.csv');
const SOURCE_ID = 'cer_postcode_solar';
const SOURCE_URL = 'https://cer.gov.au/markets/reports-and-data/small-scale-installation-postcode-data';

// Victorian postcodes: 3000-3999 (metro + regional), 8000-8999 (PO box / LVR)
function isVictorianPostcode(postcode: string): boolean {
  const n = parseInt(postcode, 10);
  return (n >= 3000 && n <= 3999) || (n >= 8000 && n <= 8999);
}

// CER CSV stores some totals with comma thousands separators inside quotes, e.g. "4,358"
function parseCount(value: string): number {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
}

// Column names look like "Jan 2011 - Installation Quantity"
function extractMonthYear(colName: string): { year: number; month: number } | null {
  const m = colName.match(/^(\w{3})\s+(\d{4})\s+-/);
  if (!m) return null;
  const monthMap: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };
  const month = monthMap[m[1]];
  if (!month) return null;
  return { month, year: parseInt(m[2]) };
}

function isoDate(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export interface CerParseResult {
  nodes: SolarAreaNode[];
  found: boolean;
  warningMessage?: string;
}

export function parseCer(): CerParseResult {
  if (!existsSync(CER_FILE)) {
    return {
      nodes: [],
      found: false,
      warningMessage: [
        `CER file not found: ${CER_FILE}`,
        `  Download from: ${SOURCE_URL}`,
        `  Save as: app/data-real/cer_sgu_solar_postcode.csv`,
      ].join('\n'),
    };
  }

  const { headers, rows } = readCsv(CER_FILE);
  if (headers.length === 0) {
    return { nodes: [], found: true, warningMessage: 'CER CSV appears empty.' };
  }

  // Column layout:
  //   [0] "Small Unit Installation Postcode"
  //   [1] "Historic Total Installation Quantity (2001 - 2010)"
  //   [2..N-2] "MMM YYYY - Installation Quantity" (monthly)
  //   [N-1] "Total Installation Quantity"
  const postcodeCol = headers[0];
  const historicCol = headers[1];
  const totalCol = headers[headers.length - 1];
  const monthlyHeaders = headers.slice(2, -1);

  const nodes: SolarAreaNode[] = [];

  for (const row of rows) {
    const postcode = (row[postcodeCol] ?? '').trim();
    if (!postcode || !isVictorianPostcode(postcode)) continue;

    const total = parseCount(row[totalCol] ?? '0');
    const historicTotal = parseCount(row[historicCol] ?? '0');
    if (total === 0) continue;

    // Determine installation period from monthly columns
    let firstDate = historicTotal > 0 ? '2001-01-01' : '';
    let lastDate = '';

    for (const col of monthlyHeaders) {
      if (parseCount(row[col] ?? '0') === 0) continue;
      const ym = extractMonthYear(col);
      if (!ym) continue;
      const d = isoDate(ym.year, ym.month);
      if (!firstDate) firstDate = d;
      lastDate = d;
    }

    if (!firstDate) firstDate = '2001-01-01';
    if (!lastDate) lastDate = '2026-04-01';

    // installed_capacity_kw is not available from CER count data alone.
    // Product mix and capacity data from Solar Victoria XLSX files are needed.
    nodes.push({
      solar_area_id: `san_cer_${postcode}`,
      area_type: 'postcode',
      postcode,
      lga: '',                     // requires Phase 2 spatial join with Vicmap boundaries
      centroid_lat: '',            // requires Phase 2 spatial join
      centroid_lon: '',
      installed_system_count: String(total),
      installed_capacity_kw: '',   // not provided by CER count data
      estimated_panel_count: '',   // requires product mix (Phase 2)
      estimated_inverter_count: '',
      estimated_mass_kg: '',
      install_period_start: firstDate,
      install_period_end: lastDate,
      count_role: 'total_installation_base',
      count_granularity: 'monthly_aggregated_to_postcode_total',
      source_ids: SOURCE_ID,
      data_confidence: 'observed_aggregate',
      source_url: SOURCE_URL,
      derivation_method: 'direct_sum_of_cer_monthly_installation_quantities',
    });
  }

  return { nodes, found: true };
}
