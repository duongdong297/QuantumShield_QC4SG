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
  allocationData?: any;
}

const ResourceDemand: React.FC<ResourceDemandProps> = ({ displayForecast, allocationData }) => {
  const isOptimized = allocationData?.allocation_result != null;
  const deployedTeams = isOptimized ? allocationData.allocation_result.staff_teams_deployed : 0;
  
  // Update medical workforce if optimized
  const modifiedForecast = displayForecast.map(item => {
    if (item.label === "Medical workforce" && isOptimized) {
      return {
        ...item,
        value: `Deployed ${deployedTeams} Teams`,
        status: "OPTIMIZED",
        color: "#10b981", // emerald
        progress: 100
      };
    }
    return item;
  });
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem'
      }}
    >
      <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1.5rem', color: '#f8fafc', fontWeight: 800 }}>
        Resource Demand Forecasting <span style={{fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginLeft: '8px'}}>(14 Days)</span>
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {modifiedForecast.map(item => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>{item.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 800, color: item.color, fontSize: '0.85rem', textShadow: item.status === 'OPTIMIZED' ? `0 0 10px ${item.color}80` : 'none' }}>{item.value}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  backgroundColor: `${item.color}20`,
                  color: item.color,
                  border: `1px solid ${item.color}40`,
                  boxShadow: item.status === 'OPTIMIZED' ? `0 0 10px ${item.color}30` : 'none',
                  transition: 'all 0.5s ease'
                }}>
                  {item.status}
                </span>
              </div>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${item.progress}%`, 
                backgroundColor: item.color, 
                height: '100%', 
                borderRadius: '999px',
                boxShadow: `0 0 10px ${item.color}`,
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResourceDemand;
