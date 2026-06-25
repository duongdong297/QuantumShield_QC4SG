import React from 'react';

const RiskMap: React.FC = () => (
  <div style={{
    height: '400px',
    borderRadius: '12px',
    background: 'linear-gradient(145deg, #f1f5f9, #e2e8f0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
  }}>
    <span style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>
      [ Geospatial Outbreak Heatmap ]
    </span>
  </div>
);

export default RiskMap;
