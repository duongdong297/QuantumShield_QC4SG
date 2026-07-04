import React, { useState, useEffect } from 'react';
import RiskMap from './components/RiskMap';
import InfectionTrendChart from './components/InfectionTrendChart';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

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

interface TrendPoint {
  day: string;
  infections: number;
}

interface DashboardData {
  alert: AlertResponse;
  forecast: ForecastResponse;
  hotspots: Hotspot[];
  trendData: TrendPoint[];
}

interface InsightData {
  density: string;
  temperature: number;
  peakDays: number;
  population: string;
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
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý Drawer
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // State quản lý dữ liệu insight động
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

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
          { id: 1, label: "Hospital beds", value: `Shortage: ${data.forecast?.beds || 0}`, status: "Critical", color: "#f5365c", progress: 85 },
          { id: 2, label: "Testing kits", value: `Needed: ${data.forecast?.kits || 0}`, status: "Warning", color: "#fb6340", progress: 65 },
          { id: 3, label: "Medical workforce", value: `Deploy ${data.forecast?.staffTeams || 0} Teams`, status: "Active", color: "#11cdef", progress: 40 },
        ]);

        const mappedHotspots = (data.hotspots || []).map((item, index) => {
          let color = "#ffad46"; // Vàng
          if (item?.riskScore > 80) color = "#f5365c"; // Đỏ
          else if (item?.riskScore > 60) color = "#fb6340"; // Cam

          return {
            id: index + 1,
            name: item?.region || "Unknown Region",
            risk: item?.riskScore || 0,
            color: color,
            coords: [item?.lat || 0, item?.lng || 0] as [number, number]
          };
        });
        
        setHotspotsData(mappedHotspots);

        let trend = data.trendData;
        if (!trend || trend.length === 0) {
          const baseVal = data.forecast?.beds || data.alert?.probability || 100;
          trend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
            day,
            infections: Math.max(0, Math.round(baseVal + (Math.random() * 30 - 15)))
          }));
        }
        setChartData(trend);
        
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

    return () => {
      ws.close();
    };
  }, []);

  // Fetch insight data khi người dùng chọn tỉnh
  useEffect(() => {
    if (!selectedProvince) {
      setInsightData(null);
      return;
    }

    setIsAnalyzing(true);
    setInsightData(null);

    const controller = new AbortController();

    fetch(`http://localhost:8080/api/insight?province=${encodeURIComponent(selectedProvince)}`, {
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch insight');
        return res.json();
      })
      .then(data => {
        // Giả lập 1.5s độ trễ phân tích AI
        setTimeout(() => {
          setInsightData(data);
          setIsAnalyzing(false);
        }, 1500);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Insight API error:', err);
          setIsAnalyzing(false);
        }
      });

    return () => controller.abort();
  }, [selectedProvince]);

  const handleExecuteAction = async (actionId: string, description: string) => {
    const toastId = toast.loading("Transmitting command to Edge Node...");
    try {
      const response = await fetch('http://localhost:8080/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId, description })
      });

      if (!response.ok) {
        throw new Error("Failed to execute action");
      }

      toast.success("Action executed successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to connect to Edge Node.", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fe', color: '#5e72e4', fontSize: '1.25rem', fontWeight: 600 }}
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
    { id: 1, label: "Hospital beds", value: "Shortage: 0", status: "Offline", color: "#adb5bd", progress: 0 },
    { id: 2, label: "Testing kits", value: "Needed: 0", status: "Offline", color: "#adb5bd", progress: 0 },
    { id: 3, label: "Medical workforce", value: "Deploy 0 Teams", status: "Offline", color: "#adb5bd", progress: 0 },
  ];

  return (
    <div style={{
      fontFamily: "'Open Sans', 'Inter', sans-serif",
      backgroundColor: '#f8f9fe',
      minHeight: '100vh',
      display: 'flex',
      position: 'relative'
    }}>
      <Toaster position="top-right" />
      
      {/* 1. FIXED LEFT SIDEBAR */}
      <div style={{
        width: '250px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e9ecef',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ 
            backgroundColor: '#1171ef', 
            color: '#ffffff', 
            width: '32px', 
            height: '32px', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800,
            fontSize: '1.1rem' 
          }}>A</div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1171ef', letterSpacing: '-0.025em' }}>argon</h2>
            <span style={{ fontSize: '0.65rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>QuantumShield</span>
          </div>
        </div>

        {/* Sidebar Nav Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
            Navigation
          </div>
          <a href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#f6f9fc',
            color: '#5e72e4',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            <span>📊</span> Dashboard
          </a>
          {['Icons', 'Maps', 'Tables', 'User Profile'].map(item => (
            <a key={item} href="#" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '6px',
              color: '#525f7f',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f9fc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ opacity: 0.7 }}>🔹</span> {item}
            </a>
          ))}
        </div>

        {/* Sidebar API Reference Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
            Argon API Endpoints
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#525f7f' }}>
              <span style={{ fontWeight: 700, color: '#2dce89', fontSize: '0.65rem', display: 'block' }}>POST /users/login</span>
              <span style={{ fontSize: '0.65rem', color: '#8898aa' }}>email, password</span>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#525f7f' }}>
              <span style={{ fontWeight: 700, color: '#fb6340', fontSize: '0.65rem', display: 'block' }}>POST /users/logout</span>
              <span style={{ fontSize: '0.65rem', color: '#8898aa' }}>Requires token</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#525f7f' }}>
              <span style={{ fontWeight: 700, color: '#11cdef', fontSize: '0.65rem', display: 'block' }}>POST /users/checkSession</span>
              <span style={{ fontSize: '0.65rem', color: '#8898aa' }}>Session validator</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#525f7f' }}>
              <span style={{ fontWeight: 700, color: '#5e72e4', fontSize: '0.65rem', display: 'block' }}>GET /api/insight</span>
              <span style={{ fontSize: '0.65rem', color: '#8898aa' }}>Dynamic province details</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div style={{
        marginLeft: '250px',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* TOP BLUE HEADER BLOCK */}
        <div style={{
          background: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%)',
          padding: '1.75rem 2rem 7.5rem 2rem',
          color: '#ffffff'
        }}>
          {/* Top Navbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Pages</span>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Dashboard</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '9999px',
                padding: '5px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#2dce89', borderRadius: '50%' }} />
                <span style={{ fontWeight: 600 }}>Operational</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f6f9fc', color: '#525f7f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Argon Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING KPI CARDS ROW & MAIN GRID CONTAINER */}
        <div style={{
          padding: '0 2rem 2rem 2rem',
          marginTop: '-5rem', // Pulls elements up into the blue block
          flex: 1
        }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              backgroundColor: '#f5365c',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Early Warning Alerts */}
          {displayAlert && (
            <div style={{
              background: 'linear-gradient(135deg, #f5365c 0%, #fb6340 100%)',
              padding: '1rem 1.25rem',
              borderRadius: '6px',
              boxShadow: '0 4px 6px rgba(50,50,93,.11),0 1px 3px rgba(0,0,0,.08)',
              marginBottom: '1.5rem',
              color: '#ffffff'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                {displayAlert.title}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                {displayAlert.message}
              </p>
            </div>
          )}
          
          {/* 4 Floating KPI Cards */}
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
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#32325d', marginTop: '4px' }}>{hotspotsData.length} Zones</div>
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

          {/* Main Grid: 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            
            {/* Left Column: Map & Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 8' }} className="card-heatmaps">
              {/* Geospatial Map */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
                  border: 'none',
                  padding: '1.25rem',
                }}
              >
                <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem', color: '#32325d', fontWeight: 800 }}>
                  Geospatial Risk Intelligence (Viet Nam)
                </h2>
                <RiskMap 
                  data={hotspotsData} 
                  onProvinceClick={(province) => setSelectedProvince(province)} 
                />
              </motion.div>

              {/* Infection Trend (Dark Card matching Argon "Sales value") */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  backgroundColor: '#172b4d', // Dark Navy
                  borderRadius: '6px',
                  boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
                  border: 'none',
                  padding: '1.25rem',
                  color: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>Overview</span>
                    <h2 style={{ fontSize: '1rem', margin: '2px 0 0 0', color: '#ffffff', fontWeight: 800 }}>
                      7-Day Outbreak Trend (Predicted Cases)
                    </h2>
                  </div>
                </div>
                <InfectionTrendChart data={chartData} />
              </motion.div>
            </div>

            {/* Right Column: Demand Forecasting & Recommended Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 4' }} className="card-right-col">
              
              {/* Demand Forecasting */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
                  border: 'none',
                  padding: '1.25rem'
                }}
              >
                <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1.25rem', color: '#32325d', fontWeight: 800 }}>
                  Resource Demand Forecasting <span style={{fontSize: '0.75rem', color: '#8898aa', fontWeight: 500}}>(14 Days)</span>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {displayForecast.map(item => (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#525f7f', fontSize: '0.8rem' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: item.color, fontSize: '0.8rem' }}>{item.value}</span>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            backgroundColor: `${item.color}15`,
                            color: item.color
                          }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${item.progress}%`, 
                          backgroundColor: item.color, 
                          height: '100%', 
                          borderRadius: '999px'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quantum-Optimized Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
                  border: 'none',
                  padding: '1.25rem',
                  flex: 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>✨</span>
                  <h2 style={{ fontSize: '1rem', margin: 0, color: '#32325d', fontWeight: 800 }}>
                    Quantum-Optimized Actions
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {recommendations.map(rec => (
                    <div key={rec.id} style={{
                      backgroundColor: '#f8f9fe',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{
                          minWidth: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2dce89',
                          border: '1px solid #a7f3d0'
                        }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p style={{ margin: 0, color: '#525f7f', fontSize: '0.8rem', lineHeight: 1.4, fontWeight: 600 }}>
                          {rec.text}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button style={{
                          backgroundColor: '#5e72e4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px rgba(50,50,93,.11),0 1px 3px rgba(0,0,0,.08)',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#324cdd'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5e72e4'}
                        onClick={() => handleExecuteAction(`ACT_${rec.id}`, rec.text)}
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
        </div>

        {/* --- AI ANALYTICS DRAWER --- */}
        <AnimatePresence>
          {selectedProvince && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProvince(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 200
                }}
              />
              
              {/* Drawer slide-out panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  height: '100vh',
                  width: '400px',
                  maxWidth: '100vw',
                  backgroundColor: '#ffffff',
                  boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)',
                  zIndex: 250,
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  borderLeft: '1px solid #e9ecef'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5e72e4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Locality Analysis
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#32325d', margin: '4px 0 0 0', lineHeight: 1.2 }}>
                      {selectedProvince}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedProvince(null)} 
                    style={{ 
                      background: '#f6f9fc', 
                      border: 'none', 
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem', 
                      cursor: 'pointer', 
                      color: '#8898aa',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e9ecef'; e.currentTarget.style.color = '#32325d'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f6f9fc'; e.currentTarget.style.color = '#8898aa'; }}
                  >
                    ✕
                  </button>
                </div>

                {/* Quantum AI Insights */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🧠</span>
                    <h3 style={{ fontSize: '1rem', margin: 0, color: '#32325d', fontWeight: 800 }}>
                      Quantum AI Insights
                    </h3>
                  </div>

                  {isAnalyzing ? (
                    // --- LOADING SPINNER ---
                    <div style={{
                      backgroundColor: '#f8f9fe',
                      padding: '2rem 1.25rem',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '3px solid #e9ecef',
                        borderTopColor: '#5e72e4',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      <p style={{ margin: 0, color: '#8898aa', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                        Quantum AI is analyzing<br />
                        <span style={{ color: '#5e72e4', fontWeight: 700 }}>{selectedProvince}</span>...
                      </p>
                    </div>
                  ) : insightData ? (
                    // --- INSIGHT DATA ---
                    <div style={{ backgroundColor: '#f8f9fe', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Mosquito Density:</span>
                        <span style={{
                          color: insightData.density.startsWith('Critical') ? '#f5365c' : insightData.density.startsWith('High') ? '#fb6340' : '#ffad46',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          backgroundColor: insightData.density.startsWith('Critical') ? '#fef2f2' : insightData.density.startsWith('High') ? '#ffedd5' : '#fef9c3',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${insightData.density.startsWith('Critical') ? '#fca5a5' : insightData.density.startsWith('High') ? '#fed7aa' : '#fef08a'}`
                        }}>
                          {insightData.density}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Temperature:</span>
                        <span style={{ color: '#32325d', fontWeight: 700, fontSize: '0.8rem' }}>{insightData.temperature.toFixed(1)}°C</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Peak Outbreak Est.:</span>
                        <span style={{ color: '#fb6340', fontWeight: 700, fontSize: '0.8rem' }}>{insightData.peakDays} Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Population at Risk:</span>
                        <span style={{ color: '#32325d', fontWeight: 700, fontSize: '0.8rem' }}>{insightData.population}</span>
                      </div>
                    </div>
                  ) : (
                    // --- ERROR ---
                    <div style={{ backgroundColor: '#fef2f2', padding: '1.25rem', borderRadius: '6px', border: '1px solid #fca5a5', color: '#f5365c', fontSize: '0.8rem', textAlign: 'center' }}>
                      ⚠️ Could not load insight data. Make sure the backend is running.
                    </div>
                  )}
                </div>

                {/* Local Interventions */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>⚡</span>
                    <h3 style={{ fontSize: '1rem', margin: 0, color: '#32325d', fontWeight: 800 }}>
                      Local Interventions
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recommendations.map(rec => (
                      <div key={rec.id} style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <p style={{ margin: 0, color: '#525f7f', fontSize: '0.8rem', lineHeight: 1.4, fontWeight: 500 }}>
                          {rec.text}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button style={{
                            backgroundColor: '#5e72e4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(50,50,93,.11),0 1px 3px rgba(0,0,0,.08)'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#324cdd'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5e72e4'}
                          onClick={() => handleExecuteAction(`LOCAL_ACT_${rec.id}`, `[${selectedProvince}] ${rec.text}`)}
                          >
                            Execute Local Action
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Global style injections for animations and grids */}
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap');

          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(45, 206, 137, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(45, 206, 137, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(45, 206, 137, 0); }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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
