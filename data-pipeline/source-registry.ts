import type { SourceRecord } from './schemas.ts';

// Static registry of all public data sources for Phase 1.
// retrieved_at is set only for files that have been downloaded locally.
// PLACEHOLDER entries must be downloaded before the pipeline can parse them.

export const SOURCE_REGISTRY: SourceRecord[] = [
  {
    source_id: 'cer_postcode_solar',
    name: 'CER Small-Scale Installation Postcode Data (SGU Solar)',
    url: 'https://cer.gov.au/markets/reports-and-data/small-scale-installation-postcode-data',
    publisher: 'Clean Energy Regulator',
    license: 'CC BY 4.0',
    retrieved_at: '2026-06-06',
    file_path: 'app/data-real/cer_sgu_solar_postcode.csv',
    coverage_start: '2001-01-01',
    coverage_end: '2026-04-30',
    notes: 'Monthly solar SGU installation counts by Australian postcode. Pipeline filters to Victorian postcodes (3000-3999).',
  },
  {
    source_id: 'solar_vic_lga',
    name: 'Solar Victoria Products and Systems Installed per LGA',
    url: 'https://discover.data.vic.gov.au/dataset/products-and-systems-installed-per-local-government-area-lga',
    publisher: 'Solar Victoria / Department of Energy Environment and Climate Action',
    license: 'CC BY 4.0',
    retrieved_at: '2026-06-07',
    file_path: 'app/data-real/solar_vic_lga.xlsx',
    coverage_start: '2019-03-01',
    coverage_end: '2025-12-31',
    notes: 'Solar Homes Program rebate/loan installation counts per LGA. Publication date 2026-01-01.',
  },
  {
    source_id: 'solar_vic_pv_modules',
    name: 'Solar Victoria PV Module Models (January 2026)',
    url: 'https://discover.data.vic.gov.au/dataset/solar-pv-modules-january-2026/resource/827a06b8-c1a7-4f0f-8c1d-51fc73ccdc6b',
    publisher: 'Solar Victoria / Department of Energy Environment and Climate Action',
    license: 'CC BY 4.0',
    retrieved_at: '2026-06-07',
    file_path: 'app/data-real/solar_vic_pv_modules.xlsx',
    coverage_start: '2019-07-01',
    coverage_end: '2025-12-31',
    notes: 'Count of PV modules installed under Solar Victoria rebate/loan by brand, model, capacity, quarter. Publication date 2026-01-01.',
  },
  {
    source_id: 'solar_vic_inverters',
    name: 'Solar Victoria Inverter Models (January 2026)',
    url: 'https://discover.data.vic.gov.au/dataset/inverter-models-january-2026/resource/b1a43da1-5974-449f-a031-02431f304a90',
    publisher: 'Solar Victoria / Department of Energy Environment and Climate Action',
    license: 'CC BY 4.0',
    retrieved_at: '2026-06-07',
    file_path: 'app/data-real/solar_vic_inverters.xlsx',
    coverage_start: '2019-07-01',
    coverage_end: '2025-12-31',
    notes: 'Count of inverter models installed under Solar Victoria rebate/loan by brand, model, rated power, quarter. Publication date 2026-01-01.',
  },
  {
    source_id: 'vic_waste_infra',
    name: "Victoria's Waste and Resource Recovery Infrastructure Map Data",
    url: 'https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/1dc1c2d9-515d-426b-8548-efac5c53e8bc',
    publisher: 'Sustainability Victoria',
    license: 'CC BY 4.0',
    retrieved_at: '2026-06-07',
    file_path: 'app/data-real/vic_waste_infrastructure.csv',
    coverage_start: '',
    coverage_end: '2025-03-01',
    notes: 'Victoria waste and resource recovery facility locations with coordinates, type, and owner. March 2025 edition.',
  },
];

export function getSource(id: string): SourceRecord | undefined {
  return SOURCE_REGISTRY.find(s => s.source_id === id);
}

export function isSourceAvailable(id: string): boolean {
  const s = getSource(id);
  return !!s && !!s.retrieved_at && !s.notes.startsWith('PLACEHOLDER');
}
