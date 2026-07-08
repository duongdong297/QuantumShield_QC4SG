import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProvinceData {
  province_name: string;
  risk_score: number;
  mosquito_density: string;
  temperature: number;
  beds_available: number;
  status: string;
}

interface ApiResponse {
  top_provinces: ProvinceData[];
  all_provinces: ProvinceData[];
}

interface AllocationRegion {
  region: string;
}

interface AllocationData {
  allocation_result: {
    covered_regions: AllocationRegion[];
    waiting_regions: AllocationRegion[];
    staff_teams_deployed: number;
    coverage_percent: number;
  }
}

const normalizeString = (str: string) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/city/g, "").trim();
};

const COLORS = {
  Critical: '#ef4444',
  Warning: '#eab308',
  Safe: '#10b981'
};

const ResourceTablesView: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [allocation, setAllocation] = useState<AllocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof ProvinceData>('risk_score');
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/resources')
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching resources:", err);
        setIsLoading(false);
      });

    fetch('http://localhost:8080/api/allocation')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setAllocation(data);
      })
      .catch(err => console.error("Error fetching allocation:", err));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
          <p className="text-slate-400 font-semibold tracking-wider">LOADING RESOURCE INTELLIGENCE...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-400 bg-slate-950 min-h-[80vh]">
        ⚠️ Failed to load resource allocation data from Edge API. Please check server connection.
      </div>
    );
  }

  // Calculate dynamic stats
  const totalProvinces = data.all_provinces.length;
  const criticalCount = data.all_provinces.filter(p => p.status === 'Critical').length;
  const warningCount = data.all_provinces.filter(p => p.status === 'Warning').length;
  const safeCount = data.all_provinces.filter(p => p.status === 'Safe').length;
  
  const avgRisk = totalProvinces > 0 
    ? Math.round(data.all_provinces.reduce((acc, p) => acc + p.risk_score, 0) / totalProvinces) 
    : 0;
  const totalBeds = data.all_provinces.reduce((acc, p) => acc + p.beds_available, 0);

  // Pie chart data
  const statusDistribution = [
    { name: 'Critical', value: criticalCount },
    { name: 'Warning', value: warningCount },
    { name: 'Safe', value: safeCount }
  ];

  // Filter provinces by search term
  const filteredProvinces = data.all_provinces.filter(prov =>
    prov.province_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prov.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prov.mosquito_density.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered provinces
  const sortedProvinces = [...filteredProvinces].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAscending ? valA - valB : valB - valA;
    }
    return 0;
  });

  const toggleSort = (field: keyof ProvinceData) => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border";
    switch (status) {
      case "Critical":
        return <span className={`${baseClass} bg-red-500/20 text-red-400 border-red-500/50`}>Critical</span>;
      case "Warning":
        return <span className={`${baseClass} bg-yellow-500/20 text-yellow-400 border-yellow-500/50`}>Warning</span>;
      case "Safe":
        return <span className={`${baseClass} bg-emerald-500/20 text-emerald-400 border-emerald-500/50`}>Safe</span>;
      default:
        return <span className={`${baseClass} bg-slate-500/20 text-slate-400 border-slate-500/50`}>{status}</span>;
    }
  };

  return (
    <div className="min-h-[80vh] p-6 text-slate-200 bg-slate-950 flex flex-col gap-6">
      {/* Real-time KPI Stats Dashboard row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Provinces</span>
          <span className="text-2xl font-black text-white mt-2">{totalProvinces}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Regions</span>
          <span className="text-2xl font-black text-red-400 mt-2">{criticalCount}</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Risk Score</span>
          <span className="text-2xl font-black text-yellow-400 mt-2">{avgRisk}%</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Beds Available</span>
          <span className="text-2xl font-black text-emerald-400 mt-2 font-mono">{totalBeds}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 High-Risk Provinces Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <span>📊</span> Top 5 High-Risk Provinces
          </h3>
          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.top_provinces}
                margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="province_name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#cbd5e1' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="risk_score" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <span>🎯</span> Status Distribution
          </h3>
          <div className="w-full h-64 mt-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white">{totalProvinces}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Regions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Data Table Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>📋</span> Resource Allocation & Risk Status
          </h3>
          {/* Live Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search regions or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-slate-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-slate-700/50 font-bold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => toggleSort('province_name')}>
                  Province Name {sortField === 'province_name' ? (sortAscending ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 border-b border-slate-700/50 font-bold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => toggleSort('mosquito_density')}>
                  Mosquito Density {sortField === 'mosquito_density' ? (sortAscending ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 border-b border-slate-700/50 font-bold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => toggleSort('temperature')}>
                  Temperature {sortField === 'temperature' ? (sortAscending ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 border-b border-slate-700/50 font-bold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => toggleSort('beds_available')}>
                  Beds Available {sortField === 'beds_available' ? (sortAscending ? '▲' : '▼') : ''}
                </th>
                    <th className="px-6 py-4 font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSort('status')}>
                      Epidemic Status {sortField === 'status' ? (sortAscending ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap">
                      Allocation Status
                    </th>
                  </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sortedProvinces.length > 0 ? (
                sortedProvinces.map((prov) => (
                  <tr 
                    key={prov.province_name} 
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 border-b border-slate-700/50 font-semibold text-slate-100">{prov.province_name}</td>
                    <td className="px-6 py-4 border-b border-slate-700/50 text-slate-300">{prov.mosquito_density}</td>
                    <td className="px-6 py-4 border-b border-slate-700/50 text-slate-300">{prov.temperature.toFixed(1)}°C</td>
                    <td className="px-6 py-4 border-b border-slate-700/50 text-slate-300 font-mono font-medium">{prov.beds_available}</td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-slate-700/50">
                        {renderStatusBadge(prov.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-slate-700/50">
                        {allocation && allocation.allocation_result ? (
                          allocation.allocation_result.covered_regions.some(r => {
                            const nRegion = normalizeString(r.region);
                            const nProv = normalizeString(prov.province_name);
                            return nRegion.includes(nProv) || nProv.includes(nRegion);
                          }) ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Deployed</span>
                          ) : allocation.allocation_result.waiting_regions.some(r => {
                            const nRegion = normalizeString(r.region);
                            const nProv = normalizeString(prov.province_name);
                            return nRegion.includes(nProv) || nProv.includes(nRegion);
                          }) ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-slate-500/20 text-slate-400 border-slate-500/50">Pending</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )
                        ) : <span className="text-slate-500 font-medium italic">Not Run</span>}
                      </td>
                    </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                    No matching regions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourceTablesView;
