import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const DecisionProtocolView = ({ allocationData, handleExecuteAction, dispatchOrders }: any) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const recommendations = allocationData?.recommendations || [];
  const coveredRegions = allocationData?.allocation_result?.covered_regions || [];
  
  const rules = [
    { tier: "CRITICAL", threshold: "> 50", action: "Kích hoạt phản ứng khẩn cấp. Điều động Đội Y Tế và thiết lập vùng cách ly ngay lập tức.", color: "#f5365c", bg: "rgba(245, 54, 92, 0.1)" },
    { tier: "HIGH RISK", threshold: "> 25", action: "Chuẩn bị nguồn lực. Tăng cường phun hóa chất diệt muỗi toàn khu vực.", color: "#fb6340", bg: "rgba(251, 99, 64, 0.1)" },
    { tier: "MEDIUM RISK", threshold: "> 10", action: "Tăng cường giám sát dịch tễ. Mở rộng khoanh vùng xét nghiệm PCR.", color: "#11cdef", bg: "rgba(17, 205, 239, 0.1)" },
    { tier: "LOW RISK", threshold: "< 10", action: "Theo dõi tình hình. Khuyến cáo người dân giữ gìn vệ sinh.", color: "#2dce89", bg: "rgba(45, 206, 137, 0.1)" }
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Rules Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '2rem'
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
          <span style={{ marginRight: '10px' }}>⚖️</span>
          Trigger Thresholds (Luật kích hoạt dịch)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {rules.map((rule, idx) => (
            <div key={idx} style={{ 
              backgroundColor: rule.bg, 
              border: `1px solid ${rule.color}40`, 
              borderRadius: '12px', 
              padding: '1.5rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: rule.color, fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }}>{rule.tier}</span>
                <span style={{ backgroundColor: rule.color, color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>Rate {rule.threshold}</span>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                {rule.action}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dynamic Actions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '2rem'
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
          <span style={{ marginRight: '10px' }}>🎯</span>
          Actionable Recommendations (Dựa trên dự báo)
        </h2>
        
        {recommendations.length === 0 || (recommendations.length === 1 && recommendations[0].id === 1) ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🤖</span>
            Vui lòng nhấn "Run Quantum Allocation" ở Dashboard để AI phân tích và đưa ra khuyến nghị.
          </div>
        ) : (
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
                  {dispatchOrders && dispatchOrders.find((d: any) => d.region === rec.region) && (
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
                      const order = dispatchOrders.find((d: any) => d.region === rec.region);
                      if (order) setSelectedOrder(order.dispatch_order_text);
                    }}
                    >
                      📄 View RAG Order
                    </button>
                  )}
                </div>
              </div>
              {/* Show Logistics if it exists */}
              {(() => {
                const regionInfo = coveredRegions.find((r: any) => r.region === rec.region);
                if (regionInfo && regionInfo.logistics) {
                  const logi = regionInfo.logistics;
                  return (
                    <div style={{ marginTop: '-1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0 0 12px 12px', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Logistics Required:</span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(245, 54, 92, 0.2)', color: '#f5365c', padding: '2px 8px', borderRadius: '4px' }}>🛏️ {logi.icu_beds} ICU Beds</span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(17, 205, 239, 0.2)', color: '#11cdef', padding: '2px 8px', borderRadius: '4px' }}>💧 {logi.iv_fluids_bags} IV Fluids</span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(45, 206, 137, 0.2)', color: '#2dce89', padding: '2px 8px', borderRadius: '4px' }}>🧪 {logi.ns1_test_kits} NS1 Tests</span>
                      {logi.fogging_units > 0 && <span style={{ fontSize: '0.75rem', background: 'rgba(251, 99, 64, 0.2)', color: '#fb6340', padding: '2px 8px', borderRadius: '4px' }}>💨 {logi.fogging_units} Fogging Units</span>}
                    </div>
                  );
                }
                return null;
              })()}
              </div>
            ))}
          </div>
        )}
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
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedOrder}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DecisionProtocolView;
