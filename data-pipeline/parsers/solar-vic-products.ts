import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import type { ProductMixRecord } from '../schemas.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PV_FILE = join(__dirname, '../../data-real/solar_vic_pv_modules.xlsx');
const INV_FILE = join(__dirname, '../../data-real/solar_vic_inverters.xlsx');

const PV_SOURCE_ID = 'solar_vic_pv_modules';
const INV_SOURCE_ID = 'solar_vic_inverters';
const PV_SOURCE_URL =
  'https://discover.data.vic.gov.au/dataset/solar-pv-modules-january-2026/resource/827a06b8-c1a7-4f0f-8c1d-51fc73ccdc6b';
const INV_SOURCE_URL =
  'https://discover.data.vic.gov.au/dataset/inverter-models-january-2026/resource/b1a43da1-5974-449f-a031-02431f304a90';

export interface SolarVicProductsParseResult {
  records: ProductMixRecord[];
  found: boolean;
  warningMessage?: string;
}

// Both PV modules and inverters use the same wide-format layout:
//   Row 1: copyright/disclaimer
//   Row 2: "Quarter of Installation date" (merged header spanning quarterly cols)
//   Row 3: column labels — col 1=brand name, col 2=product name, col 3=capacity,
//           cols 4..N = quarter labels like "2019 Q3", "2019 Q4", ...
//   Row 4+: data rows, cols 4..N hold install counts per quarter

async function parseProductSheet(
  filePath: string,
  productType: string,
  sourceId: string,
  sourceUrl: string,
  idPrefix: string,
): Promise<ProductMixRecord[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  // Read quarter labels from row 3, cols 4 onwards
  const headerRow = ws.getRow(3).values as (string | null | undefined)[];
  const quarters: string[] = [];
  for (let colIdx = 4; colIdx < headerRow.length; colIdx++) {
    quarters.push(String(headerRow[colIdx] ?? '').trim());
  }

  const records: ProductMixRecord[] = [];
  let modelIdx = 0;

  for (let rowIdx = 4; rowIdx <= ws.rowCount; rowIdx++) {
    const row = ws.getRow(rowIdx).values as (string | number | null | undefined)[];
    const brand = String(row[1] ?? '').trim();
    const model = String(row[2] ?? '').trim();
    const capacityRaw = String(row[3] ?? '').trim();
    if (!model && !brand) continue;

    const toNum = (v: unknown): number => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    // Emit one record per quarter that has a non-zero count
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
      const count = toNum(row[4 + qIdx]);
      if (count === 0) continue;

      modelIdx++;
      records.push({
        product_mix_id: `${idPrefix}_${String(modelIdx).padStart(5, '0')}`,
        area_id: '',            // statewide — not allocated to any geography
        product_type: productType,
        manufacturer: brand,
        model: model,
        capacity_w: capacityRaw,
        count: String(count),
        install_quarter: quarters[qIdx] ?? '',
        area_allocation_method: 'not_allocated',
        count_granularity: 'quarterly_program_count',
        source_id: sourceId,
        source_url: sourceUrl,
        data_confidence: 'observed_aggregate',
        derivation_method: 'direct_count_from_solar_victoria_rebate_program_data',
      });
    }
  }

  return records;
}

export async function parseSolarVicProducts(): Promise<SolarVicProductsParseResult> {
  const warnings: string[] = [];

  if (!existsSync(PV_FILE)) {
    warnings.push([
      `Solar Victoria PV modules file not found: ${PV_FILE}`,
      `  Download XLSX from: ${PV_SOURCE_URL}`,
      `  Save as: app/data-real/solar_vic_pv_modules.xlsx`,
    ].join('\n'));
  }

  if (!existsSync(INV_FILE)) {
    warnings.push([
      `Solar Victoria inverters file not found: ${INV_FILE}`,
      `  Download XLSX from: ${INV_SOURCE_URL}`,
      `  Save as: app/data-real/solar_vic_inverters.xlsx`,
    ].join('\n'));
  }

  if (warnings.length > 0) {
    return { records: [], found: false, warningMessage: warnings.join('\n') };
  }

  const [pvRecords, invRecords] = await Promise.all([
    parseProductSheet(PV_FILE, 'pv_module', PV_SOURCE_ID, PV_SOURCE_URL, 'pvm'),
    parseProductSheet(INV_FILE, 'inverter', INV_SOURCE_ID, INV_SOURCE_URL, 'inv'),
  ]);

  return { records: [...pvRecords, ...invRecords], found: true };
}
