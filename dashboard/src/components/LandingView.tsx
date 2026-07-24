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
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen opacity-20 blur-[100px]" 
             style={{ background: 'radial-gradient(circle, rgba(17,113,239,1) 0%, rgba(0,0,0,0) 70%)', animation: 'float1 15s ease-in-out infinite' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-10 blur-[120px]"
             style={{ background: 'radial-gradient(circle, rgba(245,54,92,1) 0%, rgba(0,0,0,0) 70%)', animation: 'float2 20s ease-in-out infinite reverse' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16 mt-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-300 tracking-wider uppercase">System Online • Defcon 3</span>
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
          className="max-w-4xl mx-auto text-center mb-20 bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="text-3xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-white mb-6">Project Overview</h2>
          <p className="text-slate-400 leading-relaxed mb-4 text-justify md:text-center">
            Dengue fever remains one of the most critical public health challenges in Vietnam. Seasonal outbreaks put immense pressure on hospitals, healthcare professionals, and local disease control agencies.
          </p>
          <p className="text-slate-400 leading-relaxed text-justify md:text-center">
            <strong>QuantumShield Health</strong> is an advanced public health platform that combines the power of <strong>Artificial Intelligence (AI)</strong> and <strong>Quantum Computing</strong>. The system is designed to predict outbreaks early, optimize medical resource allocation via quantum algorithms, and automate decision-making processes using Large Language Models (LLMs).
          </p>
        </motion.div>

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
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

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, -5%) scale(1.1); }
        }
      `}} />
    </div>
  );
};

export default LandingView;
