import React from 'react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  setActiveTab: (tab: string) => void;
  allocationData: any;
}

const LandingView: React.FC<LandingViewProps> = ({ setActiveTab, allocationData }) => {
  const coveragePercent = allocationData?.allocation_result?.coverage_percent || 0;
  
  const modules = [
    {
      id: 'dashboard',
      title: 'Command NOC',
      desc: 'Real-time KPI metrics, network status, and 7-day outbreak trend.',
      icon: '📊',
      gradient: 'from-[#1171ef] to-[#11cdef]'
    },
    {
      id: 'outbreak_maps',
      title: 'Outbreak Maps',
      desc: 'Interactive 63-province GIS map with automatic risk color-coding.',
      icon: '🗺️',
      gradient: 'from-[#f5365c] to-[#fb6340]'
    },
    {
      id: 'dengue_forecasting',
      title: 'AI Forecasting',
      desc: 'Long-term Random Forest outbreak predictions (real HCDC data).',
      icon: '📈',
      gradient: 'from-[#2dce89] to-[#2dcecc]'
    },
    {
      id: 'decision_protocol',
      title: 'GenAI Decisions',
      desc: 'Automated medical dispatch orders via RAG & OpenAI.',
      icon: '🧠',
      gradient: 'from-[#8965e0] to-[#bc65e0]'
    },
    {
      id: 'resource_tables',
      title: 'Resource Data',
      desc: 'Detailed tabular view of epidemiological metrics.',
      icon: '📋',
      gradient: 'from-[#ffd600] to-[#ffad46]'
    },
    {
      id: 'methodology',
      title: 'Methodology',
      desc: 'Scientific breakdown of AI, QUBO, and architecture.',
      icon: '🧪',
      gradient: 'from-[#8f9ca6] to-[#adb5bd]'
    }
  ];

  return (
    <div className="landing-container" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      
      {/* Advanced Dynamic Background (Aurora / Tech Grid / Particles) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0f1c]" style={{ pointerEvents: 'none' }}>
        {/* Animated Gradient Mesh (Aurora Effect) */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-40 blur-[120px]" 
             style={{ background: 'radial-gradient(circle, #1171ef 0%, transparent 70%)', animation: 'aurora1 15s ease-in-out infinite alternate' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full mix-blend-screen opacity-30 blur-[150px]"
             style={{ background: 'radial-gradient(circle, #f5365c 0%, transparent 70%)', animation: 'aurora2 20s ease-in-out infinite alternate-reverse' }}></div>
        <div className="absolute top-[30%] left-[40%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-30 blur-[130px]"
             style={{ background: 'radial-gradient(circle, #2dce89 0%, transparent 70%)', animation: 'aurora3 18s ease-in-out infinite alternate' }}></div>
             
        {/* Animated Tech Grid Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.04]" 
             style={{
               backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
               backgroundSize: '50px 50px',
               animation: 'gridMove 10s linear infinite'
             }}>
        </div>

        {/* Floating Data Nodes (Particles) */}
        <div className="absolute top-[80%] left-[10%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] opacity-0" style={{ animation: 'floatUp 10s ease-in infinite' }}></div>
        <div className="absolute top-[90%] left-[30%] w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399] opacity-0" style={{ animation: 'floatUp 14s ease-in-out infinite 2s' }}></div>
        <div className="absolute top-[75%] left-[80%] w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] opacity-0" style={{ animation: 'floatUp 12s linear infinite 5s' }}></div>
        <div className="absolute top-[85%] left-[60%] w-2.5 h-2.5 bg-purple-400 rounded-full shadow-[0_0_12px_#a78bfa] opacity-0" style={{ animation: 'floatUp 15s ease-out infinite 1s' }}></div>
        <div className="absolute top-[95%] left-[45%] w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6] opacity-0" style={{ animation: 'floatUp 11s ease-in infinite 7s' }}></div>
        
        {/* Shooting Data Streams */}
        <div className="absolute top-[10%] left-[-10%] w-[150px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0" style={{ animation: 'shootingStar 7s linear infinite' }}></div>
        <div className="absolute top-[40%] left-[-10%] w-[200px] h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0" style={{ animation: 'shootingStar 11s linear infinite 3s' }}></div>
        <div className="absolute top-[70%] left-[-10%] w-[100px] h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0" style={{ animation: 'shootingStar 9s linear infinite 6s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16 mt-10"
        >
          <div className="flex justify-center flex-wrap gap-4 mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-wider">
                QC4SG Vietnam 2026 – The 2nd SEA Quantathon
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-300 tracking-wider uppercase">System Online • Defcon 3</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-6 tracking-tight">
            Welcome to QuantumShield
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Next-generation Public Health Intelligence. Empowering decision-makers with <strong className="text-white font-semibold">AI Forecasting</strong> and <strong className="text-white font-semibold">Quantum Knapsack Optimization</strong> to intercept outbreaks before they escalate.
          </p>

          {/* KPI Mini-bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center transform transition-all hover:scale-105 hover:bg-slate-800/60 shadow-2xl shadow-black/50">
              <div className="text-4xl mb-2">🇻🇳</div>
              <div className="text-2xl font-bold text-white mb-1">63</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Provinces Covered</div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center transform transition-all hover:scale-105 hover:bg-slate-800/60 shadow-2xl shadow-black/50">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-emerald-400 mb-1">{coveragePercent.toFixed(1)}%</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Quantum Efficiency</div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center transform transition-all hover:scale-105 hover:bg-slate-800/60 shadow-2xl shadow-black/50">
              <div className="text-4xl mb-2">🤖</div>
              <div className="text-2xl font-bold text-blue-400 mb-1">Active</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">GenAI RAG Node</div>
            </div>
          </div>
        </motion.div>

        {/* Project Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)', borderColor: 'rgba(52, 211, 153, 0.5)' }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto text-center mb-24 bg-gradient-to-b from-slate-800/40 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group cursor-default"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-5xl mb-6 inline-block drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"
          >
            🛡️
          </motion.div>
          <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Project Overview</h2>
          <p className="text-slate-300 leading-relaxed mb-6 text-justify md:text-center text-lg">
            Dengue fever remains one of the most critical public health challenges in Vietnam. Seasonal outbreaks put immense pressure on hospitals, healthcare professionals, and local disease control agencies.
          </p>
          <p className="text-slate-300 leading-relaxed text-justify md:text-center text-lg">
            <strong>QuantumShield Health</strong> is an advanced public health platform that combines the power of <strong className="text-emerald-400">Artificial Intelligence (AI)</strong> and <strong className="text-cyan-400">Quantum Computing</strong>. The system is designed to predict outbreaks early, optimize medical resource allocation via quantum algorithms, and automate decision-making processes using Large Language Models (LLMs).
          </p>
        </motion.div>

        {/* How It Works */}
        <div className="w-full max-w-5xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">A seamless integration of data, AI, and Quantum optimization.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-4 items-center justify-between relative pt-6">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-700/50 -z-10 transform -translate-y-1/2 rounded-full"></div>
            
            {[
              { step: 1, title: 'Data Ingestion', desc: 'Real-time epidemiological & climate data.', icon: '📡', color: 'text-blue-400', border: 'border-blue-500/30' },
              { step: 2, title: 'AI Prediction', desc: 'Random Forest forecasts future outbreaks.', icon: '🧠', color: 'text-purple-400', border: 'border-purple-500/30' },
              { step: 3, title: 'Quantum Allocator', desc: 'Optimizes resources via QUBO logic.', icon: '⚡', color: 'text-emerald-400', border: 'border-emerald-500/30' },
              { step: 4, title: 'GenAI Dispatch', desc: 'Creates actionable medical protocols.', icon: '📋', color: 'text-amber-400', border: 'border-amber-500/30' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className={`bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 text-center border ${item.border} w-full md:w-1/4 shadow-xl relative group`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-4 absolute -top-5 left-1/2 transform -translate-x-1/2 text-slate-300 font-bold shadow-lg group-hover:scale-110 group-hover:text-white transition-all group-hover:border-slate-500">
                  {item.step}
                </div>
                <div className={`text-4xl mb-4 mt-2 ${item.color}`}>{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-slate-500 mb-20"
        >
          <div className="text-xs uppercase tracking-widest font-bold mb-2">Explore Modules</div>
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </motion.div>

        {/* Modules Grid */}
        <div className="w-full">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-bold text-white">System Modules</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {modules.map((mod, index) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setActiveTab(mod.id)}
                className="group cursor-pointer relative overflow-hidden rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-white/10 p-8 transition-all hover:border-white/30 hover:shadow-2xl hover:shadow-black/50"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mod.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">{mod.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{mod.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{mod.desc}</p>
                
                <div className="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                  Initialize <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="w-full mt-10">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl font-bold text-white">Core Development Team</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
            {[1, 2, 3, 4].map((member) => (
              <motion.div
                key={member}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center shadow-lg group hover:border-emerald-500/50 transition-colors"
              >
                {/* Image Placeholder */}
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-slate-700 bg-slate-900 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-xl">
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-widest">Photo {member}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Member {member}</h3>
                <p className="text-sm text-emerald-400 mb-4 font-semibold uppercase tracking-wider">Role / Position</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Brief introduction highlighting the specific role and contributions of this team member to the QuantumShield project.
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Thank You Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full border-t border-slate-700/50 pt-16 pb-12 text-center relative"
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-xl">
              🌟
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Thank You for Exploring</h2>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            This project represents our dedication to leveraging cutting-edge technology for social impact. We extend our deepest gratitude to our mentors, open-source communities, and everyone who supported our vision of a safer, healthier future in Vietnam.
          </p>
          <div className="text-sm text-slate-500 font-medium uppercase tracking-widest flex flex-col md:flex-row items-center justify-center gap-4">
            <span>© 2026 QuantumShield Health Team</span>
            <span className="hidden md:inline text-emerald-500">|</span>
            <span className="text-cyan-400 font-bold">QC4SG Vietnam 2026 – The 2nd SEA Quantathon</span>
          </div>
        </motion.div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes aurora1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10%, 15%) scale(1.2); }
          100% { transform: translate(-5%, 5%) scale(0.9); }
        }
        @keyframes aurora2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -10%) scale(1.1); }
          100% { transform: translate(10%, -5%) scale(1.3); }
        }
        @keyframes aurora3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15%, 10%) scale(0.8); }
          100% { transform: translate(5%, -15%) scale(1.2); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
        }
        @keyframes shootingStar {
          0% { transform: rotate(35deg) translateX(-20vw); opacity: 0; }
          5% { opacity: 1; }
          20% { transform: rotate(35deg) translateX(120vw); opacity: 0; }
          100% { transform: rotate(35deg) translateX(120vw); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default LandingView;
