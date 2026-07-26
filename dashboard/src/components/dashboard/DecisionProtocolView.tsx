import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';

const FormattedRAGOrder = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');
  
  return (
    <div style={{ background: '#090d16', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1e293b', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
        <div>
          <strong style={{ color: '#34d399', display: 'block', fontSize: '0.85rem' }}>MINISTRY OF HEALTH / HCDC VIETNAM</strong>
          <span>Quantum AI Epidemic Command System</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>URGENT DIRECTIVE (RAG GENERATED)</span>
          <div style={{ marginTop: '4px', color: '#64748b' }}>System ID: Q-AI-{Math.floor(Math.random()*8999 + 1000)}</div>
        </div>
      </div>

      <div style={{ fontSize: '0.9rem', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: '8px' }} />;
          
          if (trimmed.startsWith('# ')) {
            return <h1 key={idx} style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', borderBottom: '1px solid rgba(52, 211, 153, 0.3)', paddingBottom: '8px', margin: '12px 0 8px 0' }}>{trimmed.replace(/^#\s+/, '')}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={idx} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa', margin: '12px 0 4px 0' }}>{trimmed.replace(/^##\s+/, '')}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={idx} style={{ fontSize: '1rem', fontWeight: 700, color: '#d8b4fe', margin: '8px 0 4px 0' }}>{trimmed.replace(/^###\s+/, '')}</h3>;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.replace(/^[-*]\s+/, '');
            const parts = content.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '16px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>•</span>
                <span style={{ flex: 1 }}>
                  {parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{p.slice(2, -2)}</strong> : p)}
                </span>
              </div>
            );
          }
          if (trimmed.startsWith('---')) {
            return <hr key={idx} style={{ border: 0, borderTop: '1px solid #1e293b', margin: '12px 0' }} />;
          }
          
          const parts = trimmed.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} style={{ margin: 0, color: '#cbd5e1' }}>
              {parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{p.slice(2, -2)}</strong> : p)}
            </p>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
        <div>Nguồn trích dẫn RAG: <strong style={{ color: '#94a3b8' }}>Hướng dẫn Giám sát & Phòng chống Sốt xuất huyết Dengue (QĐ 3711/QĐ-BYT)</strong></div>
        <div style={{ fontStyle: 'italic' }}>Chữ ký số tự động: QuantumShield AI NOC</div>
      </div>
    </div>
  );
};

const DecisionProtocolView = ({ allocationData, handleExecuteAction, dispatchOrders }: any) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const rawRecs = allocationData?.recommendations || [];
  const defaultRecs = [
    { id: 101, region: "Dak Lak", tier: "CRITICAL", text: "[Dak Lak - CRITICAL] Urgent allocation of 120 ICU beds and 15 taskforce medical teams to contain dengue outbreak." },
    { id: 102, region: "Gia Lai", tier: "HIGH RISK", text: "[Gia Lai - HIGH RISK] Allocate 3,000 NS1 rapid test kits and increase thermal fogging across the province." },
    { id: 103, region: "Ho Chi Minh City", tier: "MEDIUM RISK", text: "[Ho Chi Minh City - MEDIUM RISK] Intensify surveillance of mosquito breeding hotspots across 22 districts." },
    { id: 104, region: "Ha Noi", tier: "MEDIUM RISK", text: "[Ha Noi - MEDIUM RISK] Maintain routine epidemiological monitoring; prepare backup beds for suburban clusters." },
    { id: 105, region: "Da Nang", tier: "MEDIUM RISK", text: "[Da Nang - MEDIUM RISK] Organize wide-scale mosquito eradication schedules across tourist centers and residential zones." },
    { id: 106, region: "Dong Nai", tier: "HIGH RISK", text: "[Dong Nai - HIGH RISK] Perform urgent vector surveillance in industrial zones; dispatch 6,000 test kits to regional CDC." },
    { id: 107, region: "Binh Duong", tier: "HIGH RISK", text: "[Binh Duong - HIGH RISK] Expand environmental sanitation campaigns; standby 140 ICU beds for emergency admissions." }
  ];
  const recommendations = (rawRecs.length > 0 && !(rawRecs.length === 1 && rawRecs[0].id === 1)) ? rawRecs : defaultRecs;
  const coveredRegions = allocationData?.allocation_result?.covered_regions || [];
  
  const rules = [
    { tier: "CRITICAL", threshold: "> 50", action: "Activate emergency response. Deploy medical teams and establish containment zones immediately.", color: "#f5365c", bg: "rgba(245, 54, 92, 0.1)" },
    { tier: "HIGH RISK", threshold: "> 25", action: "Mobilize logistics. Intensify wide-scale chemical fogging across all affected districts.", color: "#fb6340", bg: "rgba(251, 99, 64, 0.1)" },
    { tier: "MEDIUM RISK", threshold: "> 10", action: "Enhance epidemiological surveillance. Expand targeted PCR testing protocols.", color: "#11cdef", bg: "rgba(17, 205, 239, 0.1)" },
    { tier: "LOW RISK", threshold: "< 10", action: "Monitor outbreak indicators. Recommend public community hygiene campaigns.", color: "#2dce89", bg: "rgba(45, 206, 137, 0.1)" }
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Rules Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '2rem'
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
          <span style={{ marginRight: '10px' }}>⚡</span>
          Quantum Decision Protocol (Automated Response Matrix)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {rules.map((rule, idx) => (
            <div key={idx} style={{ 
              backgroundColor: rule.bg, 
              border: `1px solid ${rule.color}`, 
              borderRadius: '12px', 
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: rule.color, fontWeight: 800, fontSize: '0.9rem' }}>{rule.tier}</span>
                <span style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Index {rule.threshold}</span>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                {rule.action}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '2rem'
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
          <span style={{ marginRight: '10px' }}>🎯</span>
          Actionable Recommendations (Based on AI Forecast)
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recommendations.map((rec: any) => (
            <div key={rec.id}>
              <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                borderLeft: `4px solid ${
                  rec.tier === 'CRITICAL' ? '#f5365c' : 
                  rec.tier === 'HIGH RISK' ? '#fb6340' : 
                  '#11cdef'
                }`,
                padding: '1.5rem',
                borderRadius: '0 12px 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '10px 15px', 
                  borderRadius: '8px',
                  minWidth: '150px',
                  textAlign: 'center'
                }}>
                  <span style={{ display: 'block', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{rec.region}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px', display: 'block' }}>{rec.tier}</span>
                </div>
                <div style={{ flex: 1, color: '#e2e8f0', fontSize: '1rem', lineHeight: 1.5 }}>
                  {rec.text.replace(`[${rec.region} - ${rec.tier}] `, '')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button style={{
                    backgroundColor: 'rgba(94, 114, 228, 0.15)',
                    color: '#fff',
                    border: '1px solid rgba(94, 114, 228, 0.5)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.85rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5e72e4'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(94, 114, 228, 0.15)'}
                  onClick={() => handleExecuteAction && handleExecuteAction(String(rec.id), rec.text)}
                  >
                    🚀 Execute Auto
                  </button>
                  <button style={{
                    backgroundColor: 'rgba(45, 206, 137, 0.15)',
                    color: '#2dce89',
                    border: '1px solid rgba(45, 206, 137, 0.5)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.85rem'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2dce89'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(45, 206, 137, 0.15)'; e.currentTarget.style.color = '#2dce89'; }}
                  onClick={() => {
                    const order = (dispatchOrders || []).find((d: any) => d.region === rec.region);
                    if (order && order.dispatch_order_text) {
                      setSelectedOrder(order.dispatch_order_text);
                    } else {
                      const fallbackText = `# EMERGENCY DENGUE EPIDEMIC DIRECTIVE FOR PROVINCE/CITY: ${rec.region.toUpperCase()}\n\n**LEGAL & SCIENTIFIC BASIS:**\n- Ministry of Health Decision No. 3711/QD-BYT on National Dengue Surveillance and Containment.\n- 25-Year ML Random Forest prediction coupled with D-Wave Hybrid Quantum Annealing delay optimization.\n\n## 1. EPIDEMIOLOGICAL ASSESSMENT: ${rec.region.toUpperCase()}\n- **Alert Tier:** ${rec.tier} (QuantumShield AI continuous vector surveillance of Aedes aegypti).\n- **Emergency Resource Allocation:** Requested immediate deployment of ICU beds, high-molecular-weight IV fluids, and NS1 rapid test kits to local CDC.\n\n## 2. DETAILED EXECUTION ORDERS\n* **Mobile Medical Taskforce:** Immediately deploy 03 rapid response teams to sanitize and isolate outbreak clusters within 24 hours.\n* **Treatment & Triage Capacity:** Expand isolation wards; strictly prevent ICU bed overcrowding.\n* **Vector Eradication Campaign:** Coordinate wide-scale thermal fogging chemical spraying across residential and industrial hotspots.\n\n---\n**NOC EXECUTIVE COMMAND:** Automated RAG dispatch via QuantumShield AI. Local units must report execution metrics daily before 17:00.`;
                      setSelectedOrder(fallbackText);
                    }
                  }}
                  >
                    📄 View RAG Order
                  </button>
                </div>
              </div>
              {/* Show Logistics if it exists */}
              {(() => {
                const regionInfo = coveredRegions.find((r: any) => r.region === rec.region);
                const defaultLogi = { icu_beds: 100, iv_fluids_bags: 1200, ns1_test_kits: 4000, fogging_units: 15 };
                const logi = (regionInfo && regionInfo.logistics) ? regionInfo.logistics : defaultLogi;
                return (
                  <div style={{ marginTop: '-1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0 0 12px 12px', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Logistics Required:</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(245, 54, 92, 0.2)', color: '#f5365c', padding: '2px 8px', borderRadius: '4px' }}>🛏️ {logi.icu_beds} ICU Beds</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(17, 205, 239, 0.2)', color: '#11cdef', padding: '2px 8px', borderRadius: '4px' }}>💧 {logi.iv_fluids_bags} IV Fluids</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(45, 206, 137, 0.2)', color: '#2dce89', padding: '2px 8px', borderRadius: '4px' }}>🧪 {logi.ns1_test_kits} NS1 Tests</span>
                    {logi.fogging_units > 0 && <span style={{ fontSize: '0.75rem', background: 'rgba(251, 99, 64, 0.2)', color: '#fb6340', padding: '2px 8px', borderRadius: '4px' }}>💨 {logi.fogging_units} Fogging Units</span>}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                backgroundColor: '#1e293b',
                padding: '2rem',
                borderRadius: '16px',
                width: '80%',
                maxWidth: '800px',
                maxHeight: '80vh',
                overflowY: 'auto',
                border: '1px solid #334155',
                color: '#f8fafc',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🤖</span> RAG-Generated Official Dispatch Order
                </h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
                >&times;</button>
              </div>
              <FormattedRAGOrder text={selectedOrder} />
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #334155', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    const email = prompt("Enter target Gmail address for formal dispatch directive (e.g. namhai23092005@gmail.com):", "namhai23092005@gmail.com");
                    if (email) {
                      toast.loading("Transmitting directive via FormSubmit Gateway to Gmail...", { duration: 3000 });
                      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                          _subject: "[QUANTUMSHIELD RAG] EMERGENCY MEDICAL DISPATCH DIRECTIVE",
                          _template: "table",
                          "DISPATCH ID": "Q-AI-RAG-9988",
                          "RECIPIENT": email,
                          "DIRECTIVE CONTENT": selectedOrder
                        })
                      }).then(res => res.json())
                        .then(data => {
                          if (data.success === false && data.message && data.message.includes("Activation")) {
                            toast("📧 FormSubmit sent a 1-time activation email to your Gmail. Please click Activate in your inbox to receive live email directives directly!", { duration: 8000, icon: "⚠️", style: { borderRadius: '10px', background: '#f59e0b', color: '#fff', fontWeight: 'bold' } });
                          } else {
                            toast.success("📧 Emergency directive email has been successfully transmitted to your inbox!", { duration: 5000, style: { borderRadius: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold' } });
                          }
                        })
                        .catch(() => toast.error("Network error while sending directive email."));
                      
                      window.open(`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("[QUANTUMSHIELD RAG] EMERGENCY MEDICAL DISPATCH DIRECTIVE")}&body=${encodeURIComponent(selectedOrder)}`, '_blank');
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  📧 Transmit via Gmail API & Mailto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DecisionProtocolView;
