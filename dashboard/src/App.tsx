import React, { useState, useEffect } from 'react';
import RiskMap from './components/RiskMap';
import { motion } from 'framer-motion';

interface AlertResponse {
  active: boolean;
  region: string;
  probability: number;
  message: string;
}

interface ForecastResponse {
  beds: number;
  kits: number;
  staffTeams: number;
}

interface Hotspot {
  lat: number;
  lng: number;
  region: string;
  riskScore: number;
}

interface DashboardData {
  alert: AlertResponse;
  forecast: ForecastResponse;
  hotspots: Hotspot[];
}

// --- MOCK DATA ---
const recommendations = [
  { id: 1, text: "Coordinate mosquito eradication teams at outbreak hotspots." },
  { id: 2, text: "Reallocate testing kits across districts to optimize costs." }
];

// --- MAIN DASHBOARD COMPONENT ---
const App: React.FC = () => {
  const [alertData, setAlertData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [hotspotsData, setHotspotsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data: DashboardData = JSON.parse(event.data);
        
        setAlertData({
          title: "High Risk Alert",
          message: data.alert?.message || "Unknown error",
          level: "Critical"
        });

        setForecastData([
          { id: 1, label: "Hospital beds", value: `+${data.forecast?.beds || 0}`, status: "Critical", color: "#ef4444", progress: 85 },
          { id: 2, label: "Testing kits", value: `+${data.forecast?.kits || 0}`, status: "Warning", color: "#eab308", progress: 65 },
          { id: 3, label: "Medical workforce", value: `${data.forecast?.staffTeams || 0} Teams`, status: "Active", color: "#3b82f6", progress: 40 },
        ]);

        const mappedHotspots = (data.hotspots || []).map((item, index) => {
          let color = "#eab308"; // Vàng
          if (item?.riskScore > 80) color = "#ef4444"; // Đỏ
          else if (item?.riskScore > 60) color = "#f97316"; // Cam

          return {
            id: index + 1,
            name: item?.region || "Unknown Region",
            risk: item?.riskScore || 0,
            color: color,
            coords: [item?.lat || 0, item?.lng || 0] as [number, number]
          };
        });
        
        setHotspotsData(mappedHotspots);
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing websocket data:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("Connection to WebSocket server failed. Displaying cached/offline data.");
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    // Dọn dẹp kết nối khi unmount
    return () => {
      ws.close();
    };
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}
      >
        Loading QuantumShield Intelligence...
      </motion.div>
    );
  }

  const displayAlert = alertData || {
    title: "System Offline",
    message: "Cannot retrieve alert data from backend.",
    level: "Unknown"
  };

  const displayForecast = forecastData.length > 0 ? forecastData : [
    { id: 1, label: "Hospital beds", value: "+0", status: "Offline", color: "#94a3b8", progress: 0 },
    { id: 2, label: "Testing kits", value: "+0", status: "Offline", color: "#94a3b8", progress: 0 },
    { id: 3, label: "Medical workforce", value: "0 Teams", status: "Offline", color: "#94a3b8", progress: 0 },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#f8fafc', // slate-50
      minHeight: '100vh',
      padding: '2rem',
      color: '#0f172a'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Error Banner */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            fontWeight: 500
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          style={{
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
          }}
        >
          <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>🚨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.025em' }}>
              {displayAlert.title}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, fontSize: '1.05rem', opacity: 0.9 }}>
              {displayAlert.message}
            </p>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          
          {/* Risk Heatmaps */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
            }} className="card-heatmaps"
          >
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.25rem', color: '#1e293b', fontWeight: 700 }}>
              Geospatial Risk Intelligence
            </h2>
            <RiskMap data={hotspotsData} />
          </motion.div>

          {/* Right Column: Forecasting & Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="card-right-col">
            
            {/* Healthcare Demand Forecasting */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                padding: '1.5rem'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: '#1e293b', fontWeight: 700 }}>
                Demand Forecasting <span style={{fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px'}}>(14 Days)</span>
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {displayForecast.map(item => (
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
            </motion.div>

            {/* Quantum-Optimized Recommendations */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                padding: '1.5rem',
                flex: 1
              }}
            >
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
            </motion.div>
            
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
