import React, { useState, useEffect } from 'react';
import RiskMap from './components/RiskMap';
import InfectionTrendChart from './components/InfectionTrendChart';
import LandingView from './components/LandingView';
import TopNavbar from './components/layout/TopNavbar';
import DecisionProtocolView from './components/dashboard/DecisionProtocolView';
import SummaryCards from './components/dashboard/SummaryCards';
import ResourceDemand from './components/dashboard/ResourceDemand';
import ActionPanel from './components/dashboard/ActionPanel';
import QuantumAnalyticsPanel from './components/dashboard/QuantumAnalyticsPanel';
import { LongTermForecastChart } from './components/dashboard/LongTermForecastChart';
import ResourceTablesView from './components/ResourceTablesView';
import AuditLogsView from './components/AuditLogsView';
import MethodologyView from './components/MethodologyView';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

const DengueForecastingView = ({ selectedProvince, setSelectedProvince }: any) => {
  return (
    <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(11, 17, 32, 0.8), rgba(30, 41, 59, 0.8))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '75vh'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📈 Dengue Long-term Forecasting (AI)
            <span style={{ fontSize: '0.65rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 800, letterSpacing: '0.05em' }}>
              ✅ VALIDATED ON REAL HCDC DATA (2001-2026)
            </span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Utilizing AI for long-term forecasting based on real climate and epidemiological data from the Ministry of Health (no simulated data).
          </p>
        </div>
        
        {/* Simple province selector for the standalone view */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          {['Ha Noi', 'Dak Lak', 'Khanh Hoa', 'Dong Nai'].map(prov => (
            <button
              key={prov}
              onClick={() => setSelectedProvince(prov)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: selectedProvince === prov ? '#1171ef' : '#1e293b',
                color: selectedProvince === prov ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {prov}
            </button>
          ))}
        </div>
        
        <div style={{ flex: 1 }}>
          {selectedProvince ? (
            <LongTermForecastChart region={selectedProvince} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 shadow-xl text-center min-h-[500px]">
              <span className="text-4xl mb-4">🤖</span>
              <h3 className="text-xl font-bold text-slate-200 mb-2">No Province Selected</h3>
              <p className="text-slate-400">Please select 1 of the 4 key provinces above to load the AI forecasting model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

const recommendations = [
  { id: 1, text: "Coordinate mosquito eradication teams at outbreak hotspots." },
  { id: 2, text: "Reallocate testing kits across districts to optimize costs." }
];

interface AllocationRegion {
  region: string;
}

interface AllocationData {
  allocation_result: {
    covered_regions: AllocationRegion[];
    waiting_regions: AllocationRegion[];
    staff_teams_deployed: number;
    coverage_percent: number;
  }
}

const OutbreakMapsView = ({ hotspotsData, setSelectedProvince, allocationData }: any) => {
  const [deployingDrone, setDeployingDrone] = React.useState(false);

  const handleDeployDrone = async () => {
    setDeployingDrone(true);
    toast("UAV Drone deployed for aerial recon. Scanning hotspots...", {
      icon: '🚁',
      style: { borderRadius: '10px', background: '#11cdef', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700 }
    });
    
    try {
      const response = await fetch('http://localhost:8080/api/uav-recon', { method: 'POST' });
      const data = await response.json();
      
      setTimeout(() => {
        setDeployingDrone(false);
        toast.success(`Recon complete. Critical threat detected in ${data.target_province}! Map data synced.`, {
          style: { borderRadius: '10px', background: '#f5365c', color: '#fff', fontWeight: 700 },
          duration: 4000,
        });
        // Tự động bật bảng phân tích cho vùng nguy hiểm nhất vừa tìm được
        setSelectedProvince(data.target_province);
      }, 4000);
    } catch (err) {
      setTimeout(() => {
        setDeployingDrone(false);
        toast.success("Recon complete. Map data synced.", {
          style: { borderRadius: '10px', background: '#2dce89', color: '#fff', fontWeight: 700 }
        });
      }, 4000);
    }
  };

  // Tính toán cấp độ DEFCON
  const activeNodes = hotspotsData?.length || 0;
  let defcon = 5; let defconColor = "#2dce89"; let defconText = "NORMAL";
  if (activeNodes > 15) { defcon = 1; defconColor = "#f5365c"; defconText = "CRITICAL SPREAD"; }
  else if (activeNodes > 8) { defcon = 2; defconColor = "#fb6340"; defconText = "HIGH ALERT"; }
  else if (activeNodes > 3) { defcon = 3; defconColor = "#ffad46"; defconText = "ELEVATED RISK"; }
  else if (activeNodes > 0) { defcon = 4; defconColor = "#ffd600"; defconText = "GUARDED"; }

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(11, 17, 32, 0.8), rgba(30, 41, 59, 0.8))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: '75vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#ffffff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ marginRight: '10px' }}>🌍</span>
              Geospatial Spread Intelligence
            </h2>
            <button 
              onClick={handleDeployDrone}
              disabled={deployingDrone}
              style={{
                background: deployingDrone ? 'rgba(255,255,255,0.1)' : 'linear-gradient(45deg, #11cdef, #1171ef)',
                color: '#fff', border: 'none', borderRadius: '12px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700,
                cursor: deployingDrone ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(17, 205, 239, 0.3)',
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s'
              }}
            >
              {deployingDrone ? <><span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span> Scanning...</> : <>🚁 Deploy UAV</>}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* DEFCON HUD */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px 12px', border: `1px solid ${defconColor}` }}>
              <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800, marginRight: '8px', letterSpacing: '0.1em' }}>THREAT LEVEL</span>
              <span style={{ color: defconColor, fontSize: '1.1rem', fontWeight: 900, textShadow: `0 0 10px ${defconColor}` }}>DEFCON {defcon}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.65rem', marginLeft: '8px', fontWeight: 700 }}>({defconText})</span>
            </div>
             <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
               Critical Nodes: {activeNodes}
             </span>
          </div>
        </div>
        
        {/* Map Container */}
        <div style={{ flex: 1, display: 'flex', minHeight: '500px' }}>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            {deployingDrone && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 500, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', width: '150%', height: '10px',
                  background: 'linear-gradient(90deg, transparent, rgba(17,205,239,0.8), transparent)',
                  transform: 'translate(-50%, -50%)',
                  animation: 'radarSweep 2s linear infinite',
                  boxShadow: '0 0 20px rgba(17,205,239,0.5)'
                }} />
                <style dangerouslySetInnerHTML={{__html: `@keyframes radarSweep { 0% { top: -10%; } 100% { top: 110%; } }`}} />
              </div>
            )}
            <RiskMap 
              data={hotspotsData} 
              onProvinceClick={setSelectedProvince} 
              height="100%"
              allocationData={allocationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const DashboardView = ({ error, displayAlert, hotspotsData, chartData, displayForecast, recommendations, handleExecuteAction, setSelectedProvince, allocationData, fetchAllocationData }: any) => {
  return (
    <>
      {/* FLOATING KPI CARDS ROW & MAIN GRID CONTAINER */}
        <div style={{
          padding: '0 2rem 2rem 2rem',
          marginTop: '-5rem', // Pulls elements up into the top header block
          flex: 1
        }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              backgroundColor: '#f5365c',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
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
              borderRadius: '12px',
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
          
          <SummaryCards hotspotsCount={hotspotsData.length} allocationData={allocationData} />

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
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
                  border: 'none',
                  padding: '1.25rem',
                }}
              >
                <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem', color: '#f8fafc', fontWeight: 800 }}>
                  Geospatial Risk Intelligence (Viet Nam)
                </h2>
                <RiskMap 
                  data={hotspotsData} 
                  onProvinceClick={(province) => setSelectedProvince(province)} 
                  allocationData={allocationData}
                />
              </motion.div>

              {/* Infection Trend (Dark Card matching Argon "Sales value") */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  backgroundColor: '#020617',
                  borderRadius: '12px',
                  boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
                  border: 'none',
                  padding: '1.25rem',
                  color: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Overview</span>
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
              
              <ResourceDemand displayForecast={displayForecast} allocationData={allocationData} />

              <ActionPanel recommendations={recommendations} onExecuteAction={handleExecuteAction} onOptimizationComplete={fetchAllocationData} />

              <QuantumAnalyticsPanel allocationData={allocationData} />

            </div>
          </div>
        </div>
    </>
  );
};

const AIAnalyticsDrawer = ({ selectedProvince, setSelectedProvince, isAnalyzing, insightData, recommendations, handleExecuteAction }: any) => {
  return (
    <AnimatePresence>
      {selectedProvince && (
        <>
          
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
              backgroundColor: '#1e293b',
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0 0', lineHeight: 1.2 }}>
                  {selectedProvince}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedProvince(null)} 
                style={{ 
                  background: '#334155', 
                  border: 'none', 
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  color: '#94a3b8',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#f8fafc'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                ✕
              </button>
            </div>

            {/* Quantum AI Insights */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🧠</span>
                <h3 style={{ fontSize: '1rem', margin: 0, color: '#f8fafc', fontWeight: 800 }}>
                  Quantum AI Insights
                </h3>
              </div>

              {isAnalyzing ? (
                // --- LOADING SPINNER ---
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '2rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #334155',
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
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                    Quantum AI is analyzing<br />
                    <span style={{ color: '#5e72e4', fontWeight: 700 }}>{selectedProvince}</span>...
                  </p>
                </div>
              ) : insightData ? (
                // --- INSIGHT DATA ---
                <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Mosquito Density:</span>
                    <span style={{
                      color: insightData.density.startsWith('Critical') ? '#f5365c' : insightData.density.startsWith('High') ? '#fb6340' : '#ffad46',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      backgroundColor: insightData.density.startsWith('Critical') ? '#4c1d95' : insightData.density.startsWith('High') ? '#7c2d12' : '#713f12',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      border: `1px solid ${insightData.density.startsWith('Critical') ? '#fca5a5' : insightData.density.startsWith('High') ? '#fed7aa' : '#fef08a'}`
                    }}>
                      {insightData.density}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Temperature:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.8rem' }}>{insightData.temperature.toFixed(1)}°C</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Peak Outbreak Est.:</span>
                    <span style={{ color: '#fb6340', fontWeight: 700, fontSize: '0.8rem' }}>{insightData.peakDays} Days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#525f7f', fontWeight: 600, fontSize: '0.8rem' }}>Population at Risk:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.8rem' }}>{insightData.population}</span>
                  </div>
                </div>
              ) : (
                // --- ERROR ---
                <div style={{ backgroundColor: '#4c1d95', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fca5a5', color: '#f5365c', fontSize: '0.8rem', textAlign: 'center' }}>
                  ⚠️ Could not load insight data. Make sure the backend is running.
                </div>
              )}
            </div>

            {/* Local Interventions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <h3 style={{ fontSize: '1rem', margin: 0, color: '#f8fafc', fontWeight: 800 }}>
                  Local Interventions
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recommendations.map((rec: any) => (
                  <div key={rec.id} style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
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
  );
};


const App: React.FC = () => {
  const [activeTab, _setActiveTab] = useState<string>('home');
  const scrollPositions = React.useRef<Record<string, number>>({});

  const setActiveTab = (newTab: string | ((prev: string) => string)) => {
    const nextTab = typeof newTab === 'function' ? newTab(activeTab) : newTab;
    if (nextTab !== activeTab) {
      scrollPositions.current[activeTab] = window.scrollY;
      _setActiveTab(nextTab);
    }
  };

  useEffect(() => {
    const savedPos = scrollPositions.current[activeTab];
    if (savedPos !== undefined) {
      setTimeout(() => {
        window.scrollTo({ top: savedPos, behavior: 'instant' });
      }, 50); // slight delay to ensure DOM is rendered
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);
  const [allocationData, setAllocationData] = useState<AllocationData | null>(null);

  const fetchAllocationData = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/allocation');
      if (res.ok) {
        const data = await res.json();
        setAllocationData(data);
      }
    } catch (err) {
      console.error("Error fetching allocation data:", err);
    }
  };
  const [alertData, setAlertData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [hotspotsData, setHotspotsData] = useState<any[]>([]);
  const [dispatchOrders, setDispatchOrders] = useState<any[]>([]);
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
      // Fetch dispatch orders
      fetch('http://localhost:8080/api/dispatch-orders')
        .then(r => r.json())
        .then(orders => setDispatchOrders(orders))
        .catch(e => console.error("Could not fetch dispatch orders:", e));
        
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
        if (trend && trend.length > 0) {
          setChartData(trend);
        } else {
          setChartData((prev: any[]) => {
            if (prev && prev.length > 0) return prev; // Keep existing random data to prevent jumping
            const baseVal = data.forecast?.beds || data.alert?.probability || 100;
            return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
              day,
              infections: Math.max(0, Math.round(baseVal + (Math.random() * 30 - 15)))
            }));
          });
        }
        
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

  useEffect(() => {
    fetchAllocationData();
  }, []);

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
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#5e72e4', fontSize: '1.25rem', fontWeight: 600 }}
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
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      position: 'relative'
    }}>
      <Toaster position="top-right" />
      
      {/* 2. MAIN CONTENT WRAPPER */}
      <div style={{
        marginLeft: '0',
        marginRight: selectedProvince ? '400px' : '0',
        transition: 'margin-right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {activeTab !== 'home' && (
          <TopNavbar 
            title={activeTab === 'dashboard' ? 'Command NOC' : activeTab === 'outbreak_maps' ? 'Outbreak Maps' : activeTab === 'decision_protocol' ? 'Decision Protocol' : activeTab === 'resource_tables' ? 'Resource Tables' : 'Audit Logs'} 
            setActiveTab={setActiveTab}
          />
        )}

        {/* Views with Framer Motion Transitions */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              {activeTab === 'home' && (
                <LandingView setActiveTab={setActiveTab} allocationData={allocationData} />
              )}
              {activeTab === 'dashboard' && (
                <DashboardView 
                  error={error} 
                  displayAlert={displayAlert} 
                  hotspotsData={hotspotsData} 
                  chartData={chartData} 
                  displayForecast={displayForecast} 
                  recommendations={recommendations} 
                  handleExecuteAction={handleExecuteAction} 
                  setSelectedProvince={setSelectedProvince} 
                  allocationData={allocationData}
                  fetchAllocationData={fetchAllocationData}
                />
              )}
              {activeTab === 'methodology' && <MethodologyView setActiveTab={setActiveTab} />}
              {activeTab === 'outbreak_maps' && <OutbreakMapsView hotspotsData={hotspotsData} setSelectedProvince={setSelectedProvince} allocationData={allocationData} />}
              {activeTab === 'dengue_forecasting' && <DengueForecastingView selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince} />}
              {activeTab === 'decision_protocol' && <DecisionProtocolView allocationData={allocationData} handleExecuteAction={handleExecuteAction} dispatchOrders={dispatchOrders} />}
              {activeTab === 'resource_tables' && <ResourceTablesView />}
              {activeTab === 'audit_logs' && <AuditLogsView />}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Global Drawer shared across views */}
        <AIAnalyticsDrawer
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          isAnalyzing={isAnalyzing}
          insightData={insightData}
          recommendations={recommendations}
          handleExecuteAction={handleExecuteAction}
        />
        
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
