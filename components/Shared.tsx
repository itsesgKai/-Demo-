
import React from 'react';
import { AlertLevel, MetricDefinition } from '../types';

// --- Badges ---
export const StatusBadge: React.FC<{ status: string, minimal?: boolean }> = ({ status, minimal = false }) => {
  const styles = {
    NORMAL: 'bg-green-500/10 text-green-400 border-green-500/20',
    OFFLINE: 'bg-slate-700/50 text-slate-400 border-slate-600',
    ABNORMAL: 'bg-red-500/10 text-red-400 border-red-500/20',
    MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  const label = {
    NORMAL: '正常運作',
    OFFLINE: '未連線',
    ABNORMAL: '故障',
    MAINTENANCE: '維護中',
  };
  const c = styles[status as keyof typeof styles] || styles.OFFLINE;
  const t = label[status as keyof typeof label] || status;

  return (
    <span className={`rounded text-[10px] font-medium border ${c} whitespace-nowrap flex items-center justify-center ${minimal ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}`}>
      {t}
    </span>
  );
};

// --- Metric Visualizations ---

const getAlertLevel = (val: number, def: MetricDefinition): AlertLevel => {
  if (!def.thresholds) return AlertLevel.SAFE;
  
  // Logic: "Storage/Level" usually means Low is Bad. "Load/Pressure" usually means High is Bad.
  // We use the metric ID to simple heuristic for this demo.
  const isStorageType = def.id === 'level'; 

  if (isStorageType) {
    // Low is bad
    if (val <= def.thresholds.danger) return AlertLevel.DANGER;
    if (val <= def.thresholds.warning) return AlertLevel.WARNING;
    return AlertLevel.SAFE;
  } else {
    // High is bad (Default)
    if (val >= def.thresholds.danger) return AlertLevel.DANGER;
    if (val >= def.thresholds.warning) return AlertLevel.WARNING;
    return AlertLevel.SAFE;
  }
};

const getColorForLevel = (level: AlertLevel) => {
  switch (level) {
    case AlertLevel.DANGER: return 'text-red-500';
    case AlertLevel.WARNING: return 'text-amber-500';
    default: return 'text-green-400';
  }
};

const getBgColorForLevel = (level: AlertLevel) => {
  switch (level) {
    case AlertLevel.DANGER: return 'bg-red-500';
    case AlertLevel.WARNING: return 'bg-amber-500';
    default: return 'bg-green-500';
  }
};

export const MetricDisplay: React.FC<{ metric: MetricDefinition, compact?: boolean }> = ({ metric, compact = false }) => {
  const level = getAlertLevel(metric.value, metric);
  const colorClass = getColorForLevel(level);
  const bgClass = getBgColorForLevel(level);

  if (metric.type === 'numeric') {
    return (
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{metric.label}</span>
        <span className={`font-mono font-bold ${compact ? 'text-lg' : 'text-xl'} ${colorClass} mt-0.5`}>
          {metric.value} <span className="text-[10px] font-normal text-slate-500 ml-0.5">{metric.unit}</span>
        </span>
      </div>
    );
  }

  if (metric.type === 'progress') {
    // Determine color based on level
    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{metric.label}</span>
          <span className={`text-xs font-mono font-bold ${colorClass}`}>{metric.value}{metric.unit}</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${bgClass} shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-500`} 
            style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
          />
        </div>
      </div>
    );
  }

  if (metric.type === 'gauge') {
    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{metric.label}</span>
          <span className={`text-xs font-mono font-bold ${colorClass}`}>{metric.value}{metric.unit}</span>
        </div>
        <div className="flex w-full h-1 gap-0.5">
          {[...Array(10)].map((_, i) => {
            const segmentVal = (i + 1) * 10;
            const isActive = metric.value >= i * 10;
            const isDangerZone = segmentVal > (metric.thresholds?.danger || 90);
            const isWarningZone = segmentVal > (metric.thresholds?.warning || 70) && !isDangerZone;
            
            let baseColor = 'bg-slate-800'; // Inactive
            if (isActive) {
               if (isDangerZone) baseColor = 'bg-red-500';
               else if (isWarningZone) baseColor = 'bg-amber-500';
               else baseColor = 'bg-green-500'; // Default safe color
            }

            return (
              <div key={i} className={`flex-1 rounded-[1px] ${baseColor} transition-colors duration-300`} />
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode; 
  children: React.ReactNode;
  widthClass?: string;
  icon?: React.ReactNode;
  noPadding?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, widthClass = 'max-w-2xl', icon, noPadding = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-dark-card rounded-xl border border-slate-700 shadow-2xl w-full ${widthClass} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 w-full">
             {icon && <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>}
             <div className="text-lg font-bold text-slate-100 flex-1">{title}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className={`${noPadding ? 'p-0' : 'p-5'} overflow-y-auto custom-scrollbar text-sm`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Status Dot ---
export const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-slate-600'}`} />
);

// --- Toggle ---
export const Toggle: React.FC<{ checked: boolean; onChange?: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <div 
    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-slate-700'}`}
    onClick={() => onChange && onChange(!checked)}
  >
    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);
