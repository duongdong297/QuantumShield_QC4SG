import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TrendPoint {
  day: string;
  infections: number;
}

interface InfectionTrendChartProps {
  data: TrendPoint[];
}

const InfectionTrendChart: React.FC<InfectionTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        No trend data available (Offline)
      </div>
    );
  }

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorInfections" x1="0" y1="0" x2="0" y2="1">
              {/* Gradient từ đỏ nhạt xuống trong suốt để tạo cảm giác cảnh báo hiện đại */}
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e2e8f0" 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
            }}
            itemStyle={{ color: '#ef4444', fontWeight: 600 }}
            labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="infections" 
            stroke="#ef4444" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorInfections)" 
            animationDuration={800} // Cập nhật mượt khi nhận dữ liệu WebSocket
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InfectionTrendChart;
