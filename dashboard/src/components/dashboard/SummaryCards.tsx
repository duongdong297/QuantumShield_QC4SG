import React from 'react';

interface SummaryCardsProps {
  hotspotsCount: number;
  allocationData: any;
  nationalInventory?: {
    staff_teams: number;
    icu_beds: number;
    ns1_test_kits: number;
    fogging_units: number;
    budget_mil_vnd: number;
  };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ hotspotsCount, allocationData, nationalInventory }) => {
  const isOptimized = allocationData?.allocation_result != null;
  const coveragePercent = isOptimized ? allocationData.allocation_result.coverage_percent.toFixed(1) : '+18.4';
  const deployedTeams = isOptimized ? allocationData.allocation_result.staff_teams_deployed : 0;

  const inv = nationalInventory || {
    staff_teams: 12,
    icu_beds: 381,
    ns1_test_kits: 5084,
    fogging_units: 100,
    budget_mil_vnd: 2500
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* NATIONAL EMERGENCY INVENTORY & BUDGET TRACKER BAR */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem', animation: 'pulse 2s infinite' }}>📦</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              NOC National Medical & Budget Emergency Pool
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time resource and budget depletion upon emergency dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 600 }}>👨‍⚕️ MEDICAL TEAMS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{inv.staff_teams} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Teams</span></div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 600 }}>🛏️ ICU BEDS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{inv.icu_beds} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Beds</span></div>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#d8b4fe', fontWeight: 600 }}>🧪 TEST KITS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{inv.ns1_test_kits.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Kits</span></div>
          </div>

          <div style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '6px 12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#fdba74', fontWeight: 600 }}>💨 FOGGING UNITS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{inv.fogging_units} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Units</span></div>
          </div>

          <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '6px 14px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 0 15px rgba(234, 179, 8, 0.2)' }}>
            <div style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 700 }}>💰 EMERGENCY BUDGET</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>${inv.budget_mil_vnd.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#facc15' }}>Mil VND</span></div>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem' 
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
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isOptimized ? '#10b981' : '#f8fafc', margin: '4px 0' }}>
            {isOptimized ? '' : '+'}{coveragePercent}% Rate
            {isOptimized && allocationData.kpi_comparison && (
              <span style={{ marginLeft: '8px', fontSize: '0.8rem', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#10b981', verticalAlign: 'middle' }}>
                +{allocationData.kpi_comparison.improvement_percent}% vs Base
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: isOptimized ? '#10b981' : '#11cdef', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{isOptimized ? '✓' : '⚡'}</span> {isOptimized ? `Deployed ${deployedTeams} Teams` : 'Run Optimization'}
          </span>
        </div>
        <div style={{ background: isOptimized ? 'linear-gradient(135deg, #2dce89, #2b908f)' : 'linear-gradient(135deg, #11cdef, #1171ef)', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: isOptimized ? '0 0 15px rgba(45, 206, 137, 0.5)' : '0 4px 10px rgba(17, 205, 239, 0.3)', transition: 'all 0.5s ease' }}>⚡</div>
      </div>
    </div>
    </div>
  );
};

export default SummaryCards;
