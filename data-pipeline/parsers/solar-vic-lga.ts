import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import type { SolarAreaNode } from '../schemas.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LGA_FILE = join(__dirname, '../../data-real/solar_vic_lga.xlsx');
const SOURCE_ID = 'solar_vic_lga';
const SOURCE_URL =
  'https://discover.data.vic.gov.au/dataset/products-and-systems-installed-per-local-government-area-lga';

export interface SolarVicLgaParseResult {
  nodes: SolarAreaNode[];
  found: boolean;
  warningMessage?: string;
}

function slugLga(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// Sheet structure (1-based ExcelJS row indices):
//   Row 1: copyright/disclaimer (merged cells)
//   Row 2: product category labels (Solar PV, Battery, Hot Water, Heating Upgrades)
//   Row 3: sub-category labels — col 2=Solar PV (Business), 3=Owner Occupier, 4=Rental,
//           5=Battery (Loan), 6=Battery (Rebate), 7=Virtual Power Plant, 8=Hot Water, 9=Heating
//   Row 4+: data rows — col 1=LGA name, cols 2-9=counts

export async function parseSolarVicLga(): Promise<SolarVicLgaParseResult> {
  if (!existsSync(LGA_FILE)) {
    return {
      nodes: [],
      found: false,
      warningMessage: [
        `Solar Victoria LGA file not found: ${LGA_FILE}`,
        `  Download XLSX from: ${SOURCE_URL}`,
        `  Save as: app/data-real/solar_vic_lga.xlsx`,
      ].join('\n'),
    };
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(LGA_FILE);
  const ws = wb.worksheets[0];

  const nodes: SolarAreaNode[] = [];

  for (let rowIdx = 4; rowIdx <= ws.rowCount; rowIdx++) {
    const row = ws.getRow(rowIdx).values as (string | number | null | undefined)[];
    const lgaName = String(row[1] ?? '').trim();
    if (!lgaName || lgaName.toLowerCase() === 'total') continue;

    const toNum = (v: unknown): number => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    const totalPv = toNum(row[2]) + toNum(row[3]) + toNum(row[4]);

    nodes.push({
      solar_area_id: `san_svic_lga_${slugLga(lgaName)}`,
      area_type: 'lga',
      postcode: '',
      lga: lgaName,
      centroid_lat: '',
      centroid_lon: '',
      installed_system_count: String(totalPv),
      installed_capacity_kw: '',
      estimated_panel_count: '',
      estimated_inverter_count: '',
      estimated_mass_kg: '',
      install_period_start: '2019-03-01',
      install_period_end: '2025-12-31',
      // program_subsidy_subset: this count covers Solar Homes rebates only.
      // Do NOT add to CER total_installation_base for the same geography.
      count_role: 'program_subsidy_subset',
      count_granularity: 'period_cumulative_program_count',
      source_ids: SOURCE_ID,
      data_confidence: 'observed_aggregate',
      source_url: SOURCE_URL,
      derivation_method:
        'sum_of_solar_victoria_lga_rebate_counts_business_plus_owner_plus_rental',
    });
  }

  return { nodes, found: true };
}
