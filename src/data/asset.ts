// Featured asset for the Solution + Passport views: the Wyndham inverter (INV_001)
// whose health is trending toward failure. Health series and passport chain are
// generated deterministically so the demo is identical on every run.

import { shortHash } from "../lib/hash";
import { breakingRisk, riskScore } from "../lib/risk";
import type { HealthReading, PassportEvent } from "./types";

export const FEATURED_ASSET = {
  asset_id: "INV_001",
  site_id: "SITE_001",
  site_name: "Wyndham Rooftop Cluster",
  lga: "Wyndham",
  asset_type: "string_inverter",
  serial_number: "INV-WYN-0001",
  manufacturer: "MockSolar",
  model: "MS-5K",
  capacity_wp: 5000,
  installation_date: "2013-04-12",
  expected_lifespan_years: 12,
  state_of_health: 72,
  estimated_end_of_life_window: "2029-2031",
  predicted_fault_type: "overheating",
  estimated_failure_window_days: 21,
  lifecycle_status: "ready_for_collection",
};

const HOURS = 12;
const ageYears =
  (Date.parse("2026-06-06") - Date.parse(FEATURED_ASSET.installation_date)) /
  (365.25 * 24 * 3600 * 1000);

// 12 hourly readings showing a degrading inverter: temperature and THD climb,
// efficiency falls, risk score rises into the "likely_breaking" band.
export const HEALTH_SERIES: HealthReading[] = Array.from({ length: HOURS }, (_, h) => {
  const p = h / (HOURS - 1); // 0..1 progression across the day
  const temperature_c = Math.round(58 + 22 * p);
  const thd = Math.round((3.2 + 5.0 * p) * 10) / 10;
  const conversion_efficiency = Math.round((96 - 7.5 * p) * 10) / 10;
  const ac_voltage = Math.round(232 + 9 * p);
  const dc_voltage = Math.round(610 - 30 * p);
  const current = Math.round((16.5 + 2.4 * p) * 10) / 10;
  const power_factor = Math.round((0.97 - 0.07 * p) * 100) / 100;

  const score = riskScore({
    temperature_c,
    thd,
    conversion_efficiency,
    ac_voltage,
    age_years: ageYears,
    expected_lifespan_years: FEATURED_ASSET.expected_lifespan_years,
  });

  return {
    timestamp: `${String(8 + h).padStart(2, "0")}:00`,
    dc_voltage,
    ac_voltage,
    current,
    temperature_c,
    conversion_efficiency,
    power_factor,
    thd,
    risk_score: score,
  };
});

export const LATEST_READING = HEALTH_SERIES[HEALTH_SERIES.length - 1];
export const LATEST_RISK = LATEST_READING.risk_score;
export const LATEST_BREAKING_RISK = breakingRisk(LATEST_RISK);

// Append-only passport event log with a chained hash (previous_event_hash -> event_hash).
function buildEvents(): PassportEvent[] {
  const base = [
    { event_type: "manufactured", timestamp: "2013-02-01T09:00:00+10:00", actor: "MockSolar", notes: "Inverter manufactured (model MS-5K)." },
    { event_type: "installed", timestamp: "2013-04-12T10:00:00+10:00", actor: "Installer Co", notes: "Installed at Wyndham Rooftop Cluster." },
    { event_type: "health_checked", timestamp: "2026-06-06T10:00:00+10:00", actor: "SolarCycle AI", notes: "Telemetry ingested: temp 80C, THD 8.2%, efficiency 88.5%." },
    { event_type: "fault_predicted", timestamp: "2026-06-06T10:05:00+10:00", actor: "SolarCycle AI", notes: `Risk ${LATEST_RISK} -> likely_breaking (overheating). Failure window ~21 days.` },
  ];

  let previous = "genesis";
  return base.map((e, idx) => {
    const event_id = `EVT_${String(idx + 1).padStart(3, "0")}`;
    const event_hash = shortHash(
      `${event_id}|${e.event_type}|${e.timestamp}|${previous}`,
    );
    const evt: PassportEvent = {
      event_id,
      asset_id: FEATURED_ASSET.asset_id,
      ...e,
      previous_event_hash: previous,
      event_hash,
    };
    previous = event_hash;
    return evt;
  });
}

export const PASSPORT_EVENTS: PassportEvent[] = buildEvents();

// The event appended once the optimizer schedules collection (revealed in the demo).
export function collectionScheduledEvent(): PassportEvent {
  const previous = PASSPORT_EVENTS[PASSPORT_EVENTS.length - 1].event_hash;
  const event_id = `EVT_${String(PASSPORT_EVENTS.length + 1).padStart(3, "0")}`;
  return {
    event_id,
    asset_id: FEATURED_ASSET.asset_id,
    event_type: "collection_scheduled",
    timestamp: "2026-06-06T11:00:00+10:00",
    actor: "SolarCycle AI",
    notes: "Collection scheduled after likely_breaking warning and route optimization.",
    previous_event_hash: previous,
    event_hash: shortHash(`${event_id}|collection_scheduled|2026-06-06T11:00:00+10:00|${previous}`),
  };
}
