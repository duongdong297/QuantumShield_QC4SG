import React from 'react';
import { motion } from 'framer-motion';

interface ForecastItem {
  id: number;
  label: string;
  value: string;
  status: string;
  color: string;
  progress: number;
}

interface ResourceDemandProps {
  displayForecast: ForecastItem[];
}

const ResourceDemand: React.FC<ResourceDemandProps> = ({ displayForecast }) => {
  return (
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
  );
};

export default ResourceDemand;
