import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Recommendation {
  id: number;
  text: string;
}

interface ActionPanelProps {
  recommendations: Recommendation[];
  onExecuteAction: (actionId: string, description: string) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ recommendations, onExecuteAction }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleRunQuantumAllocation = async () => {
    setIsOptimizing(true);
    const toastId = toast.loading("Quantum computing in progress...", {
      style: { borderRadius: '10px', background: '#3b0764', color: '#fff' }
    });

    try {
      const response = await fetch('http://localhost:8080/api/optimize', { method: 'POST' });
      if (response.ok) {
        toast.success("Quantum allocation executed successfully!", {
          id: toastId,
          style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
        });
      } else {
        toast.error("Failed to run quantum allocation", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during quantum allocation", { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '6px',
        boxShadow: '0 0 2rem 0 rgba(136, 152, 170, .15)',
        border: 'none',
        padding: '1.25rem',
        flex: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
          <h2 style={{ fontSize: '1rem', margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Quantum-Optimized Actions
          </h2>
        </div>
        <button 
          onClick={handleRunQuantumAllocation}
          disabled={isOptimizing}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: isOptimizing ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
            opacity: isOptimizing ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isOptimizing ? 'Optimizing...' : 'Run Quantum Allocation'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {recommendations.map(rec => (
          <div key={rec.id} style={{
            backgroundColor: '#0f172a',
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
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4, fontWeight: 600 }}>
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
              onClick={() => onExecuteAction(`ACT_${rec.id}`, rec.text)}
              >
                Execute Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActionPanel;
