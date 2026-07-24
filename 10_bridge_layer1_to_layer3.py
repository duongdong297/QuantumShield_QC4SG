"""
ViDen-Q Bridge -- Layer 1 (AI Forecasting) -> Layer 3 (Quantum Allocation)
===========================================================================
Converts 09_dengue_forecasting.py's per-region output into the
artifacts/data.json format that 08_quantum_allocation.py expects,
per API_CONTRACT.md.

WHY THIS EXISTS:
09_dengue_forecasting.py writes artifacts/long_term_forecast.json,
one region at a time, in a forecast-chart shape (month-by-month
case counts). It does not produce risk scores, lat/lng, or a
resource budget -- so 08_quantum_allocation.py can't consume it
directly. This script runs the forecast for every supported region,
derives a risk score and a resource budget from each forecast, and
writes the combined result to artifacts/data.json in the exact shape
08_quantum_allocation.py already reads.

SCOPE (reviewed with the team -- see status below):
- 09_dengue_forecasting.py currently only supports 4 provinces
  (Ha Noi, Dak Lak, Khanh Hoa, Dong Nai), because that's what's in
  data/final/real_vietnam_dataset.csv. This bridge only covers those
  4 -- it does NOT extend to all 63 provinces. That would require
  either more real data or continuing to use the synthetic generator
  for the other 59.
- Coordinates: CONFIRMED. Using the official coordinates from
  backend/main.go (provided by the team). centroid.py in the repo
  root is a leftover from an earlier Thailand-dataset test and is
  NOT the coordinate source -- do not use it.
- Risk score formula: CONFIRMED as matching Layer 1's intended design.
  risk_score_from_forecast() blends peak forecasted case volume with
  probExceed75th (the Random Forest model's probability of exceeding
  the region's 75th percentile for the upcoming month) -- the team
  confirmed a formula built on probExceed75th matches what Layer 1
  is meant to feed into risk scoring.
- Resource budget formula: CONFIRMED as matching Layer 3's design.
  beds/kits/staffTeams here represent the global knapsack capacity
  (total available resources to distribute), which is exactly how
  budget_from_forecast() treats them.

Run:
    python3 10_bridge_layer1_to_layer3.py

Then run 08_quantum_allocation.py as normal -- it will pick up the
real artifacts/data.json this script writes instead of falling back
to sample data.
"""

import json
import os
import subprocess
import sys

SUPPORTED_REGIONS = ["Ha Noi", "Dak Lak", "Khanh Hoa", "Dong Nai"]

# Official coordinates from backend/main.go, confirmed by the team.
# (Note: centroid.py in the repo root is a leftover from an earlier
# Thailand-dataset test and should NOT be used as a coordinate source.)
REGION_COORDS = {
    "Ha Noi": (21.0285, 105.8542),
    "Dak Lak": (12.6667, 108.0333),
    "Khanh Hoa": (12.2500, 109.1667),
    "Dong Nai": (11.0000, 107.1667),
}


def run_forecast(region: str) -> dict:
    """Run 09_dengue_forecasting.py for one region and load its output.

    Calls the existing script as a subprocess rather than importing it,
    since 09_dengue_forecasting.py is written as a standalone CLI script
    (uses sys.argv, no importable functions) -- this avoids duplicating
    or refactoring code the team already has working.
    """
    result = subprocess.run(
        [sys.executable, "09_dengue_forecasting.py", region],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"Forecast failed for {region}: {result.stderr}")

    with open("artifacts/long_term_forecast.json") as f:
        return json.load(f)


def risk_score_from_forecast(forecast_data: dict) -> int:
    """Derive a 0-100 risk score from the 6-month-forward forecast.

    JUDGMENT CALL -- no existing definition found in the repo.
    Reasoning: blend two signals from the forecast's next 6 months --
      (a) how high the predicted case *volume* gets, relative to the
          highest upper-bound forecast seen across the run, and
      (b) how *likely* the model thinks an exceedance of the region's
          own historical 75th percentile is (probExceed75th, already
          0-100 from 09_dengue_forecasting.py).
    Final score = 50% weight on peak forecasted volume (normalized),
    50% weight on peak probExceed75th. This is one reasonable choice,
    not a validated formula -- flag to the team for review.
    """
    future = [d for d in forecast_data["data"] if d["forecastMean"] is not None]
    if not future:
        return 0
    peak_upper = max(d["forecastUpper"] for d in future)
    peak_prob = max(d["probExceed75th"] for d in future)
    return peak_upper, peak_prob  # combined downstream once all regions are known


def budget_from_forecast(peak_upper_cases: int) -> dict:
    """Derive beds/kits/staffTeams from the peak forecasted case count.

    JUDGMENT CALL -- mirrors the ratios already used in
    08_quantum_allocation.py's calculate_logistics_package() for
    covered regions (icu_beds = 15% of cases, ns1_test_kits = 2x cases),
    scaled down since this is a resource *budget* going in, not a
    per-region logistics package coming out. staffTeams uses the same
    team_cost heuristic already in build_qubo() (~1 team per 1000 cases,
    minimum 1).
    """
    return {
        "beds": max(1, round(peak_upper_cases * 0.15)),
        "kits": max(1, round(peak_upper_cases * 2)),
        "staffTeams": max(1, round(peak_upper_cases / 1000)) if peak_upper_cases >= 1000
                      else max(1, round(len(SUPPORTED_REGIONS) / 2)),
    }


def main():
    os.makedirs("artifacts", exist_ok=True)

    region_results = {}
    for region in SUPPORTED_REGIONS:
        print(f"Running Layer 1 forecast for {region}...")
        forecast_data = run_forecast(region)
        peak_upper, peak_prob = risk_score_from_forecast(forecast_data)
        region_results[region] = {"peak_upper": peak_upper, "peak_prob": peak_prob}

    max_upper_seen = max(r["peak_upper"] for r in region_results.values()) or 1

    hotspots = []
    total_peak_cases = 0
    for region, r in region_results.items():
        volume_component = 100 * (r["peak_upper"] / max_upper_seen)
        risk_score = round(0.5 * volume_component + 0.5 * r["peak_prob"])
        risk_score = max(0, min(100, risk_score))
        lat, lng = REGION_COORDS[region]
        hotspots.append({"lat": lat, "lng": lng, "region": region, "riskScore": risk_score})
        total_peak_cases += r["peak_upper"]

    hotspots.sort(key=lambda h: -h["riskScore"])
    alert_region = hotspots[0]["region"]
    alert_prob = hotspots[0]["riskScore"]

    budget = budget_from_forecast(round(total_peak_cases / len(SUPPORTED_REGIONS)))

    data_json = {
        "alert": {
            "active": alert_prob >= 50,
            "region": alert_region,
            "probability": alert_prob,
            "message": (
                f"Dengue risk is elevated in {alert_region} based on Layer 1 "
                f"Random Forest forecasting (real HCDC data, 4-province scope)."
            ),
        },
        "forecast": budget,
        "hotspots": hotspots,
    }

    with open("artifacts/data.json", "w") as f:
        json.dump(data_json, f, indent=2)

    print("\nWrote artifacts/data.json from REAL Layer 1 forecasts:")
    print(json.dumps(data_json, indent=2))
    print(
        "\nNote: this covers only the 4 provinces Layer 1 currently supports. "
        "Run 08_quantum_allocation.py next -- it will now read this real data "
        "instead of its built-in 8-region sample."
    )


if __name__ == "__main__":
    main()
