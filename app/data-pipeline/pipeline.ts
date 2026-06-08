#!/usr/bin/env tsx
/**
 * SolarCycle AI – Phase 1 Public Data Pipeline
 *
 * Reads raw public datasets from app/data-real/, normalizes them, and writes
 * output CSVs to app/data-pipeline/output/.
 *
 * Run from the app/ directory:
 *   npm run pipeline
 *
 * Missing raw files produce clear warnings; the pipeline still completes with
 * whatever data is available.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { writeCsv } from './csv-utils.ts';
import {
  SOURCE_REGISTRY_HEADERS,
  SOLAR_AREA_NODE_HEADERS,
  PRODUCT_MIX_HEADERS,
  FACILITY_NODE_HEADERS,
} from './schemas.ts';
import { SOURCE_REGISTRY } from './source-registry.ts';

import { parseCer } from './parsers/cer.ts';
import { parseSolarVicLga } from './parsers/solar-vic-lga.ts';
import { parseSolarVicProducts } from './parsers/solar-vic-products.ts';
import { parseWasteInfra } from './parsers/waste-infra.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

function ensureOutputDir(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

function writeOutput(filename: string, headers: readonly string[], rows: Record<string, string>[]): void {
  const path = join(OUTPUT_DIR, filename);
  writeFileSync(path, writeCsv(headers as string[], rows));
}

function warn(msg: string): void {
  console.warn(`\n  [MISSING] ${msg}`);
}

function ok(msg: string): void {
  console.log(`  [OK] ${msg}`);
}

async function run(): Promise<void> {
  ensureOutputDir();

  console.log('=== SolarCycle AI — Phase 1 Public Data Pipeline ===');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // ── Source registry ─────────────────────────────────────────────────────────
  writeOutput('source_registry.csv', SOURCE_REGISTRY_HEADERS, SOURCE_REGISTRY as Record<string, string>[]);
  console.log(`Wrote source_registry.csv (${SOURCE_REGISTRY.length} entries)`);

  const warnings: string[] = [];

  // ── Solar area nodes ─────────────────────────────────────────────────────────
  console.log('\n── Solar area nodes ──────────────────────────────────────────');

  const allSolarNodes: Record<string, string>[] = [];

  // CER postcode solar data (file already present locally)
  console.log('CER postcode solar:');
  const cerResult = parseCer();
  if (!cerResult.found) {
    warn(cerResult.warningMessage ?? 'CER file missing');
    warnings.push(cerResult.warningMessage ?? 'CER file missing');
  } else if (cerResult.warningMessage) {
    warn(cerResult.warningMessage);
  } else {
    ok(`${cerResult.nodes.length} Victorian postcode solar area nodes`);
  }
  allSolarNodes.push(...(cerResult.nodes as Record<string, string>[]));

  // Solar Victoria LGA
  console.log('Solar Victoria LGA:');
  const svLgaResult = await parseSolarVicLga();
  if (!svLgaResult.found) {
    warn(svLgaResult.warningMessage ?? 'Solar Victoria LGA file missing');
    warnings.push(svLgaResult.warningMessage ?? 'Solar Victoria LGA file missing');
  } else if (svLgaResult.warningMessage) {
    warn(svLgaResult.warningMessage);
  } else {
    ok(`${svLgaResult.nodes.length} LGA solar area nodes`);
  }
  allSolarNodes.push(...(svLgaResult.nodes as Record<string, string>[]));

  // Combined file for reference — do NOT aggregate installed_system_count across
  // different count_role values (total_installation_base vs program_subsidy_subset).
  writeOutput('solar_area_nodes.csv', SOLAR_AREA_NODE_HEADERS, allSolarNodes);

  // Separate outputs prevent accidental cross-source aggregation (concern #3/#4).
  const postcodeNodes = allSolarNodes.filter(r => r['area_type'] === 'postcode');
  const lgaNodes = allSolarNodes.filter(r => r['area_type'] === 'lga');
  writeOutput('solar_postcode_nodes.csv', SOLAR_AREA_NODE_HEADERS, postcodeNodes);
  writeOutput('solar_lga_nodes.csv', SOLAR_AREA_NODE_HEADERS, lgaNodes);

  console.log(`\nWrote solar_area_nodes.csv      (${allSolarNodes.length} rows — combined, see aggregation warning in schemas.ts)`);
  console.log(`Wrote solar_postcode_nodes.csv  (${postcodeNodes.length} rows — CER, total_installation_base)`);
  console.log(`Wrote solar_lga_nodes.csv       (${lgaNodes.length} rows — SolarVic, program_subsidy_subset)`);

  // ── Product mix ──────────────────────────────────────────────────────────────
  console.log('\n── Product mix ───────────────────────────────────────────────');

  const allProductMix: Record<string, string>[] = [];

  console.log('Solar Victoria PV modules + inverters:');
  const svProductResult = await parseSolarVicProducts();
  if (!svProductResult.found) {
    warn(svProductResult.warningMessage ?? 'Solar Victoria product files missing');
    warnings.push(svProductResult.warningMessage ?? 'Solar Victoria product files missing');
  } else if (svProductResult.warningMessage) {
    warn(svProductResult.warningMessage);
  } else {
    ok(`${svProductResult.records.length} product mix records`);
  }
  allProductMix.push(...(svProductResult.records as Record<string, string>[]));

  writeOutput('product_mix.csv', PRODUCT_MIX_HEADERS, allProductMix);
  console.log(`\nWrote product_mix.csv (${allProductMix.length} rows)`);

  // ── Facility nodes ───────────────────────────────────────────────────────────
  console.log('\n── Facility nodes ────────────────────────────────────────────');

  const allFacilityNodes: Record<string, string>[] = [];

  console.log('Victoria waste and resource recovery infrastructure:');
  const wasteResult = parseWasteInfra();
  if (!wasteResult.found) {
    warn(wasteResult.warningMessage ?? 'Waste infrastructure file missing');
    warnings.push(wasteResult.warningMessage ?? 'Waste infrastructure file missing');
  } else if (wasteResult.warningMessage) {
    warn(wasteResult.warningMessage);
  } else {
    ok(`${wasteResult.nodes.length} facility nodes`);
  }
  allFacilityNodes.push(...(wasteResult.nodes as Record<string, string>[]));

  writeOutput('facility_nodes.csv', FACILITY_NODE_HEADERS, allFacilityNodes);
  console.log(`\nWrote facility_nodes.csv (${allFacilityNodes.length} rows)`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n=== Pipeline complete ===');
  console.log(`  Solar area nodes : ${allSolarNodes.length}`);
  console.log(`  Product mix rows : ${allProductMix.length}`);
  console.log(`  Facility nodes   : ${allFacilityNodes.length}`);

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} dataset(s) missing — see warnings above.`);
    console.log('Download missing files (see README.md) and re-run: npm run pipeline');
  }
}

run().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
