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
  onOptimizationComplete?: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ recommendations, onExecuteAction, onOptimizationComplete }) => {
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
        if (onOptimizationComplete) onOptimizationComplete();
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
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem',
        flex: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>✨</span>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Quantum-Optimized Actions
          </h2>
        </div>
        <button 
          onClick={handleRunQuantumAllocation}
          disabled={isOptimizing}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: isOptimizing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            opacity: isOptimizing ? 0.7 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {isOptimizing ? 'Optimizing...' : 'Run Quantum Allocation'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recommendations.map(rec => (
          <div key={rec.id} style={{
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                minWidth: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(45, 206, 137, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2dce89',
                border: '1px solid rgba(45, 206, 137, 0.2)'
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>
                {rec.text}
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{
                backgroundColor: 'rgba(94, 114, 228, 0.1)',
                color: '#829ab1',
                border: '1px solid rgba(94, 114, 228, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(94, 114, 228, 0.2)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(94, 114, 228, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(94, 114, 228, 0.1)';
                e.currentTarget.style.color = '#829ab1';
                e.currentTarget.style.borderColor = 'rgba(94, 114, 228, 0.3)';
              }}
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
