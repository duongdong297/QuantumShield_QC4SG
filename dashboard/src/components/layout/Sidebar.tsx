import React from 'react';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard', setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'methodology', name: 'Methodology & Pilot', icon: '🧪' },
    { id: 'outbreak_maps', name: 'Outbreak Maps', icon: '🗺️' },
    { id: 'dengue_forecasting', name: 'Dengue Forecasting (AI)', icon: '📈' },
    { id: 'decision_protocol', name: 'Decision Protocol', icon: '🧠' },
    { id: 'resource_tables', name: 'Resource Tables', icon: '📋' },
    { id: 'audit_logs', name: 'Audit Logs', icon: '📝' }
  ];

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#1e293b',
      borderRight: '1px solid #334155',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <div style={{ 
          backgroundColor: '#1171ef', 
          color: '#1e293b', 
          width: '32px', 
          height: '32px', 
          borderRadius: '12px', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, 0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontWeight: 800,
          fontSize: '1.1rem' 
        }}>🛡️</div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1171ef', letterSpacing: '-0.025em' }}>QuantumShield</h2>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Command Center</span>
        </div>
      </div>

      {/* Sidebar Nav Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
          Navigation
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <a 
              key={item.id} 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (setActiveTab) setActiveTab(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, 0.15)',
                backgroundColor: isActive ? '#334155' : 'transparent',
                color: isActive ? '#5e72e4' : '#525f7f',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#334155';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span> {item.name}
            </a>
          );
        })}
      </div>

      {/* Sidebar Status Section (Replaces ARGON API ENDPOINTS) */}
      <div style={{ marginTop: 'auto', paddingLeft: '0.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: '12px', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, 0.15)',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'inline-block',
            boxShadow: '0 0 8px #10b981'
          }} />
          Edge Server: Online
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
