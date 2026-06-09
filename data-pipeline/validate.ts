#!/usr/bin/env tsx
/**
 * SolarCycle AI – Pipeline validation / quality check
 *
 * Reads the normalized output files and reports counts, coverage gaps,
 * and data quality issues. Does not modify any files.
 *
 * Run from the app/ directory:
 *   npm run pipeline:validate
 */
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { readCsv } from './csv-utils.ts';
import { SOURCE_REGISTRY, isSourceAvailable } from './source-registry.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

function readOutput(filename: string): Record<string, string>[] {
  const path = join(OUTPUT_DIR, filename);
  if (!existsSync(path)) return [];
  return readCsv(path).rows;
}

function pct(n: number, total: number): string {
  if (total === 0) return '—';
  return `${((n / total) * 100).toFixed(1)}%`;
}

function validate(): void {
  console.log('=== SolarCycle AI — Pipeline Validation Report ===\n');

  const runDate = new Date().toISOString().slice(0, 10);
  console.log(`Report date: ${runDate}`);
  const outputExists = existsSync(OUTPUT_DIR);
  console.log(`Output directory exists: ${outputExists ? 'yes' : 'NO — run npm run pipeline first'}\n`);

  // ── Source registry ──────────────────────────────────────────────────────────
  const available = SOURCE_REGISTRY.filter(s => isSourceAvailable(s.source_id));
  const missing = SOURCE_REGISTRY.filter(s => !isSourceAvailable(s.source_id));

  console.log(`Sources in registry  : ${SOURCE_REGISTRY.length}`);
  console.log(`Sources with local data: ${available.length}`);
  console.log(`Sources missing      : ${missing.length}`);
  console.log('');

  SOURCE_REGISTRY.forEach(s => {
    const status = isSourceAvailable(s.source_id) ? 'OK     ' : 'MISSING';
    console.log(`  [${status}] ${s.source_id}`);
    if (!isSourceAvailable(s.source_id)) {
      console.log(`           → ${s.url}`);
    }
  });

  // ── Solar area nodes ─────────────────────────────────────────────────────────
  const solarNodes = readOutput('solar_area_nodes.csv');
  const missingCoords = solarNodes.filter(r => !r['centroid_lat'] || !r['centroid_lon']).length;
  const missingLga = solarNodes.filter(r => !r['lga']).length;
  const missingPostcode = solarNodes.filter(r => !r['postcode']).length;
  const missingCapacity = solarNodes.filter(r => !r['installed_capacity_kw']).length;
  const byType: Record<string, number> = {};
  for (const n of solarNodes) {
    byType[n['area_type'] ?? ''] = (byType[n['area_type'] ?? ''] ?? 0) + 1;
  }

  console.log('\n── Solar area nodes ──────────────────────────────────────────');
  console.log(`Total rows               : ${solarNodes.length}`);
  if (solarNodes.length > 0) {
    Object.entries(byType).forEach(([t, c]) => console.log(`  ${t.padEnd(20)}: ${c}`));
    console.log(`Missing coordinates      : ${missingCoords} (${pct(missingCoords, solarNodes.length)}) — expected until Phase 2 spatial join`);
    console.log(`Missing LGA              : ${missingLga} (${pct(missingLga, solarNodes.length)}) — expected for postcode records until spatial join`);
    console.log(`Missing postcode         : ${missingPostcode} (${pct(missingPostcode, solarNodes.length)}) — expected for lga-type nodes`);
    console.log(`Missing installed_capacity: ${missingCapacity} (${pct(missingCapacity, solarNodes.length)}) — expected where source is count-only`);
    const totalSystems = solarNodes.reduce((s, r) => s + (parseInt(r['installed_system_count'] ?? '0') || 0), 0);
    console.log(`Total installed systems  : ${totalSystems.toLocaleString()}`);
  }

  // ── Product mix ──────────────────────────────────────────────────────────────
  const productMix = readOutput('product_mix.csv');
  const pvModules = productMix.filter(r => r['product_type'] === 'pv_module').length;
  const inverters = productMix.filter(r => r['product_type'] === 'inverter').length;

  console.log('\n── Product mix ───────────────────────────────────────────────');
  console.log(`Total rows               : ${productMix.length}`);
  if (productMix.length > 0) {
    console.log(`  pv_module              : ${pvModules}`);
    console.log(`  inverter               : ${inverters}`);
  } else {
    console.log('  No records — Solar Victoria XLSX files needed (see source registry)');
  }

  // ── Facility nodes ───────────────────────────────────────────────────────────
  const facilities = readOutput('facility_nodes.csv');
  const facMissingCoords = facilities.filter(r => !r['lat'] || !r['lon']).length;
  const facMissingLga = facilities.filter(r => !r['lga']).length;
  const facUnknownCapacity = facilities.filter(r => r['capacity_confidence'] === 'unknown').length;

  console.log('\n── Facility nodes ────────────────────────────────────────────');
  console.log(`Total rows               : ${facilities.length}`);
  if (facilities.length > 0) {
    console.log(`Missing coordinates      : ${facMissingCoords} (${pct(facMissingCoords, facilities.length)})`);
    console.log(`Missing LGA              : ${facMissingLga} (${pct(facMissingLga, facilities.length)})`);
    console.log(`Unknown capacity         : ${facUnknownCapacity} (${pct(facUnknownCapacity, facilities.length)})`);
  } else {
    console.log('  No records — waste infrastructure CSV needed (see source registry)');
  }

  // ── Issues summary ───────────────────────────────────────────────────────────
  console.log('\n── Issues ────────────────────────────────────────────────────');
  const issues: string[] = [];

  if (!outputExists) {
    issues.push('Output directory missing — run: npm run pipeline');
  }
  if (solarNodes.length === 0) {
    issues.push('No solar area nodes — check CER file and run pipeline');
  }
  if (productMix.length === 0) {
    issues.push('No product mix records — download Solar Victoria XLSX files');
  }
  if (facilities.length === 0) {
    issues.push('No facility nodes — download waste infrastructure CSV');
  }
  const lgaCount = byType['lga'] ?? 0;
  const unexpectedMissingPostcode = missingPostcode - lgaCount;
  if (unexpectedMissingPostcode > 0) {
    issues.push(`${unexpectedMissingPostcode} non-LGA solar area nodes missing postcode — investigate CER parser`);
  }

  // Aggregation guard: warn if the combined file holds both count_roles — any code that
  // sums installed_system_count across all rows will double-count.
  const countRoles = new Set(solarNodes.map(r => r['count_role'] ?? ''));
  if (countRoles.has('total_installation_base') && countRoles.has('program_subsidy_subset')) {
    issues.push(
      'AGGREGATION RISK: solar_area_nodes.csv contains both total_installation_base (CER) ' +
      'and program_subsidy_subset (SolarVic) rows. Use solar_postcode_nodes.csv or ' +
      'solar_lga_nodes.csv for single-source aggregation. Never sum installed_system_count ' +
      'across both count_roles for the same geography — counts overlap.',
    );
  }
  if (facMissingCoords > 0 && facilities.length > 0) {
    issues.push(`${facMissingCoords} facilities missing coordinates — check column mapping in waste-infra parser`);
  }

  if (issues.length === 0) {
    console.log('  All checks passed.');
  } else {
    issues.forEach(i => console.log(`  ISSUE: ${i}`));
  }

  // Remind about expected gaps
  console.log('\n── Expected gaps (not issues) ────────────────────────────────');
  console.log('  centroid_lat/lon empty on solar nodes → Phase 2 Vicmap spatial join');
  console.log('  lga empty on postcode-level solar nodes → Phase 2 spatial join');
  console.log('  installed_capacity_kw empty → requires Solar Victoria capacity data');
  console.log('  estimated_panel/inverter/mass empty → requires product mix (Phase 2)');
  console.log('  capacity_kg_per_day unknown on facilities → not in source dataset');
  console.log('\n── Time-grain notes ──────────────────────────────────────────');
  console.log('  CER rows: count_granularity=monthly_aggregated_to_postcode_total');
  console.log('            install_period covers 2001–Apr 2026 at monthly resolution');
  console.log('  SolarVic LGA rows: count_granularity=period_cumulative_program_count');
  console.log('            install_period covers 2019-03–2025-12 (program start to data cut)');
  console.log('  Product mix rows: count_granularity=quarterly_program_count');
  console.log('            install_quarter is a single quarter label (e.g. "2021 Q2")');
  console.log('  Do not compare counts across these rows without temporal normalization.');

  console.log('\n=== End of validation report ===');
}

validate();
