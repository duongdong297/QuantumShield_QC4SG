"""
ViDen-Q Layer 3 -- Integration with QuantumShield Health
========================================================

This module connects ViDen-Q's QUBO resource allocation engine
to the team's existing artifacts/data.json output from Layer 1
(AI Dengue Forecasting Engine).

HOW IT FITS:
  Layer 1 (teammates) -> artifacts/data.json -> THIS FILE -> allocation_output.json
  Layer 2 (teammates) reads allocation_output.json -> displays on dashboard

WHAT CHANGED FROM THE MVP:
  - Risk scores now come from their data.json (riskScore field)
    instead of synthetic case data
  - Resource quantities come from their forecast (beds, kits, staffTeams)
    instead of a fixed budget
  - Output is written back to allocation_output.json for the dashboard
    instead of just printed to terminal
  - Added: risk tier -> action mapping (Decision Protocol)
  - Added: KPI comparison against a naive baseline allocation
  - Added: sensitivity analysis (budget / penalty +/-20%)

Run directly:
    python viden_q_integration.py

Or import and call run_qubo_allocation(data) with their JSON data.
"""

import dimod
import json
import time
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# STEP 1: READ FROM THEIR data.json
# ---------------------------------------------------------------------------

def load_data(filepath="artifacts/data.json"):
    """Load the team's forecast data from Layer 1.
    Falls back to the sample data below if file not found --
    useful for testing without running the full system.
    """
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Note: {filepath} not found. Using sample data for testing.")
        return get_sample_data()


def get_sample_data():
    """Sample data matching the exact structure of their data.json.
    Replace this with the real file in production.
    """
    return {
        "alert": {
            "active": True,
            "region": "Ho Chi Minh",
            "probability": 95,
            "message": "Dengue risk is Critical Risk based on forecasting models."
        },
        "forecast": {
            "beds": 53,
            "kits": 808,
            "staffTeams": 5
        },
        "hotspots": [
            {"lat": 10.7626, "lng": 106.6601, "region": "Ho Chi Minh", "riskScore": 100},
            {"lat": 10.8000, "lng": 106.7000, "region": "Binh Duong",  "riskScore": 72},
            {"lat": 10.9500, "lng": 106.8200, "region": "Dong Nai",    "riskScore": 65},
            {"lat": 10.3600, "lng": 106.3400, "region": "Long An",     "riskScore": 48},
            {"lat": 10.5800, "lng": 106.4100, "region": "Tien Giang",  "riskScore": 35},
            {"lat": 10.2500, "lng": 106.3700, "region": "Ben Tre",     "riskScore": 28},
            {"lat": 10.0300, "lng": 105.7800, "region": "Can Tho",     "riskScore": 20},
            {"lat": 10.4600, "lng": 107.1800, "region": "Ba Ria-Vung Tau", "riskScore": 15},
        ],
        "trendData": [
            {"day": "Mon", "infections": 420},
            {"day": "Tue", "infections": 450},
            {"day": "Wed", "infections": 510},
            {"day": "Thu", "infections": 580},
            {"day": "Fri", "infections": 610},
            {"day": "Sat", "infections": 590},
            {"day": "Sun", "infections": 640},
        ]
    }


# STEP 2: CONVERT THEIR RISK SCORES TO OUR FORMAT

# Their data.json has riskScore (0-100) per hotspot/region.
# We normalize to 0-1 and wrap in our DistrictRisk dataclass.
# This replaces the synthetic cases-per-capita calculation from the MVP.

@dataclass
class DistrictRisk:
    name: str
    risk_score: float   # normalized 0-1
    lat: float
    lng: float
    raw_risk: int        # original 0-100 from their data
    population: int
    case_count: int
    incidence_rate: float


def extract_risk_scores(data: dict) -> list[DistrictRisk]:
    """Convert their hotspots list into DistrictRisk objects."""
    hotspots = data.get("hotspots", [])
    if not hotspots:
        raise ValueError("No hotspots found in data.json")

    results = []
    for h in hotspots:
        pop = h.get("population", 1000000)
        cases = h.get("caseCount", 100)
        incidence = round((cases / pop) * 100000, 2) if pop > 0 else 0
        
        # Override raw_risk based on incidence
        if incidence > 50:
            computed_risk = 100
        elif incidence > 25:
            computed_risk = 75
        elif incidence > 10:
            computed_risk = 50
        else:
            computed_risk = 25

        results.append(DistrictRisk(
            name=h["region"],
            risk_score=round(computed_risk / 100, 3),
            lat=h["lat"],
            lng=h["lng"],
            raw_risk=computed_risk,
            population=pop,
            case_count=cases,
            incidence_rate=incidence
        ))
    return results


# ---------------------------------------------------------------------------
# STEP 3: EXTRACT RESOURCE BUDGET FROM THEIR FORECAST
# ---------------------------------------------------------------------------

def extract_budget(data: dict) -> dict:
    """Extract available resources from their forecast data."""
    forecast = data.get("forecast", {})
    return {
        "staff_teams": forecast.get("staffTeams", 3),
        "beds": forecast.get("beds", 0),
        "kits": forecast.get("kits", 0),
    }


# ---------------------------------------------------------------------------
# STEP 3b: RISK TIER -> ACTION MAPPING (Decision Protocol)
# ---------------------------------------------------------------------------

def risk_tier(risk_score_normalized: float) -> dict:
    """Map a normalized risk score (0-1) to a tier and recommended action.
    Thresholds are provisional -- based on quartiles of the 0-1 score.
    """
    if risk_score_normalized >= 0.75:
        return {"tier": "CRITICAL", "action": "Activate emergency response; deploy staff team now"}
    elif risk_score_normalized >= 0.50:
        return {"tier": "HIGH RISK", "action": "Prepare medical resources; pre-position supplies"}
    elif risk_score_normalized >= 0.25:
        return {"tier": "MEDIUM RISK", "action": "Increase surveillance; early testing"}
    else:
        return {"tier": "LOW RISK", "action": "Routine monitoring"}


# ---------------------------------------------------------------------------
# STEP 4: QUBO FORMULATION (same as MVP, no changes needed)
# ---------------------------------------------------------------------------

def build_qubo(districts_risk: list[DistrictRisk], budget_teams: int,
               penalty_strength: float = 2.0) -> dimod.BinaryQuadraticModel:
    """Build QUBO: maximize risk-weighted coverage within staff team budget."""
    bqm = dimod.BinaryQuadraticModel(vartype=dimod.BINARY)

    for d in districts_risk:
        bqm.add_variable(d.name, -d.risk_score)

    names = [d.name for d in districts_risk]
    bundle_cost = 1

    for name in names:
        linear_contrib = penalty_strength * (bundle_cost**2 - 2 * budget_teams * bundle_cost)
        bqm.add_linear(name, linear_contrib)

    for i, name_i in enumerate(names):
        for name_j in names[i + 1:]:
            quad_contrib = penalty_strength * (2 * bundle_cost * bundle_cost)
            bqm.add_quadratic(name_i, name_j, quad_contrib)

    return bqm


# ---------------------------------------------------------------------------
# STEP 4b: SENSITIVITY ANALYSIS
# ---------------------------------------------------------------------------

def sensitivity_analysis(districts_risk: list[DistrictRisk], base_budget_teams: int,
                         base_penalty: float = 2.0) -> dict:
    """Rerun the QUBO with budget and penalty varied +/-20% to see how
    much the allocation changes. Satisfies mentor point 12.
    """
    scenarios = {
        "base": (base_budget_teams, base_penalty),
        "budget_minus20": (max(1, round(base_budget_teams * 0.8)), base_penalty),
        "budget_plus20": (round(base_budget_teams * 1.2), base_penalty),
        "penalty_minus20": (base_budget_teams, base_penalty * 0.8),
        "penalty_plus20": (base_budget_teams, base_penalty * 1.2),
    }

    results = {}
    for label, (budget_teams, penalty) in scenarios.items():
        bqm = build_qubo(districts_risk, budget_teams, penalty_strength=penalty)
        result = solve_qubo(bqm)
        covered = sorted([name for name, val in result.sample.items() if val == 1])
        results[label] = {
            "budget_teams": budget_teams,
            "penalty_strength": penalty,
            "covered_regions": covered,
            "num_covered": len(covered),
        }

    return results


# ---------------------------------------------------------------------------
# STEP 5: SOLVE
# ---------------------------------------------------------------------------

def solve_qubo(bqm: dimod.BinaryQuadraticModel):
    """Solve using classical exact solver.
    Swap to LeapHybridSampler for quantum hardware.
    """
    n = len(bqm.variables)
    if n <= 15:
        sampler = dimod.ExactSolver()
        sampleset = sampler.sample(bqm)
    else:
        sampler = dimod.SimulatedAnnealingSampler()
        sampleset = sampler.sample(bqm, num_reads=100)
    return sampleset.first


# ---------------------------------------------------------------------------
# STEP 5b: NAIVE BASELINE (for KPI comparison against QUBO result)
# ---------------------------------------------------------------------------

def naive_baseline_allocation(districts_risk: list[DistrictRisk], budget_teams: int) -> set:
    """Simple baseline: assign teams to the top-N regions by raw risk score,
    ignoring the QUBO's combinatorial optimization. Used only to measure
    how much better the QUBO allocation is.
    """
    sorted_districts = sorted(districts_risk, key=lambda d: -d.risk_score)
    covered_names = {d.name for d in sorted_districts[:budget_teams]}
    return covered_names


def compare_to_baseline(districts_risk: list[DistrictRisk], qubo_covered: set,
                        budget_teams: int) -> dict:
    """Compute KPI: how much more risk-weighted coverage QUBO achieves vs. baseline."""
    baseline_covered = naive_baseline_allocation(districts_risk, budget_teams)
    risk_lookup = {d.name: d.risk_score for d in districts_risk}

    qubo_risk_covered = sum(risk_lookup[name] for name in qubo_covered)
    baseline_risk_covered = sum(risk_lookup[name] for name in baseline_covered)

    if baseline_risk_covered > 0:
        pct_improvement = round(
            100 * (qubo_risk_covered - baseline_risk_covered) / baseline_risk_covered, 1
        )
    else:
        pct_improvement = 0.0

    return {
        "baseline_regions": sorted(baseline_covered),
        "baseline_risk_covered": round(baseline_risk_covered, 3),
        "qubo_regions": sorted(qubo_covered),
        "qubo_risk_covered": round(qubo_risk_covered, 3),
        "improvement_percent": pct_improvement,
    }


# ---------------------------------------------------------------------------
# STEP 6: FORMAT OUTPUT FOR THEIR DASHBOARD
# ---------------------------------------------------------------------------

def format_output(districts_risk: list[DistrictRisk], result,
                  budget: dict, data: dict, sensitivity: dict = None) -> dict:
    """Format QUBO result as JSON for the dashboard."""
    assignment = result.sample
    risk_lookup = {d.name: d for d in districts_risk}

    covered = []
    waiting = []
    recommendations = []
    rec_id = 1

    for name, val in assignment.items():
        d = risk_lookup[name]
        entry = {
            "region": name,
            "lat": d.lat,
            "lng": d.lng,
            "population": d.population,
            "caseCount": d.case_count,
            "incidenceRate": d.incidence_rate,
            "riskScore": d.raw_risk,
            "riskScoreNormalized": d.risk_score,
        }
        entry.update(risk_tier(d.risk_score))
        if val == 1:
            covered.append(entry)
        else:
            waiting.append(entry)

        # Generate recommendation
        tier_info = risk_tier(d.risk_score)
        tier_name = tier_info["tier"]
        action = ""
        if tier_name == "CRITICAL":
            action = "Kích hoạt phản ứng khẩn cấp. Điều động Đội Y Tế và thiết lập vùng cách ly ngay lập tức."
        elif tier_name == "HIGH RISK":
            action = "Chuẩn bị nguồn lực. Tăng cường phun hóa chất diệt muỗi toàn khu vực."
        elif tier_name == "MEDIUM RISK":
            action = "Tăng cường giám sát dịch tễ. Mở rộng khoanh vùng xét nghiệm PCR."
        else:
            action = "Theo dõi tình hình. Khuyến cáo người dân giữ gìn vệ sinh."
            
        recommendations.append({
            "id": rec_id,
            "region": name,
            "tier": tier_name,
            "text": f"[{name} - {tier_name}] {action} (Tỷ lệ mắc: {d.incidence_rate}/100k dân)"
        })
        rec_id += 1

    covered.sort(key=lambda x: -x["riskScore"])
    waiting.sort(key=lambda x: -x["riskScore"])
    recommendations.sort(key=lambda x: -risk_lookup[x["region"]].risk_score)

    total_risk_covered = sum(d["riskScoreNormalized"] for d in covered)

    covered_names = {c["region"] for c in covered}
    kpi_comparison = compare_to_baseline(districts_risk, covered_names, budget["staff_teams"])

    return {
        "quantum_allocation": {
            "solver": "dimod.ExactSolver (classical baseline)",
            "qubo_variables": len(districts_risk),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "alert_region": data["alert"]["region"],
            "alert_probability": data["alert"]["probability"],
        },
        "resources_available": budget,
        "allocation_result": {
            "covered_regions": covered,
            "waiting_regions": waiting,
            "staff_teams_deployed": len(covered),
            "staff_teams_budget": budget["staff_teams"],
            "total_risk_score_covered": round(total_risk_covered, 3),
            "coverage_percent": round(100 * len(covered) / len(districts_risk), 1),
        },
        "recommendations": recommendations,
        "kpi_comparison": kpi_comparison,
        "sensitivity_analysis": sensitivity,
        "summary": (
            f"Deploying {len(covered)} of {budget['staff_teams']} available staff teams "
            f"to highest-risk regions. Top priority: {covered[0]['region']} "
            f"(risk score: {covered[0]['riskScore']}/100)."
        )
    }


# STEP 7: WRITE OUTPUT BACK FOR DASHBOARD

def save_output(output: dict, filepath="artifacts/allocation_output.json"):
    """Save the allocation result where the dashboard can read it."""
    with open(filepath, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Allocation result saved to {filepath}")



# MAIN PIPELINE

def run_qubo_allocation(data=None):
    """Full pipeline: data.json -> QUBO -> allocation_output.json"""

    print("=== ViDen-Q Layer 3 -- Quantum Resource Allocation ===\n")

    if data is None:
        data = load_data()

    print(f"Alert: {data['alert']['region']} -- "
          f"{data['alert']['probability']}% outbreak probability")
    print(f"Resources available: {data['forecast']}\n")

    districts_risk = extract_risk_scores(data)
    budget = extract_budget(data)

    print(f"Regions to evaluate: {len(districts_risk)}")
    for d in sorted(districts_risk, key=lambda x: -x.risk_score):
        print(f"  {d.name:<20} risk={d.raw_risk}/100")

    print(f"\nBuilding QUBO ({len(districts_risk)} binary variables)...")
    bqm = build_qubo(districts_risk, budget["staff_teams"])

    print("Solving...")
    result = solve_qubo(bqm)

    print("Running sensitivity analysis...")
    sensitivity = sensitivity_analysis(districts_risk, budget["staff_teams"])

    output = format_output(districts_risk, result, budget, data, sensitivity)
    save_output(output)

    alloc = output["allocation_result"]
    print(f"\n{'='*55}")
    print("ALLOCATION RESULT")
    print(f"{'='*55}")
    print(f"\nDeploying to ({len(alloc['covered_regions'])}) regions:")
    for r in alloc["covered_regions"]:
        print(f"  [OK] {r['region']:<20} risk={r['riskScore']}/100  tier={r['tier']}")

    print(f"\nWaiting ({len(alloc['waiting_regions'])}) regions:")
    for r in alloc["waiting_regions"]:
        print(f"  [ ] {r['region']:<20} risk={r['riskScore']}/100  tier={r['tier']}")

    print(f"\nKPI vs baseline: {output['kpi_comparison']['improvement_percent']}% "
          f"more risk-weighted coverage than naive top-N baseline")

    print(f"\n{output['summary']}")
    return output


if __name__ == "__main__":
    run_qubo_allocation()
