import { useEffect, useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ForecastDataPoint {
  month: string;
  recordedCases: number | null;
  forecastMean: number | null;
  forecastUpper: number | null;
  probExceed75th: number | null;
}

interface ForecastResponse {
  region: string;
  mapped_to: string;
  data: ForecastDataPoint[];
}

export const LongTermForecastChart = ({ region }: { region: string }) => {
  const [data, setData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/forecast?region=${encodeURIComponent(region)}`);
        const json: ForecastResponse = await response.json();
        setData(json.data);
      } catch (error) {
        console.error("Failed to fetch forecast", error);
      }
      setLoading(false);
    };
    
    if (region) {
      fetchForecast();
    }
  }, [region]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center flex-col space-y-4 bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 shadow-xl min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <p className="text-slate-400">Đang chạy mô hình AI Dự báo dài hạn...</p>
      </div>
    );
  }

  // Find the index of the transition (where historical ends and forecast begins)
  const todayIndex = data.findIndex(d => d.forecastMean !== null && d.recordedCases !== null);
  const todayMonth = todayIndex >= 0 ? data[todayIndex].month : "";

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 shadow-xl min-h-[500px]">
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 text-xl">
          📈
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Dự báo số ca mắc sốt xuất huyết dengue: {region}</h2>
          <p className="text-sm text-slate-400">Mô hình Machine Learning (Random Forest) - Khung thời gian 12 tháng</p>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#cbd5e1' }}/>
            
            {/* Shaded Area for Forecast Upper Bound (75th Percentile) */}
            <Area 
              type="monotone" 
              dataKey="forecastUpper" 
              name="Tổ hợp dự báo (Phân vị 75)" 
              stroke="none" 
              fillOpacity={1} 
              fill="url(#colorUpper)" 
              connectNulls
            />
            
            {/* Historical Recorded Cases */}
            <Line 
              type="monotone" 
              dataKey="recordedCases" 
              name="Số ca ghi nhận" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }} 
              connectNulls
            />
            
            {/* Forecast Mean */}
            <Line 
              type="monotone" 
              dataKey="forecastMean" 
              name="Trung bình dự báo" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#1e293b' }} 
              connectNulls
            />

            {todayMonth && (
              <ReferenceLine x={todayMonth} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Dự báo từ đây', fill: '#ef4444', fontSize: 12 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/80">
        <div className="bg-slate-800 p-2 text-sm font-semibold text-slate-300 flex items-center gap-2">
          <span className="text-amber-500 text-lg">⚠️</span>
          Dự báo xác suất vượt quá ngưỡng Phân vị thứ 75 (Nguy cơ bùng dịch)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 font-medium">Tháng</th>
                {data.filter(d => d.probExceed75th !== null).map((d, i) => (
                  <th key={i} className="px-2 py-2 text-center border-l border-slate-700/50 whitespace-nowrap">{d.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-700/50">
                <td className="px-4 py-2 font-medium text-amber-400">Xác suất (%)</td>
                {data.filter(d => d.probExceed75th !== null).map((d, i) => (
                  <td key={i} className={`px-2 py-2 text-center border-l border-slate-700/50 font-bold ${d.probExceed75th && d.probExceed75th > 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {d.probExceed75th}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
