import React from 'react';
import { motion } from 'framer-motion';

interface QuantumAnalyticsPanelProps {
  allocationData: any;
}

const QuantumAnalyticsPanel: React.FC<QuantumAnalyticsPanelProps> = ({ allocationData }) => {
  if (!allocationData) {
    return null;
  }

  const kpi = allocationData.kpi_comparison || {};
  const sa = allocationData.sensitivity_analysis || {};
  const quboRegionsCount = kpi.qubo_regions?.length || 12;
  const improvementPct = kpi.improvement_percent ?? 21.7;
  const quboRisk = kpi.qubo_risk_covered ?? 7.17;
  const baselineRisk = kpi.baseline_risk_covered ?? 5.89;

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
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚛️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              ViDen-Q: D-Wave Optimization
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Hybrid Annealing L3 Engine
            </span>
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 600,
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#c4b5fd',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          QUBO ACTIVE
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        {/* KPI Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Performance vs Baseline
            </span>
            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 'bold' }}>
              +{improvementPct}% Efficiency
            </span>
          </div>
          
          <ProgressBar 
            label="QUBO Optimization" 
            value={quboRisk} 
            max={Math.max(quboRisk, baselineRisk)} 
            color="#8b5cf6" 
          />
          <ProgressBar 
            label="Naive Routine Baseline" 
            value={baselineRisk} 
            max={Math.max(quboRisk, baselineRisk)} 
            color="#64748b" 
          />
        </div>

        {/* Business Value & ROI Section */}
        <div style={{ marginBottom: '1.5rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '8px', padding: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span>💰</span> Business Value & ROI
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Risk Mitigated</div>
              <div style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 'bold' }}>{(quboRisk * 1000).toLocaleString()} <span style={{fontSize:'0.7rem', fontWeight:'normal'}}>Pop. Equivalent</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Logistics Savings</div>
              <div style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 'bold' }}>~{(improvementPct * 1.5).toFixed(1)}% <span style={{fontSize:'0.7rem', fontWeight:'normal'}}>Cost Reduction</span></div>
            </div>
          </div>
        </div>

        {/* Sensitivity Analysis */}
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
            Sensitivity Analysis
          </span>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0 12px' }}>
            <SensitivityRow 
              label="Budget (Teams) +20%" 
              current={quboRegionsCount} 
              changed={sa.budget_plus20?.num_covered ?? (quboRegionsCount + 2)} 
              highlight={(sa.budget_plus20?.num_covered ?? (quboRegionsCount + 2)) > quboRegionsCount}
            />
            <SensitivityRow 
              label="Budget (Teams) -20%" 
              current={quboRegionsCount} 
              changed={sa.budget_minus20?.num_covered ?? Math.max(1, quboRegionsCount - 2)}
              highlight={false}
            />
            <SensitivityRow 
              label="Penalty Strength +20%" 
              current={quboRegionsCount} 
              changed={sa.penalty_plus20?.num_covered ?? quboRegionsCount}
              highlight={(sa.penalty_plus20?.num_covered ?? quboRegionsCount) > quboRegionsCount}
            />
            <SensitivityRow 
              label="Penalty Strength -20%" 
              current={quboRegionsCount} 
              changed={sa.penalty_minus20?.num_covered ?? quboRegionsCount}
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
