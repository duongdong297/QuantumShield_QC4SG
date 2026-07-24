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

  const teamMembers = [
    {
      id: 1,
      name: "Member 1",
      role: "Team Leader: AI & GenAI Engineer",
      desc: "Architected the advanced Random Forest and Large Language Model (RAG) capabilities, enabling autonomous data analysis and real-time intervention protocols.",
      img: "/image/member1.jpg",
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 2,
      name: "Member 2",
      role: "Full-Stack Developer",
      desc: "Built the robust React frontend and high-performance Go backend, ensuring seamless real-time WebSocket data flow and responsive UI/UX.",
      img: "/image/member2.jpg",
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: 3,
      name: "Member 3",
      role: "Product Manager & Business Analyst",
      desc: "Defined the product vision and core requirements, ensuring the platform perfectly addresses real-world epidemiological challenges in Vietnam.",
      img: "/image/member3.jpg",
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 4,
      name: "Member 4",
      role: "Quantum Optimization Engineer",
      desc: "Designed and implemented the QUBO-based quantum algorithms to optimally allocate medical resources and hospital beds under extreme constraints.",
      img: "/image/member4.jpg",
      color: "from-purple-500 to-pink-500"
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
        <div className="text-center mb-16 mt-10 relative z-10 flex flex-col items-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex justify-center flex-wrap gap-4 mb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow duration-300 cursor-default">
              <span className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-wider">
                QC4SG Vietnam 2026 – The 2nd SEA Quantathon
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              <span className="text-sm font-semibold text-slate-300 tracking-wider uppercase">System Online • Defcon 3</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-emerald-400 bg-[length:200%_auto] animate-gradient-text mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Welcome to QuantumShield
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-lg md:text-xl text-slate-200 max-w-5xl mx-auto leading-relaxed font-light mb-12 drop-shadow-md"
          >
            The Next-Generation Public Health Intelligence Platform. We empower government agencies and healthcare decision-makers by fusing predictive <strong className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 font-bold shadow-sm">AI Forecasting</strong> with ultra-fast <strong className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 font-bold shadow-sm">Quantum Optimization</strong>. QuantumShield continuously monitors epidemiological data across 63 provinces, instantly intercepting and neutralizing Dengue outbreaks before they can escalate into national crises.
          </motion.p>

          {/* KPI Mini-bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 text-center transform transition-all hover:scale-105 hover:bg-slate-800/80 shadow-2xl shadow-black/50">
              <div className="text-4xl mb-2">📍</div>
              <div className="text-3xl font-bold text-white mb-2">63</div>
              <div className="text-xs text-slate-200 font-bold uppercase tracking-widest drop-shadow-md">Provinces Monitored</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 text-center transform transition-all hover:scale-105 hover:bg-slate-800/80 shadow-2xl shadow-black/50">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">{coveragePercent.toFixed(1)}%</div>
              <div className="text-xs text-slate-200 font-bold uppercase tracking-widest drop-shadow-md">Quantum Efficiency</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 text-center transform transition-all hover:scale-105 hover:bg-slate-800/80 shadow-2xl shadow-black/50">
              <div className="text-4xl mb-2">🤖</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">Active</div>
              <div className="text-xs text-slate-200 font-bold uppercase tracking-widest drop-shadow-md">Generative AI Node</div>
            </div>
          </motion.div>
        </div>

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
          <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">The Vision & Architecture</h2>
          <p className="text-slate-300 leading-relaxed mb-6 text-justify text-lg font-light">
            In Vietnam, Dengue fever is not merely a seasonal challenge—it is a critical public health crisis that places catastrophic strain on medical infrastructure, healthcare professionals, and local disease control centers. Traditional reactive measures often result in overcrowded hospitals, severe shortages of medical supplies, and delayed interventions during peak outbreak periods.
          </p>
          <p className="text-slate-300 leading-relaxed mb-6 text-justify text-lg font-light">
            To combat this, we developed <strong>QuantumShield Health</strong>—a next-generation, proactive epidemic management platform. By synergizing the predictive capabilities of <strong className="text-emerald-400">Artificial Intelligence (AI)</strong> with the computational supremacy of <strong className="text-cyan-400">Quantum Computing</strong>, we have created a system that does not just monitor the present, but actively predicts and prepares for the future.
          </p>
          <p className="text-slate-300 leading-relaxed text-justify text-lg font-light">
            Our platform ingests real-time meteorological data, historical epidemiological records, and regional demographic statistics to forecast outbreak trajectories with unprecedented accuracy. By leveraging Large Language Models (LLMs) as autonomous agents, QuantumShield translates complex data into instant, actionable medical dispatch orders, ensuring that life-saving resources are always precisely where they are needed most.
          </p>
        </motion.div>

        {/* How It Works */}
        <div className="w-full max-w-5xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">A seamless integration of data, AI, and Quantum optimization.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-6 items-stretch justify-between relative pt-6">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-700/50 -z-10 transform -translate-y-1/2 rounded-full"></div>
            
            {[
              { 
                step: 1, 
                title: 'Data Ingestion', 
                desc: 'The system continuously streams and synthesizes real-world epidemiological statistics, high-resolution meteorological data, and dynamic demographic factors from 63 provinces in real-time.', 
                icon: '📡', 
                color: 'text-blue-400', 
                border: 'border-blue-500/30' 
              },
              { 
                step: 2, 
                title: 'AI Forecasting', 
                desc: 'A highly tuned Random Forest algorithm processes decades of historical data to accurately predict outbreak probabilities, peak dates, and transmission velocity months in advance.', 
                icon: '🧠', 
                color: 'text-purple-400', 
                border: 'border-purple-500/30' 
              },
              { 
                step: 3, 
                title: 'Quantum Allocation', 
                desc: 'When an outbreak is detected, Quantum algorithms (QUBO) instantaneously compute the mathematically optimal distribution of medical supplies and personnel across all affected regions.', 
                icon: '⚡', 
                color: 'text-emerald-400', 
                border: 'border-emerald-500/30' 
              },
              { 
                step: 4, 
                title: 'GenAI Dispatch', 
                desc: 'Large Language Models (RAG) autonomously translate complex predictions and quantum allocation matrices into clear, step-by-step operational directives for medical task forces.', 
                icon: '📋', 
                color: 'text-amber-400', 
                border: 'border-amber-500/30' 
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className={`bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 text-center border ${item.border} w-full md:w-1/4 shadow-xl relative group flex flex-col`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-4 absolute -top-5 left-1/2 transform -translate-x-1/2 text-slate-300 font-bold shadow-lg group-hover:scale-110 group-hover:text-white transition-all group-hover:border-slate-500">
                  {item.step}
                </div>
                <div className={`text-4xl mb-4 mt-2 ${item.color}`}>{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed text-justify md:text-center flex-grow">{item.desc}</p>
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
            {teamMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                whileHover={{ y: -15, scale: 1.05 }}
                className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center shadow-lg group transition-all duration-300"
              >
                {/* Glow behind card on hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${member.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition duration-500`}></div>
                
                <div className="relative z-10 flex flex-col items-center h-full">
                  {/* Image with animated border */}
                  <div className="relative w-32 h-32 mb-6">
                    <div className={`absolute -inset-2 bg-gradient-to-r ${member.color} rounded-full opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300 animate-pulse`}></div>
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-700 bg-slate-900 group-hover:border-transparent relative z-10 transition-colors duration-300 shadow-xl group-hover:shadow-2xl">
                      <img src={member.img} alt={member.role} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${member.color} transition-all duration-300`}>
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400 min-h-[32px] flex items-center justify-center">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {member.desc}
                  </p>
                </div>
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
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          animation: gradient-shift 5s ease infinite;
        }
      `}} />
    </div>
  );
};

export default LandingView;
