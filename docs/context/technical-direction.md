# Recommended Technical Direction

Build the data foundation first:

1. Ingest public datasets into raw storage with source metadata.
2. Normalize LGA, postcode, date, capacity, product, and coordinate fields.
3. Join solar installation data to boundary centroids or polygons.
4. Create modelled solar demand nodes at LGA/postcode/cluster granularity.
5. Join product/model mix and irradiance features.
6. Load waste/recovery facilities as logistics nodes.
7. Build a cached road distance/time edge matrix using Google Routes, OpenRouteService, or OSRM.
8. Forecast end-of-life mass and inverter replacement demand by area/year.
9. Rank areas by collection priority.
10. Allocate demand to facilities and route vehicles using heuristic or OR-Tools.
