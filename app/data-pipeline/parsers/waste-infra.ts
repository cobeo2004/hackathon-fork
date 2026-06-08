import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readCsv } from '../csv-utils.ts';
import type { FacilityNode } from '../schemas.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INFRA_FILE = join(__dirname, '../../data-real/vic_waste_infrastructure.csv');
const SOURCE_ID = 'vic_waste_infra';
const SOURCE_URL =
  'https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/1dc1c2d9-515d-426b-8548-efac5c53e8bc';
const DIRECT_CSV_URL =
  "https://www.vic.gov.au/sites/default/files/2025-03/Victoria%27s-waste-and-resource-recovery-infrastructure-map-data-March-2025.csv";

export interface WasteInfraParseResult {
  nodes: FacilityNode[];
  found: boolean;
  warningMessage?: string;
}

// Known column aliases observed in the Sustainability Victoria infrastructure CSV.
// Actual column names must be verified against the downloaded file.
const COL_ALIASES: Record<keyof Pick<FacilityNode, 'name' | 'facility_type' | 'infrastructure_type' | 'owner' | 'address' | 'suburb' | 'lga' | 'lat' | 'lon' | 'accepted_materials'>, string[]> = {
  name: ['Facility Name', 'Name', 'FACILITY_NAME'],
  facility_type: ['Facility Type', 'Type', 'FACILITY_TYPE'],
  infrastructure_type: ['Infrastructure Type', 'INFRASTRUCTURE_TYPE'],
  owner: ['Facility Owner', 'Owner', 'Operator', 'OWNER'],
  address: ['Address', 'Street Address', 'ADDRESS'],
  suburb: ['Suburb', 'Town', 'SUBURB'],
  lga: ['LGA', 'Local Government Area', 'LGA_NAME'],
  lat: ['Latitude', 'LAT', 'Y'],
  lon: ['Longitude', 'LON', 'LNG', 'LONG', 'X'],
  accepted_materials: ['Accepted Materials', 'Materials', 'ACCEPTED_MATERIALS'],
};

function resolveColumn(headers: string[], aliases: string[]): string | undefined {
  return aliases.find(a => headers.includes(a));
}

function slugify(name: string, index: number): string {
  return `fac_${String(index + 1).padStart(4, '0')}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`;
}

export function parseWasteInfra(): WasteInfraParseResult {
  if (!existsSync(INFRA_FILE)) {
    return {
      nodes: [],
      found: false,
      warningMessage: [
        `Waste infrastructure file not found: ${INFRA_FILE}`,
        `  Download from: ${SOURCE_URL}`,
        `  Direct CSV URL: ${DIRECT_CSV_URL}`,
        `  Save as: app/data-real/vic_waste_infrastructure.csv`,
      ].join('\n'),
    };
  }

  const { headers, rows } = readCsv(INFRA_FILE);
  if (headers.length === 0) {
    return { nodes: [], found: true, warningMessage: 'Waste infrastructure CSV appears empty.' };
  }

  // Resolve column names using known aliases
  const colMap = {} as Record<string, string | undefined>;
  for (const [field, aliases] of Object.entries(COL_ALIASES)) {
    colMap[field] = resolveColumn(headers, aliases);
  }

  const nodes: FacilityNode[] = [];
  let rowIdx = 0;

  for (const row of rows) {
    const name = (colMap['name'] ? row[colMap['name']] : '') ?? '';
    if (!name.trim()) continue;

    const lat = colMap['lat'] ? (row[colMap['lat']] ?? '') : '';
    const lon = colMap['lon'] ? (row[colMap['lon']] ?? '') : '';

    nodes.push({
      facility_id: slugify(name, rowIdx++),
      name: name.trim(),
      facility_type: (colMap['facility_type'] ? row[colMap['facility_type']] : '') ?? '',
      infrastructure_type: (colMap['infrastructure_type'] ? row[colMap['infrastructure_type']] : '') ?? '',
      owner: (colMap['owner'] ? row[colMap['owner']] : '') ?? '',
      address: (colMap['address'] ? row[colMap['address']] : '') ?? '',
      suburb: (colMap['suburb'] ? row[colMap['suburb']] : '') ?? '',
      lga: (colMap['lga'] ? row[colMap['lga']] : '') ?? '',
      lat: lat.trim(),
      lon: lon.trim(),
      accepted_materials: (colMap['accepted_materials'] ? row[colMap['accepted_materials']] : '') ?? '',
      // Solar-specific processing capacity is not in this dataset.
      // If needed, derive a proxy from facility type (marked as inferred).
      capacity_kg_per_day: '',
      capacity_source: 'not_in_source_data',
      capacity_confidence: 'unknown',
      source_id: SOURCE_ID,
      source_url: SOURCE_URL,
      data_confidence: 'observed',
      derivation_method: 'direct_mapping_from_sustainability_vic_csv',
    });
  }

  return { nodes, found: true };
}
