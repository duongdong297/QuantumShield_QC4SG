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
