import React from 'react';
import { motion } from 'framer-motion';

interface QuantumAnalyticsPanelProps {
  allocationData: any;
}

const QuantumAnalyticsPanel: React.FC<QuantumAnalyticsPanelProps> = ({ allocationData }) => {
  if (!allocationData || !allocationData.kpi_comparison || !allocationData.sensitivity_analysis) {
    return null;
  }

  const { kpi_comparison: kpi, sensitivity_analysis: sa } = allocationData;

  const ProgressBar = ({ label, value, max, color }: any) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{value.toFixed(1)}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: '3px' }}></div>
        </div>
      </div>
    );
  };

  const SensitivityRow = ({ label, current, changed, highlight }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
      <span style={{ color: '#cbd5e1' }}>{label}</span>
      <span style={{ color: highlight ? '#34d399' : '#f8fafc', fontWeight: highlight ? 'bold' : 'normal' }}>
        {current} → {changed}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '1.25rem', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚛️</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>
            Quantum Analytics
          </h3>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
          Solver: D-Wave / dimod.ExactSolver
        </p>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* KPI Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Performance vs Baseline
            </span>
            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 'bold' }}>
              +{kpi.improvement_percent}% Efficiency
            </span>
          </div>
          
          <ProgressBar 
            label="QUBO Optimization" 
            value={kpi.qubo_risk_covered} 
            max={Math.max(kpi.qubo_risk_covered, kpi.baseline_risk_covered)} 
            color="#8b5cf6" 
          />
          <ProgressBar 
            label="Naive Top-N Baseline" 
            value={kpi.baseline_risk_covered} 
            max={Math.max(kpi.qubo_risk_covered, kpi.baseline_risk_covered)} 
            color="#64748b" 
          />
        </div>

        {/* Sensitivity Analysis */}
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
            Sensitivity Analysis
          </span>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0 12px' }}>
            <SensitivityRow 
              label="Budget (Teams) +20%" 
              current={kpi.qubo_regions.length} 
              changed={sa.budget_plus20.num_covered} 
              highlight={sa.budget_plus20.num_covered > kpi.qubo_regions.length}
            />
            <SensitivityRow 
              label="Budget (Teams) -20%" 
              current={kpi.qubo_regions.length} 
              changed={sa.budget_minus20.num_covered}
              highlight={false}
            />
            <SensitivityRow 
              label="Penalty Strength +20%" 
              current={kpi.qubo_regions.length} 
              changed={sa.penalty_plus20.num_covered}
              highlight={sa.penalty_plus20.num_covered > kpi.qubo_regions.length}
            />
            <SensitivityRow 
              label="Penalty Strength -20%" 
              current={kpi.qubo_regions.length} 
              changed={sa.penalty_minus20.num_covered}
              highlight={false}
            />
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
            Simulated impacts on total regions covered.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuantumAnalyticsPanel;
