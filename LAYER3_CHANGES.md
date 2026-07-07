# Layer 3 Integration Changes — ViDen-Q

## Summary
Added `08_quantum_allocation.py` to integrate the QUBO-based resource
allocation engine (ViDen-Q) with the team's existing Layer 1 → Layer 2 pipeline.

## What was added
- Reads Layer 1's `artifacts/data.json` (dengue forecast + risk scores)
- Formulates resource allocation as a QUBO using `dimod`
- Solves using `SimulatedAnnealingSampler` (swap-in point included for
  D-Wave's `LeapHybridSampler`)
- Writes results to `artifacts/allocation_output.json` for the dashboard

## Fixes made during integration
- Corrected file path bugs (`load_data()` and `save_output()` were using
  incorrect relative/absolute paths — now both correctly point to
  `artifacts/` at the repo root)

## Backend/Dashboard integration
- Output format: `allocation_result` includes `covered_regions`,
  `waiting_regions`, `staff_teams_deployed`, `coverage_percent`
- **Note:** No existing contract found for `allocation_output.json` in
  `API_CONTRACT.md` — may need backend changes to read/display this
