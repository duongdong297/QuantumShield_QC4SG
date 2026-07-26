import React from 'react';

interface TopNavbarProps {
  title?: string;
  setActiveTab?: (tab: string) => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ title = 'Dashboard', setActiveTab }) => {
  return (
    <div style={{
      background: 'linear-gradient(87deg, #0B1120 0%, #1e293b 100%)',
      borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      padding: '1.75rem 2rem 7.5rem 2rem',
      color: '#ffffff'
    }}>
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('home')}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/80 transition-all shadow-lg"
              title="Back to Home"
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          )}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>QuantumShield</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            padding: '5px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#2dce89', borderRadius: '50%' }} />
            <span style={{ fontWeight: 600 }}>Operational</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>SC</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>System Commander</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
