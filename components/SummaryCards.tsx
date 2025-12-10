
import React from 'react';
import { Equipment, EquipmentStatus, SystemType } from '../types';
import { SYSTEM_CONFIG } from '../constants';
import { MetricDisplay } from './Shared';
import { CheckCircle2, WifiOff, AlertTriangle, PenTool, TrendingUp, TrendingDown } from 'lucide-react';

// --- Equipment Count Card ---
export const StatCard: React.FC<{ 
  label: string; 
  count: number; 
  type: 'normal' | 'offline' | 'abnormal' | 'maintenance'; 
  onClick?: () => void 
}> = ({ label, count, type, onClick }) => {
  // Styles for the card logic
  const styles = {
    normal: { icon: CheckCircle2, color: 'text-green-400', border: 'border-green-500/20', hover: 'hover:border-green-500/40' },
    offline: { icon: WifiOff, color: 'text-slate-400', border: 'border-slate-700', hover: 'hover:border-slate-500' },
    abnormal: { icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500/20', hover: 'hover:border-red-500/40' },
    maintenance: { icon: PenTool, color: 'text-amber-400', border: 'border-amber-500/20', hover: 'hover:border-amber-500/40' },
  };

  const style = styles[type];
  const Icon = style.icon;

  // Unified visual style for the Icon container to reduce color noise (All use the "Offline" look)
  const unifiedIconStyle = {
    bg: 'bg-slate-700/30',
    color: 'text-slate-400'
  };

  return (
    <div 
      className={`p-4 rounded-xl border ${style.border} bg-[#0f172a] ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 ${style.hover} shadow-lg relative overflow-hidden group`}
      onClick={onClick}
    >
      {/* Background glow also unified to be subtle slate */}
      <div className={`absolute top-0 right-0 p-24 rounded-full blur-3xl opacity-5 bg-slate-700/30 pointer-events-none translate-x-10 -translate-y-10 group-hover:opacity-10 transition-opacity`}></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">{label}</p>
          {/* Number keeps its status color */}
          <p className={`text-2xl font-bold mt-1 font-mono ${style.color}`}>{count}</p>
        </div>
        {/* Icon container uses unified style */}
        <div className={`p-2 rounded-lg ${unifiedIconStyle.bg} ${unifiedIconStyle.color} shadow-inner`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      {onClick && <div className="absolute bottom-3 right-4 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">點擊查看詳情</div>}
    </div>
  );
};

// --- KPI Card for System View ---
export const KPICard: React.FC<{ label: string; value: string; unit: string; trend?: number }> = ({ label, value, unit, trend }) => {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] shadow-lg relative overflow-hidden">
       <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
       <div className="flex items-end gap-1">
         <span className="text-xl font-bold text-slate-100 font-mono">{value}</span>
         <span className="text-[10px] text-slate-500 mb-1">{unit}</span>
       </div>
       
       {trend !== undefined && (
         <div className={`absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : null}
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
         </div>
       )}
    </div>
  );
};


// --- System Overview Card ---
interface SystemCardProps {
  system: SystemType;
  totalEquip: number;
  availability: number;
  keyMetrics: Equipment['metrics'];
  onClick: () => void;
}

export const SystemCard: React.FC<SystemCardProps> = ({ system, totalEquip, availability, keyMetrics, onClick }) => {
  const config = SYSTEM_CONFIG[system];
  
  return (
    <div 
      onClick={onClick}
      className={`bg-[#0f172a] rounded-xl border border-slate-800 p-4 cursor-pointer hover:border-slate-600 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Abbreviation Box Removed */}
          <div>
            <h3 className="font-bold text-base text-slate-200 group-hover:text-blue-400 transition-colors">{config.label}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{totalEquip} 台設備</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold font-mono ${availability < 90 ? 'text-amber-400' : 'text-green-400'}`}>
            {availability.toFixed(1)}%
          </span>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">妥善率</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
        {keyMetrics.slice(0, 3).map((metric, i) => (
          <MetricDisplay key={i} metric={metric} compact />
        ))}
        {keyMetrics.length === 0 && (
          <div className="text-[10px] text-slate-500 italic py-1">無監測指標</div>
        )}
      </div>
    </div>
  );
};
