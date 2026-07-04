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
              {/* Argon Blue Line color stop */}
              <stop offset="5%" stopColor="#11cdef" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#11cdef" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            stroke="#8898aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#8898aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(255, 255, 255, 0.08)" 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#172b4d', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 15px 35px rgba(50,50,93,.1),0 5px 15px rgba(0,0,0,.07)' 
            }}
            itemStyle={{ color: '#11cdef', fontWeight: 600 }}
            labelStyle={{ color: '#ced4da', fontWeight: 600, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="infections" 
            stroke="#11cdef" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorInfections)" 
            animationDuration={800} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InfectionTrendChart;
