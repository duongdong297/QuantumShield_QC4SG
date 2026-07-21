import pytest
from importlib.machinery import SourceFileLoader

# Load the module dynamically since it starts with a number
quantum_mod = SourceFileLoader("quantum_alloc", "08_quantum_allocation.py").load_module()

def test_calculate_logistics_package_critical():
    result = quantum_mod.calculate_logistics_package(100, "CRITICAL")
    assert result['icu_beds'] == 15
    assert result['iv_fluids_bags'] == 150
    assert result['ns1_test_kits'] == 200
    assert result['fogging_units'] == 2
    assert result['insecticide_liters'] == 40

def test_calculate_logistics_package_low_risk():
    result = quantum_mod.calculate_logistics_package(40, "LOW RISK")
    assert result['icu_beds'] == 6
    assert result['iv_fluids_bags'] == 60
    assert result['ns1_test_kits'] == 80
    assert result['fogging_units'] == 0
    assert result['insecticide_liters'] == 0

def test_format_output_includes_logistics_and_prompt():
    class MockDistrict:
        def __init__(self):
            self.name = 'District A'
            self.risk_score = 0.8
            self.lat = 10.0
            self.lng = 106.0
            self.raw_risk = 80
            self.population = 100000
            self.case_count = 500
            self.incidence_rate = 500.0

    districts = [MockDistrict()]
    
    class MockResult:
        sample = {'District A': 1}
        
    budget = {'staff_teams': 1}
    data = {'alert': {'region': 'Test', 'probability': 90}}
    
    output = quantum_mod.format_output(districts, MockResult(), budget, data)
    
    covered_region = output['allocation_result']['covered_regions'][0]
    
    assert 'logistics' in covered_region
    assert covered_region['logistics']['icu_beds'] == 75
    assert 'llm_rag_prompt' in covered_region
    assert 'The system requests dispatching 750 bags of Ringer Lactate IV fluids' in covered_region['llm_rag_prompt']
