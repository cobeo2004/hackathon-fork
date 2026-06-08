# Real Data Context

This folder contains the raw public datasets used by the SolarCycle AI hackathon
demo. The files are kept here so the data story is auditable: another person can
check where the numbers came from, what the columns mean, and which parts of the
demo are real data versus synthetic scenario data.

## Important distinction

The public datasets here are mostly **aggregate data**. They tell us counts by
postcode, LGA, product model, quarter, or facility location. They do **not**
identify individual solar systems, individual households, exact failing assets,
or real collection jobs.

In the app:

- Real data is used for postcode solar context, Victorian install trends,
  end-of-life cohort estimates, product mix, and waste/recovery facility context.
- Synthetic demo assumptions are used for individual demo site coordinates,
  risk scores, inverter telemetry, route distances, collection mass, failure
  windows, and truck/capacity assumptions.

## Files in this folder

| File | Source | What it tells us | Used for |
|---|---|---|---|
| `cer_sgu_solar_postcode.csv` | Clean Energy Regulator | Solar installation counts by postcode and month | Main solar adoption and end-of-life context |
| `solar_vic_lga.xlsx` | Solar Victoria / DEECA | Solar Victoria rebate/loan installs by LGA | LGA-level program install context |
| `solar_vic_pv_modules.xlsx` | Solar Victoria / DEECA | PV module models installed by quarter | Product mix and future material cohort context |
| `solar_vic_inverters.xlsx` | Solar Victoria / DEECA | Inverter models installed by quarter | Product mix and lifecycle context |
| `vic_waste_infrastructure.csv` | Sustainability Victoria | Waste and resource recovery facility locations | Facility map/context for recovery infrastructure |

The data pipeline reads these raw files and writes normalized outputs to
`../data-pipeline/output/`.

## 1. Clean Energy Regulator postcode solar data

File: `cer_sgu_solar_postcode.csv`

Source: Clean Energy Regulator, Australian Government

Dataset: small-scale solar installation postcode data, SGU Solar

Coverage in local file: 2001 to April 2026

What one row means:

Each row is one Australian postcode. The columns show how many small-scale solar
systems were installed in that postcode before 2011, then month-by-month from
January 2011 onward.

Important columns:

| Column | Beginner meaning |
|---|---|
| `Small Unit Installation Postcode` | The postcode where systems were installed. |
| `Historic Total Installation Quantity (2001 - 2010)` | Total installations before 2011. This is useful because older systems are closer to end-of-life. |
| `Jan 2011 - Installation Quantity`, `Feb 2011 - Installation Quantity`, etc. | Number of solar installations in that postcode during that month. |
| `Total Installation Quantity` | Total known installations in that postcode across the full available period. |

How we used it:

- Filtered to Victorian postcodes.
- Summed install counts to create postcode-level solar demand nodes.
- Extracted real totals for the nine demo postcodes used on the map.
- Used the 2001-2010 historic cohort as a rough near-term end-of-life signal.
- Aggregated Victorian yearly install counts for the "problem" chart.

What it does not provide:

- Exact panel count per site.
- Exact address or household-level data.
- Installed capacity in kW.
- Product brand/model.
- Asset health or failure status.

## 2. Solar Victoria LGA installation data

File: `solar_vic_lga.xlsx`

Source: Solar Victoria / Department of Energy, Environment and Climate Action

Coverage in source registry: March 2019 to December 2025

What one row means:

Each row is one Victorian local government area (LGA). The columns count systems
installed with Solar Victoria rebates and/or loans.

Important columns:

| Column | Beginner meaning |
|---|---|
| LGA name | The local government area, such as Wyndham or Melton. |
| `Solar PV (Business)` | Solar PV installs supported for business customers. |
| `Solar PV (Owner Occupier)` | Solar PV installs for owner-occupied homes. |
| `Solar PV (Rental)` | Solar PV installs for rental properties. |
| `Battery (Loan)` | Battery installs supported by a loan. |
| `Battery (Rebate)` | Battery installs supported by a rebate. |
| `Virtual Power Plant` | Installs related to Solar Victoria virtual power plant programs. |
| `Hot Water` | Hot water upgrades. |
| `Heating Upgrades` | Heating upgrade installs. |

How we used it:

- Summed the three Solar PV columns: business, owner occupier, and rental.
- Created LGA-level solar area nodes in the normalized pipeline output.

Important caution:

This is **not** the whole Victorian solar market. It is only Solar Victoria
program data. Do not add it to CER totals as if it were separate demand, because
the datasets overlap.

## 3. Solar Victoria PV module model data

File: `solar_vic_pv_modules.xlsx`

Source: Solar Victoria / DEECA

Coverage in source registry: July 2019 to December 2025

What one row means:

Each row is one PV module product model. The quarter columns count how many
modules of that model were installed through Solar Victoria programs.

Important columns:

| Column | Beginner meaning |
|---|---|
| `PV module brand name` | Brand/manufacturer of the solar panel. |
| `PV module product name` | Product model or model code. |
| `PV module capacity (W)` | Rated capacity of one panel in watts. |
| `2019 Q3`, `2019 Q4`, `2020 Q1`, etc. | Number of modules of that model installed in that quarter. |

How we used it:

- Converted the wide spreadsheet into product mix rows.
- Each output row represents one model in one quarter with a non-zero count.
- Used as product mix context for future material and recycling planning.

What it does not provide:

- The exact household or site where a model was installed.
- The exact postcode/LGA allocation for each product model.
- Real-time health or failure data.

## 4. Solar Victoria inverter model data

File: `solar_vic_inverters.xlsx`

Source: Solar Victoria / DEECA

Coverage in source registry: July 2019 to December 2025

What one row means:

Each row is one inverter product model. The quarter columns count how many
inverters of that model were installed through Solar Victoria programs.

Important columns:

| Column | Beginner meaning |
|---|---|
| `Inverter brand name` | Brand/manufacturer of the inverter. |
| `Inverter product name` | Product model or model code. |
| `Rated inverter AC power (VA per port)` | Inverter power rating. For a beginner, read this as the inverter's rated size. |
| `2019 Q3`, `2019 Q4`, `2020 Q1`, etc. | Number of inverters of that model installed in that quarter. |

How we used it:

- Converted the wide spreadsheet into product mix rows.
- Each output row represents one inverter model in one quarter with a non-zero
  count.
- Used as product lifecycle context.

What it does not provide:

- Individual inverter serial numbers.
- Faults or health status.
- Exact physical installation locations.

## 5. Sustainability Victoria waste infrastructure data

File: `vic_waste_infrastructure.csv`

Source: Sustainability Victoria

Dataset: Victoria's Waste and Resource Recovery Infrastructure Map Data

Coverage in source registry: March 2025 edition

What one row means:

Each row is a real waste or resource recovery facility in Victoria.

Important columns:

| Column | Beginner meaning |
|---|---|
| `Facility Name` | Name of the facility. |
| `Facility Owner` | Organisation that owns or operates the facility. |
| `Facility Type` | Broad role of the facility, such as reprocessor. |
| `Infrastructure Type` | More specific infrastructure category. |
| `Address` | Street address. |
| `Suburb` | Suburb or town. |
| `LGA` | Local government area. |
| `Latitude` | North/south map coordinate. |
| `Longitude` | East/west map coordinate. |

How we used it:

- Mapped each row into a normalized facility node.
- Used coordinates for recovery infrastructure context.
- Kept owner, address, suburb, LGA, facility type, and infrastructure type.

What it does not provide:

- Solar-panel-specific processing capacity.
- Daily throughput in kg/day.
- Whether every facility accepts solar panels.

Because capacity is not in the source, normalized output marks capacity as
unknown.

## Normalized outputs created from these files

The pipeline writes derived CSVs to `../data-pipeline/output/`.

### `solar_area_nodes.csv`

Represents solar demand/context areas.

Key columns:

| Column | Meaning |
|---|---|
| `solar_area_id` | Internal generated ID. |
| `area_type` | `postcode` or `lga`. |
| `postcode` | Postcode if the row is postcode-level. |
| `lga` | LGA if the row is LGA-level or has been spatially joined. |
| `centroid_lat`, `centroid_lon` | Center coordinate of the area; currently empty until spatial join. |
| `installed_system_count` | Number of installed systems represented by the row. |
| `installed_capacity_kw` | Total installed capacity; currently empty where source gives counts only. |
| `estimated_panel_count` | Future estimate, currently empty. |
| `estimated_inverter_count` | Future estimate, currently empty. |
| `estimated_mass_kg` | Future estimated waste/recovery mass, currently empty. |
| `install_period_start`, `install_period_end` | Date range covered by the source data. |
| `source_ids` | Which raw source produced the row. |
| `data_confidence` | Whether the value is observed aggregate data, estimated, etc. |
| `source_url` | Source URL for auditability. |
| `derivation_method` | How the row was calculated. |

### `product_mix.csv`

Represents installed product models by quarter.

Key columns:

| Column | Meaning |
|---|---|
| `product_mix_id` | Internal generated ID. |
| `area_id` | Empty unless product records are allocated to an area in a future phase. |
| `product_type` | `pv_module` or `inverter`. |
| `manufacturer` | Brand/manufacturer. |
| `model` | Product model. |
| `capacity_w` | Product capacity in watts. |
| `count` | Number installed. |
| `install_quarter` | Quarter when those installs happened. |
| `source_id` | Source dataset ID. |
| `source_url` | Source URL. |
| `data_confidence` | Confidence/provenance category. |
| `derivation_method` | How the row was created. |

### `facility_nodes.csv`

Represents waste and recovery facility locations.

Key columns:

| Column | Meaning |
|---|---|
| `facility_id` | Internal generated ID. |
| `name` | Facility name. |
| `facility_type` | Broad facility category. |
| `infrastructure_type` | More specific infrastructure category. |
| `owner` | Facility owner/operator. |
| `address`, `suburb`, `lga` | Location fields. |
| `lat`, `lon` | Map coordinates. |
| `accepted_materials` | Empty because the source file does not provide this field. |
| `capacity_kg_per_day` | Empty because the source does not provide solar-specific capacity. |
| `capacity_source` | Marks whether capacity came from source data or not. |
| `capacity_confidence` | `unknown` when capacity is not available. |
| `source_id`, `source_url` | Provenance fields. |
| `data_confidence` | Confidence/provenance category. |
| `derivation_method` | How the row was created. |

## Real data used directly in the app demo

Some values from the raw data are baked into `../src/data/` so the web app can
run offline and stay deterministic.

Real values:

- CER postcode totals for the nine demo postcodes.
- CER pre-2011 end-of-life cohort for those postcodes.
- Victorian yearly install totals.
- Sustainability Victoria headline waste projections.
- Public facility names/addresses/sources for Cleanaway Laverton MRF and Lotus
  Recycling.

Synthetic demo values:

- Demo site risk scores.
- Demo site exact lat/lon points.
- Demo collection mass.
- Demo inverter health readings.
- Demo predicted fault and failure window.
- Demo route distances and costs.
- Demo truck capacity and per-kilometre cost.
- Lotus daily processing capacity assumption.

## Quick explanation for a non-technical reader

Think of the data in three layers:

1. **Where solar exists**: CER and Solar Victoria tell us where solar systems
   were installed and when.
2. **What products were installed**: Solar Victoria product files tell us which
   panel and inverter models were common over time.
3. **Where recovery infrastructure exists**: Sustainability Victoria tells us
   where waste and recovery facilities are located.

The hackathon demo then adds a synthetic operational story on top: "these sites
are getting risky, this truck should collect them, and this recovery centre is
the destination." That story is useful for demonstrating the product, but it is
not all directly observed from the public datasets.
