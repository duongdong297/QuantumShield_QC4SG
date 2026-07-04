import React from 'react';
import { motion } from 'framer-motion';

interface Recommendation {
  id: number;
  text: string;
}

interface ActionPanelProps {
  recommendations: Recommendation[];
  onExecuteAction: (actionId: string, description: string) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ recommendations, onExecuteAction }) => {
  return (
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
