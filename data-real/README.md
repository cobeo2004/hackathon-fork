# Real data

This directory keeps the raw public data used to derive the baked-in demo values in
`src/data/cer.ts`.

## Clean Energy Regulator postcode solar installs

- File: `cer_sgu_solar_postcode.csv`
- Source: Clean Energy Regulator, Australian Government
- Dataset: SRES postcode data - Installations - 2011 to present and totals, SGU-Solar CSV
- URL: https://cer.gov.au/document_page/sres-postcode-data-installations-2011-to-present-and-totals
- Retrieved: 2026-06-06
- Coverage in file: 2001 to Apr 2026

The app does not load this CSV at runtime; it is included for auditability and
reproducibility of the extracted postcode totals.
