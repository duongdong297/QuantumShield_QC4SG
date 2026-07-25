import React from 'react';
import { motion } from 'framer-motion';
import AuditLogsView from './AuditLogsView';

interface MethodologyViewProps {
  setActiveTab: (tabId: string) => void;
}

const MethodologyView: React.FC<MethodologyViewProps> = ({ setActiveTab }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '2rem'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
          <span style={{ marginRight: '10px' }}>🧪</span>
          Scientific Methodology & End-to-End Quantum Architecture
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
          QuantumShield leverages a hybrid classical-quantum pipeline designed to combat the escalating threat of Dengue fever. 
          The architecture seamlessly integrates Real-World Data (RWD), Machine Learning (ML), Quantum Optimization (QUBO), and Large Language Models (LLMs) with Retrieval-Augmented Generation (RAG) to provide actionable decision intelligence.
        </p>

        {/* CSS-based Pipeline Diagram */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          overflowX: 'auto',
          padding: '2rem 1rem',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '16px'
        }}>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div 
              onClick={() => setActiveTab('outbreak_maps')}
              style={{ cursor: 'pointer', backgroundColor: '#1171ef', padding: '1rem', borderRadius: '12px', color: '#fff', fontWeight: 700, boxShadow: '0 4px 15px rgba(17, 113, 239, 0.4)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              1. Real Data Ingestion
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '8px', opacity: 0.9 }}>HCDC Dataset (2001-2026)<br/>Climate & Epidemiology</div>
            </div>
          </div>
          <div style={{ color: '#5e72e4', fontSize: '1.5rem' }}>&#10142;</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div 
              onClick={() => setActiveTab('outbreak_maps')}
              style={{ cursor: 'pointer', backgroundColor: '#2dce89', padding: '1rem', borderRadius: '12px', color: '#fff', fontWeight: 700, boxShadow: '0 4px 15px rgba(45, 206, 137, 0.4)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              2. ML Forecasting
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '8px', opacity: 0.9 }}>Random Forest Regressor<br/>Risk Score & Peak Est.</div>
            </div>
          </div>
          <div style={{ color: '#5e72e4', fontSize: '1.5rem' }}>&#10142;</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div 
              onClick={() => setActiveTab('dashboard')}
              style={{ cursor: 'pointer', backgroundColor: '#8965e0', padding: '1rem', borderRadius: '12px', color: '#fff', fontWeight: 700, boxShadow: '0 4px 15px rgba(137, 101, 224, 0.4)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              3. Quantum Optimization
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '8px', opacity: 0.9 }}>D-Wave Hybrid Solver<br/>QUBO Knapsack Formulation</div>
            </div>
          </div>
          <div style={{ color: '#5e72e4', fontSize: '1.5rem' }}>&#10142;</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div 
              onClick={() => setActiveTab('decision_protocol')}
              style={{ cursor: 'pointer', backgroundColor: '#f5365c', padding: '1rem', borderRadius: '12px', color: '#fff', fontWeight: 700, boxShadow: '0 4px 15px rgba(245, 54, 92, 0.4)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              4. Actionable GenAI
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '8px', opacity: 0.9 }}>LLM + RAG (HCDC Guidelines)<br/>Official Dispatch Orders</div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Literature Review */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '2rem'
        }}>
          <h3 style={{ color: '#fff', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📚 Literature Review & Scientific Basis
          </h3>
          <ul style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.9rem', paddingLeft: '1.2rem', margin: 0 }}>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#e2e8f0' }}>Why Random Forest (RF) for Dengue?</strong> <br/>
              Studies (e.g., <i style={{ color: '#38bdf8' }}>Bhatnagar et al., 2021</i>; <i style={{ color: '#38bdf8' }}>Guo et al., 2017</i>) show RF outperforms traditional ARIMA and deep learning models in predicting infectious diseases when handling non-linear epidemiological variables (humidity, temperature variations, vector density).
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#e2e8f0' }}>Why Quantum Optimization?</strong> <br/>
              Resource allocation during a pandemic is essentially a dynamic, multi-constrained <em>Knapsack Problem (NP-Hard)</em>. The D-Wave Hybrid Solver and QAOA (Quantum Approximate Optimization Algorithm) provide significant computational advantages when dealing with combinatorial explosion of resource mapping across hundreds of regions (<i style={{ color: '#38bdf8' }}>Glover et al., 2022</i>).
            </li>
            <li>
              <strong style={{ color: '#e2e8f0' }}>Why RAG (Retrieval-Augmented Generation)?</strong> <br/>
              Generative AI is prone to hallucination. By injecting the official <em>HCDC Dengue Prevention Guidelines</em> as a strict knowledge base context (RAG framework), we ensure 100% medical compliance in generated Dispatch Orders.
            </li>
          </ul>
        </div>

        {/* PoC / Pilot Plan */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '2rem'
        }}>
          <h3 style={{ color: '#fff', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🚀 PoC & Pilot Deployment Plan
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            To conclusively prove superiority over current manual methods, QuantumShield proposes a rigorous A/B Pilot Deployment in Ho Chi Minh City over a 6-month period (Rainy Season).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #1171ef' }}>
              <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Phase 1: Shadow Mode (Month 1-2)</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>System runs in parallel with human decision-makers. Outputs (Forecasts & QUBO allocations) are logged but not enacted. Measure predictive precision (RMSE) against actual outbreak data.</p>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #f5365c' }}>
              <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Phase 2: A/B Regional Test (Month 3-5)</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                <strong>Region A (Control):</strong> Continues traditional reactive resource allocation.<br/>
                <strong>Region B (Quantum):</strong> Resources dispatched strictly based on QuantumShield's QUBO recommendations and LLM RAG Orders.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #2dce89' }}>
              <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Phase 3: Impact Analysis (Month 6)</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Quantify Business Value: Calculate ROI via reduction in ICU admissions, test kit wastage, and shortened outbreak lifespans in Region B vs A.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Audit Logs Section */}
      <div style={{ marginTop: '1rem' }}>
        <AuditLogsView />
      </div>
    </motion.div>
  );
};

export default MethodologyView;
