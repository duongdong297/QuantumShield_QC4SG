import React from 'react';

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab = 'Dashboard', onTabChange }) => {
  const navItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Outbreak Maps', icon: '🗺️' },
    { name: 'Resource Tables', icon: '📋' },
    { name: 'Edge Devices', icon: '🖥️' },
    { name: 'Audit Logs', icon: '📝' }
  ];

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e9ecef',
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
          color: '#ffffff', 
          width: '32px', 
          height: '32px', 
          borderRadius: '6px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontWeight: 800,
          fontSize: '1.1rem' 
        }}>🛡️</div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1171ef', letterSpacing: '-0.025em' }}>QuantumShield</h2>
          <span style={{ fontSize: '0.65rem', color: '#8898aa', fontWeight: 700, textTransform: 'uppercase' }}>Command Center</span>
        </div>
      </div>

      {/* Sidebar Nav Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
          Navigation
        </div>
        {navItems.map(item => {
          const isActive = currentTab === item.name;
          return (
            <a 
              key={item.name} 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (onTabChange) onTabChange(item.name);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: isActive ? '#f6f9fc' : 'transparent',
                color: isActive ? '#5e72e4' : '#525f7f',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f6f9fc';
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
          borderRadius: '8px',
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
