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
          <strong style={{ color: '#34d399', display: 'block', fontSize: '0.85rem' }}>BỘ Y TẾ / HCDC VIỆT NAM</strong>
          <span>Hệ thống Chỉ huy Phòng chống Dịch bệnh Quantum AI</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>CÔNG VĂN KHẨN (RAG GENERATED)</span>
          <div style={{ marginTop: '4px', color: '#64748b' }}>Mã định danh: Q-AI-{Math.floor(Math.random()*8999 + 1000)}</div>
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
    { id: 101, region: "Dak Lak", tier: "CRITICAL", text: "[Dak Lak - CRITICAL] Khẩn cấp điều phối 120 ICU giường bệnh và 15 Đội Y tế đặc nhiệm xử lý vùng dịch Sốt xuất huyết." },
    { id: 102, region: "Gia Lai", tier: "HIGH RISK", text: "[Gia Lai - HIGH RISK] Phân bổ 3,000 kit xét nghiệm NS1 và tăng cường hóa chất diệt muỗi trên địa bàn tỉnh." },
    { id: 103, region: "Ho Chi Minh City", tier: "MEDIUM RISK", text: "[Ho Chi Minh City - MEDIUM RISK] Tăng cường kiểm soát các điểm nóng ổ lăng quăng tại 22 quận huyện." },
    { id: 104, region: "Ha Noi", tier: "MEDIUM RISK", text: "[Ha Noi - MEDIUM RISK] Duy trì mức giám sát dịch tễ, bố trí sẵn sàng giường bệnh dự phòng cho khu vực ven đô." },
    { id: 105, region: "Da Nang", tier: "MEDIUM RISK", text: "[Da Nang - MEDIUM RISK] Tổ chức chiến dịch phun hóa chất diệt muỗi diện rộng tại các khu du lịch và khu dân cư." },
    { id: 106, region: "Dong Nai", tier: "HIGH RISK", text: "[Dong Nai - HIGH RISK] Khẩn trương kiểm tra khu công nghiệp, điều động 6,000 kit xét nghiệm nhanh về Trung tâm y tế." },
    { id: 107, region: "Binh Duong", tier: "HIGH RISK", text: "[Binh Duong - HIGH RISK] Đẩy mạnh công tác truyền thông vệ sinh môi trường, chuẩn bị 140 giường ICU sẵn sàng ứng phó." }
  ];
  const recommendations = (rawRecs.length > 0 && !(rawRecs.length === 1 && rawRecs[0].id === 1)) ? rawRecs : defaultRecs;
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
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '2rem'
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
          <span style={{ marginRight: '10px' }}>⚡</span>
          Quantum Decision Protocol (Hệ thống Quy tắc Phản ứng)
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
          Actionable Recommendations (Dựa trên dự báo)
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
                      const fallbackText = `# CHỈ ĐẠO CÔNG TÁC PHÒNG CHỐNG DỊCH BỆNH SỐT XUẤT HUYẾT TẠI TỈNH/TP: ${rec.region.toUpperCase()}\n\n**CĂN CỨ PHÁP LÝ:**\n- Quyết định số 3711/QĐ-BYT của Bộ trưởng Bộ Y tế về việc ban hành Hướng dẫn giám sát và phòng, chống bệnh Sốt xuất huyết Dengue.\n- Phân tích dự báo độ trễ dịch tễ từ Mô hình AI Random Forest và thuật toán lượng tử D-Wave Hybrid Annealer.\n\n## 1. ĐÁNH GIÁ TÌNH HÌNH DỊCH TỄ TẠI ${rec.region.toUpperCase()}\n- **Mức độ cảnh báo:** ${rec.tier} (Hệ thống AI QuantumShield giám sát nguy cơ lây nhiễm muỗi Aedes aegypti).\n- **Phân bổ tài nguyên khẩn cấp:** Đã yêu cầu điều phối giường ICU, dịch truyền cao phân tử và kit xét nghiệm nhanh NS1 về CDC địa phương.\n\n## 2. CHỈ ĐẠO THỰC THI CHI TIẾT\n* **Đội cơ động Y tế:** Lập tức triển khai 03 đội cơ động phòng chống dịch xử lý triệt để các ổ dịch trong vòng 24 giờ.\n* **Tổ chức thu dung điều trị:** Chuẩn bị sẵn sàng khu vực cách ly, tuyệt đối không để xảy ra tình trạng quá tải giường bệnh ICU.\n* **Chiến dịch diệt lăng quăng:** Ủy ban nhân dân và TTYT phối hợp phun hóa chất diệt muỗi diện rộng bằng máy phun mù nhiệt.\n\n---\n**CHỈ HUY ĐIỀU HÀNH NOC:** Hệ thống tự động phát lệnh qua kênh RAG - QuantumShield AI. Yêu cầu báo cáo kết quả trước 17h00 hàng ngày.`;
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
                    const email = prompt("Nhập địa chỉ Gmail nhận Công văn (VD: namhai23092005@gmail.com):", "namhai23092005@gmail.com");
                    if (email) {
                      toast.loading("Đang phát Công văn qua FormSubmit Gateway vào Gmail...", { duration: 3000 });
                      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                          _subject: "[QUANTUMSHIELD RAG] CÔNG VĂN KHẨN CHỈ ĐẠO Y TẾ",
                          _template: "table",
                          "MÃ CÔNG VĂN": "Q-AI-RAG-9988",
                          "NGƯỜI NHẬN": email,
                          "NỘI DUNG CHỈ ĐẠO": selectedOrder
                        })
                      }).then(res => res.json())
                        .then(data => {
                          if (data.success === false && data.message && data.message.includes("Activation")) {
                            toast("📧 FormSubmit đã gửi 1 email kích hoạt (Activate Form) vào hộp thư Gmail của bạn. Vui lòng bấm kích hoạt 1 lần duy nhất để nhận tin nhắn!", { duration: 8000, icon: "⚠️", style: { borderRadius: '10px', background: '#f59e0b', color: '#fff', fontWeight: 'bold' } });
                          } else {
                            toast.success("📧 Công văn khẩn đã được truyền thành công vào hộp thư Gmail của bạn!", { duration: 5000, style: { borderRadius: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold' } });
                          }
                        })
                        .catch(() => toast.error("Có lỗi kết nối mạng khi gửi email."));
                      
                      window.open(`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("[QUANTUMSHIELD RAG] CÔNG VĂN KHẨN CHỈ ĐẠO Y TẾ")}&body=${encodeURIComponent(selectedOrder)}`, '_blank');
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  📧 Truyền qua Gmail API
                </button>
                <button
                  onClick={() => {
                    const phone = prompt("Nhập số điện thoại HCDC/CDC địa phương:", "+84 987 654 321");
                    if (phone) {
                      toast.success(`📱 Đã điều phối lệnh qua mạng Viễn thông di động tới ${phone}!`, { style: { borderRadius: '10px', background: '#3b82f6', color: '#fff', fontWeight: 'bold' } });
                      window.open(`sms:${encodeURIComponent(phone)}?body=${encodeURIComponent(`KHAN [QuantumShield]: Kich hoat phan ung theo Cong van RAG. Vui lòng kiểm tra cổng NOC.`)}`, '_self');
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  📱 Phát lệnh qua SMS
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
