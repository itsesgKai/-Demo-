
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl z-50">
        <p className="text-slate-300 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-bold font-mono text-sm" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TrendChart = ({ data, color = "#06b6d4" }: { data: any[], color?: string }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
          <stop offset="95%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
      <Tooltip content={<CustomTooltip />} cursor={{stroke: color, strokeWidth: 1, strokeDasharray: '4 4'}} />
      <Area 
        type="monotone" 
        dataKey="value" 
        name="數值"
        stroke={color} 
        strokeWidth={2} 
        fillOpacity={1} 
        fill={`url(#color${color.replace('#', '')})`} 
        animationDuration={1500}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const DistributionBarChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} interval={0} />
      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
      <Tooltip cursor={{fill: '#1e293b'}} content={<CustomTooltip />} />
      <Bar dataKey="value" name="數量" radius={[4, 4, 0, 0]}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.value < 20 ? '#ef4444' : '#3b82f6'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const UsagePieChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
        nameKey="name"
        stroke="none"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '12px', color: '#94a3b8'}} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-slate-500">
        能耗佔比
      </text>
    </PieChart>
  </ResponsiveContainer>
);

export const ComposedMetricChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
      <Tooltip content={<CustomTooltip />} />
      <Bar yAxisId="left" dataKey="load" name="負載 (kW)" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
      <Line yAxisId="right" type="monotone" dataKey="efficiency" name="效率 (%)" stroke="#22c55e" strokeWidth={2} dot={{r: 2}} />
    </ComposedChart>
  </ResponsiveContainer>
);
