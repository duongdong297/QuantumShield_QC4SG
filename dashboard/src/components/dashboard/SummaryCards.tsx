import React from 'react';

interface SummaryCardsProps {
  hotspotsCount: number;
  allocationData: any;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ hotspotsCount, allocationData }) => {
  const isOptimized = allocationData?.allocation_result != null;
  const coveragePercent = isOptimized ? allocationData.allocation_result.coverage_percent.toFixed(1) : '+18.4';
  const deployedTeams = isOptimized ? allocationData.allocation_result.staff_teams_deployed : 0;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '1.5rem', 
      marginBottom: '2rem' 
    }}>
      {/* KPI 1 */}
      <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', backdropFilter: 'blur(12px)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coverage</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>63 Provinces</div>
          <span style={{ fontSize: '0.8rem', color: '#2dce89', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> 100.0% coverage
          </span>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fb6340, #f5365c)', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 10px rgba(251, 99, 64, 0.3)' }}>🗺️</div>
      </div>

      {/* KPI 2 */}
      <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', backdropFilter: 'blur(12px)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hotspots</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>{hotspotsCount} Zones</div>
          <span style={{ fontSize: '0.8rem', color: '#f5365c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↓</span> Risk Score &gt; 60
          </span>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f5365c, #fb3a59)', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 10px rgba(245, 54, 92, 0.3)' }}>🚨</div>
      </div>

      {/* KPI 3 */}
      <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', backdropFilter: 'blur(12px)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bed Demand</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>Active Needs</div>
          <span style={{ fontSize: '0.8rem', color: '#fb6340', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> Capacity Warning
          </span>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ffad46, #fb8c00)', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 10px rgba(255, 173, 70, 0.3)' }}>🏥</div>
      </div>

      {/* KPI 4 */}
      <div style={{ background: isOptimized ? 'linear-gradient(145deg, rgba(45, 206, 137, 0.15), rgba(30, 41, 59, 0.7))' : 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', backdropFilter: 'blur(12px)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', border: isOptimized ? '1px solid rgba(45, 206, 137, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)', transition: 'all 0.5s ease' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: isOptimized ? '#a7f3d0' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocation</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isOptimized ? '#10b981' : '#f8fafc', margin: '4px 0' }}>{isOptimized ? '' : '+'}{coveragePercent}% Rate</div>
          <span style={{ fontSize: '0.8rem', color: '#2dce89', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> {isOptimized ? `Deployed: ${deployedTeams} Teams` : 'Quantum Optimized'}
          </span>
        </div>
        <div style={{ background: isOptimized ? 'linear-gradient(135deg, #2dce89, #2b908f)' : 'linear-gradient(135deg, #11cdef, #1171ef)', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: isOptimized ? '0 0 15px rgba(45, 206, 137, 0.5)' : '0 4px 10px rgba(17, 205, 239, 0.3)', transition: 'all 0.5s ease' }}>⚡</div>
      </div>
    </div>
  );
};

export default SummaryCards;
