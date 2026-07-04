import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const ResourceTablesView: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-slate-400 font-semibold">Loading Resource Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-400">
        ⚠️ Failed to load resource tables data from Edge API.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex flex-col min-h-[80vh] text-white">
      {/* Top Section: Horizontal Bar Chart */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
          <span>📊</span> Top 5 High-Risk Provinces
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.top_provinces}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
              </defs>
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="province_name" type="category" stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                itemStyle={{ color: '#f43f5e' }}
              />
              <Bar dataKey="risk_score" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section: Data Grid Table */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-2xl overflow-hidden">
        <h3 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
          <span>📋</span> Resource Allocation & Risk Status
        </h3>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-700">
                <th className="px-6 py-4 font-semibold">Province Name</th>
                <th className="px-6 py-4 font-semibold">Mosquito Density</th>
                <th className="px-6 py-4 font-semibold">Temperature</th>
                <th className="px-6 py-4 font-semibold">Beds Available</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.all_provinces.map((prov) => (
                <tr 
                  key={prov.province_name} 
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-100">{prov.province_name}</td>
                  <td className="px-6 py-4 text-slate-300">{prov.mosquito_density}</td>
                  <td className="px-6 py-4 text-slate-300">{prov.temperature.toFixed(1)}°C</td>
                  <td className="px-6 py-4 text-slate-300 font-mono">{prov.beds_available}</td>
                  <td className="px-6 py-4">
                    {prov.status === 'Critical' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg shadow-red-600/20">
                        Critical
                      </span>
                    )}
                    {prov.status === 'Warning' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black shadow-lg shadow-yellow-500/25">
                        Warning
                      </span>
                    )}
                    {prov.status === 'Safe' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-lg shadow-green-600/20">
                        Safe
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourceTablesView;
