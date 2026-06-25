import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#f4f7f6',
      minHeight: '100vh',
      padding: '2rem',
      color: '#333'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a202c', margin: 0 }}>
            Public Health Risk Intelligence
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Real-time monitoring and forecasting dashboard
          </p>
        </header>

        {/* Early Warning Alerts */}
        <div style={{
          backgroundColor: '#fff5f5',
          borderLeft: '5px solid #fc8181',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <div>
            <h3 style={{ margin: 0, color: '#c53030', fontSize: '1.1rem' }}>High Risk Alert</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: '#9b2c2c', fontWeight: 500 }}>
              Outbreak probability in semi-urban areas exceeded 85%
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Risk Heatmaps */}
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.03)',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '1rem', color: '#2d3748' }}>Risk Heatmaps</h2>
            <div style={{
              backgroundColor: '#edf2f7',
              height: '400px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #cbd5e0'
            }}>
              <span style={{ color: '#a0aec0', fontSize: '1.2rem', fontWeight: 600 }}>
                Geospatial Outbreak Heatmap
              </span>
            </div>
          </div>

          {/* Healthcare Demand Forecasting */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.03)',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '1.5rem', color: '#2d3748' }}>
              Healthcare Demand Forecasting <span style={{fontSize: '0.9rem', color: '#718096', fontWeight: 400}}>(Next 14 Days)</span>
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🛏️</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#2b6cb0' }}>Hospital beds</div>
                  <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>(+120)</div>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🧪</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#805ad5' }}>Testing kits</div>
                  <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>(+500)</div>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>👨‍⚕️</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#319795' }}>Medical workforce</div>
                  <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>Deploy 3 mobile teams</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Intervention Recommendations */}
          <div style={{
            backgroundColor: '#f0fff4',
            borderRadius: '12px',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.03)',
            padding: '1.5rem',
            border: '1px solid #c6f6d5'
          }}>
            <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '1.5rem', color: '#22543d' }}>
              Intervention Recommendations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                borderLeft: '4px solid #48bb78',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#38a169', fontWeight: 'bold' }}>✓</span>
                  <span style={{ fontWeight: 600, color: '#276749' }}>Action 1</span>
                </div>
                <p style={{ margin: 0, color: '#2f855a', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Điều phối đội diệt muỗi
                </p>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                borderLeft: '4px solid #48bb78',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#38a169', fontWeight: 'bold' }}>✓</span>
                  <span style={{ fontWeight: 600, color: '#276749' }}>Action 2</span>
                </div>
                <p style={{ margin: 0, color: '#2f855a', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Phân bổ lại test kit giữa các quận để tối ưu chi phí
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
