import React, { useState, useEffect } from 'react';
import RiskMap from './components/RiskMap';

// --- MOCK DATA ---
const recommendations = [
  { id: 1, text: "Coordinate mosquito eradication teams at outbreak hotspots." },
  { id: 2, text: "Reallocate testing kits across districts to optimize costs." }
];

// --- MAIN DASHBOARD COMPONENT ---
const App: React.FC = () => {
  const [alertData, setAlertData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertRes, forecastRes] = await Promise.all([
          fetch('http://localhost:8080/api/alert'),
          fetch('http://localhost:8080/api/forecast')
        ]);
        const alertJson = await alertRes.json();
        const forecastJson = await forecastRes.json();
        
        setAlertData({
          title: "High Risk Alert",
          message: alertJson.message,
          level: "Critical"
        });

        setForecastData([
          { id: 1, label: "Hospital beds", value: `+${forecastJson.beds}`, status: "Critical", color: "#ef4444", progress: 85 },
          { id: 2, label: "Testing kits", value: `+${forecastJson.kits}`, status: "Warning", color: "#eab308", progress: 65 },
          { id: 3, label: "Medical workforce", value: `${forecastJson.staffTeams} Teams`, status: "Active", color: "#3b82f6", progress: 40 },
        ]);
      } catch (error) {
        console.error("Error fetching intelligence data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>
        Loading intelligence data...
      </div>
    );
  }

  if (!alertData) return null;

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#f8fafc', // slate-50
      minHeight: '100vh',
      padding: '2rem',
      color: '#0f172a'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ 
          marginBottom: '2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              margin: 0,
              background: 'linear-gradient(90deg, #1e293b 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1.4,
              paddingBottom: '0.2em'
            }}>
              QuantumShield: Public Health Risk Intelligence
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: 500 }}>
              AI-Powered Real-time Monitoring & Forecasting
            </p>
          </div>
          
          {/* Live System Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '9999px',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 8px #22c55e',
              animation: 'pulse 2s infinite'
            }}></span>
            <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Live System
            </span>
          </div>
        </header>

        {/* Early Warning Alerts */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 8px 10px -6px rgba(239, 68, 68, 0.1)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        }}>
          <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>🚨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.025em' }}>
              {alertData.title}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, fontSize: '1.05rem', opacity: 0.9 }}>
              {alertData.message}
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          
          {/* Risk Heatmaps */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
          }} className="card-heatmaps">
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.25rem', color: '#1e293b', fontWeight: 700 }}>
              Geospatial Risk Intelligence
            </h2>
            <RiskMap />
          </div>

          {/* Right Column: Forecasting & Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="card-right-col">
            
            {/* Healthcare Demand Forecasting */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: '#1e293b', fontWeight: 700 }}>
                Demand Forecasting <span style={{fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px'}}>(14 Days)</span>
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {forecastData.map(item => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          backgroundColor: `${item.color}20`,
                          color: item.color
                        }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${item.progress}%`, 
                        backgroundColor: item.color, 
                        height: '100%', 
                        borderRadius: '999px',
                        boxShadow: `0 0 8px ${item.color}80`
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantum-Optimized Recommendations */}
            <div style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '1.5rem',
              flex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✨</span>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b', fontWeight: 700 }}>
                  Quantum-Optimized Actions
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recommendations.map(rec => (
                  <div key={rec.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        border: '1px solid #a7f3d0'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
                        {rec.text}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button style={{
                        backgroundColor: '#1e293b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                      >
                        Execute Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Simple global styles injection for the pulse animation and responsive grid */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
          
          /* Responsive Layout */
          .card-heatmaps { grid-column: span 12; }
          .card-right-col { grid-column: span 12; }
          
          @media (min-width: 1024px) {
            .card-heatmaps { grid-column: span 8; }
            .card-right-col { grid-column: span 4; }
          }
        `}} />
      </div>
    </div>
  );
};

export default App;
