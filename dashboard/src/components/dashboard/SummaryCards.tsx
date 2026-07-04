import React from 'react';

interface SummaryCardsProps {
  hotspotsCount: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ hotspotsCount }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '1.5rem', 
      marginBottom: '2rem' 
    }}>
      {/* KPI 1 */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)', border: 'none' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>Coverage</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#32325d', marginTop: '4px' }}>63 Provinces</div>
          <span style={{ fontSize: '0.75rem', color: '#2dce89', fontWeight: 600, display: 'block', marginTop: '8px' }}>↑ 100.0% coverage</span>
        </div>
        <div style={{ backgroundColor: '#fb6340', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🗺️</div>
      </div>

      {/* KPI 2 */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)', border: 'none' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>Hotspots</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#32325d', marginTop: '4px' }}>{hotspotsCount} Zones</div>
          <span style={{ fontSize: '0.75rem', color: '#f5365c', fontWeight: 600, display: 'block', marginTop: '8px' }}>↓ Risk Score &gt; 60</span>
        </div>
        <div style={{ backgroundColor: '#f5365c', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🚨</div>
      </div>

      {/* KPI 3 */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)', border: 'none' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>Bed Demand</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#32325d', marginTop: '4px' }}>Active Needs</div>
          <span style={{ fontSize: '0.75rem', color: '#fb6340', fontWeight: 600, display: 'block', marginTop: '8px' }}>↑ Capacity Warning</span>
        </div>
        <div style={{ backgroundColor: '#ffad46', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏥</div>
      </div>

      {/* KPI 4 */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)', border: 'none' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>Allocation</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#32325d', marginTop: '4px' }}>+18.4% Rate</div>
          <span style={{ fontSize: '0.75rem', color: '#2dce89', fontWeight: 600, display: 'block', marginTop: '8px' }}>↑ Quantum Optimized</span>
        </div>
        <div style={{ backgroundColor: '#11cdef', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
      </div>
    </div>
  );
};

export default SummaryCards;
