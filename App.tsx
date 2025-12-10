
import React, { useState, useMemo, useEffect } from 'react';
import { SPACE_TOPOLOGY, MOCK_EQUIPMENT, MOCK_TICKETS, SYSTEM_CONFIG, MOCK_MIXED_DATA, MOCK_SYSTEM_KPIS } from './constants';
import { SpaceNode, Equipment, SystemType, EquipmentStatus, Ticket } from './types';
import { TopologySidebar } from './components/TopologySidebar';
import { StatCard, SystemCard, KPICard } from './components/SummaryCards';
import { TrendChart, DistributionBarChart, UsagePieChart, ComposedMetricChart } from './components/Charts';
import { StatusBadge, MetricDisplay, Modal } from './components/Shared';
import { Search, Video, LayoutDashboard, ChevronRight, Power, Bell, Settings, User, LayoutGrid, Menu, X, ChevronDown, Monitor, Map, ArrowRight, MapPin } from 'lucide-react';

// --- Helper Functions ---
const filterEquipmentBySpace = (equipments: Equipment[], spaceId: string | null): Equipment[] => {
  if (!spaceId || spaceId === 'campus-1') return equipments;
  const node = findNodeById(SPACE_TOPOLOGY, spaceId);
  if (!node) return equipments;
  // Match path segments
  return equipments.filter(eq => eq.path.includes(node.name));
};

const findNodeById = (nodes: SpaceNode[], id: string): SpaceNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Recursive function to find the path of nodes to a target ID
const findPathToNode = (nodes: SpaceNode[], targetId: string, currentPath: SpaceNode[] = []): SpaceNode[] | null => {
  for (const node of nodes) {
    if (node.id === targetId) return [...currentPath, node];
    if (node.children) {
      const result = findPathToNode(node.children, targetId, [...currentPath, node]);
      if (result) return result;
    }
  }
  return null;
};

const getRelativeGroupName = (fullPath: string[], currentSpaceName?: string): string => {
  if (!currentSpaceName || currentSpaceName === 'Wulai 智慧園區') {
    return fullPath[1] || fullPath[0];
  }
  const idx = fullPath.indexOf(currentSpaceName);
  if (idx !== -1 && idx < fullPath.length - 1) {
    return fullPath[idx + 1];
  }
  return fullPath[fullPath.length - 1]; 
};

// --- Sub-Components ---

const EquipmentListModal = ({ 
  isOpen, 
  onClose, 
  title, 
  equipments, 
  onSelect 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  equipments: Equipment[], 
  onSelect: (eq: Equipment) => void 
}) => {
  
  // Group equipment by location path to create sections
  const groupedEquipments = useMemo(() => {
    const groups: Record<string, Equipment[]> = {};
    equipments.forEach(eq => {
      // Skip the first element (usually Campus name) for cleaner display
      const locationKey = eq.path.slice(1).join(' / ') || '其他區域';
      if (!groups[locationKey]) {
        groups[locationKey] = [];
      }
      groups[locationKey].push(eq);
    });
    return groups;
  }, [equipments]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} noPadding>
      <div className="pb-6">
        {equipments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">此分類無設備</div>
        ) : (
          Object.entries(groupedEquipments).map(([location, items]) => (
            <div key={location} className="">
               {/* Section Header */}
               <div className="flex items-center gap-2 px-5 py-2.5 sticky top-0 bg-[#0f172a] z-10 border-b border-slate-800 shadow-sm">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{location}</h4>
                 <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">{items.length}</span>
               </div>
               
               <div className="space-y-2 p-4">
                 {items.map(eq => (
                  <div 
                    key={eq.id} 
                    onClick={() => onSelect(eq)}
                    className="flex items-center py-2.5 px-4 bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    {/* Icon/Status Dot */}
                    <div className="mr-3 shrink-0 flex items-center justify-center w-8">
                      <div className={`w-2.5 h-2.5 rounded-full ${eq.isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} />
                    </div>

                    {/* Name Only (Path is now in section header) */}
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">{eq.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2 items-center">
                        <StatusBadge status={eq.status} minimal />
                        {/* Error Reason */}
                        {eq.status !== EquipmentStatus.NORMAL && (
                          <span className="text-xs text-red-400 font-normal">
                            {eq.status === EquipmentStatus.OFFLINE ? '設備未連線' : '主控制器回應超時 (Error Code: 0x84)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metric & Chevron */}
                    <div className="text-right shrink-0 flex items-center gap-3">
                      {eq.status !== EquipmentStatus.NORMAL ? (
                          <span className="font-mono text-slate-600 font-bold text-sm tracking-widest hidden sm:inline-block">--</span>
                      ) : eq.metrics[0] ? (
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="font-mono font-bold text-sm text-slate-200">
                              {eq.metrics[0].value}
                              <span className="text-[10px] text-slate-500 font-normal ml-0.5">{eq.metrics[0].unit}</span>
                            </span>
                            <span className="text-[10px] text-slate-500">{eq.metrics[0].label}</span>
                        </div>
                      ) : null}
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400" />
                    </div>
                  </div>
                 ))}
               </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

// Updated Equipment Detail Modal
const EquipmentDetailModal = ({ equipment, isOpen, onClose }: { equipment: Equipment | null, isOpen: boolean, onClose: () => void }) => {
  if (!equipment) return null;

  // Custom Header Content
  const ModalHeader = (
    <div className="flex flex-col gap-1.5">
       <div className="flex items-center gap-2">
          <span>{equipment.name}</span>
          {/* Running Status Dot */}
          <div 
            className={`w-2 h-2 rounded-full ${equipment.isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} 
            title={equipment.isRunning ? "運轉中" : "已停止"}
          />
       </div>
       <div className="flex items-center gap-2">
          <StatusBadge status={equipment.status} />
          {/* Error Reason for Abnormal/Maintenance/Offline */}
          {equipment.status !== EquipmentStatus.NORMAL && (
             <span className="text-xs text-red-400 font-normal">
               {equipment.status === EquipmentStatus.OFFLINE ? '設備未連線' : '主控制器回應超時 (Error Code: 0x84)'}
             </span>
          )}
       </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ModalHeader} widthClass="max-w-3xl">
      <div className="flex flex-col gap-6">
        
        {/* 1. Breadcrumb Path */}
        <div className="flex flex-wrap items-center gap-y-1 text-xs text-slate-400 font-mono bg-slate-950/30 p-2 rounded-lg border border-slate-800/50 leading-relaxed">
          <Map size={12} className="text-blue-500 mr-2 shrink-0" />
          {equipment.path.map((segment, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-600 mx-1.5 font-light">/</span>}
              <span className={`${i === equipment.path.length - 1 ? 'text-slate-200 font-bold' : ''} whitespace-normal break-words`}>{segment}</span>
            </React.Fragment>
          ))}
        </div>

        {/* 3. Metrics Section */}
        <div>
           <div className="flex items-center gap-2 mb-3">
               <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">即時監測指標</h3>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipment.metrics.map((m, i) => (
                <div key={i} className="p-3 bg-[#0f172a] border border-slate-700 rounded-xl relative overflow-hidden">
                   {/* Background decoration */}
                   <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-slate-800/20 to-transparent rounded-bl-full pointer-events-none"></div>
                  <MetricDisplay metric={m} />
                </div>
              ))}
              {equipment.metrics.length === 0 && (
                 <div className="col-span-full p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                   暫無數據訊號
                 </div>
              )}
           </div>
        </div>

        {/* 4. CCTV Section */}
        <div>
           <div className="flex items-center gap-2 mb-3">
               <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">現場監控畫面</h3>
           </div>
           {equipment.hasCCTV ? (
             <div className="bg-black rounded-xl border border-slate-700 overflow-hidden relative group">
               <div className="aspect-video relative">
                 <img src={`https://picsum.photos/seed/${equipment.id}/800/450`} alt="CCTV" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 
                 {/* CCTV Overlay UI */}
                 <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-2 border border-white/10">
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-mono text-white font-bold">REC</span>
                 </div>
                 <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded">
                   {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                 </div>
               </div>
             </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 bg-slate-900/30">
              <Video size={24} className="mb-2 opacity-20" />
              <span className="text-xs">此設備周邊無配置監控鏡頭</span>
            </div>
          )}
        </div>

        {/* 5. Maintenance Section */}
        <div>
           <div className="flex items-center gap-2 mb-3">
               <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">維護歷程與排程</h3>
           </div>
           <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div>
                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">上次維養日期</span>
                 <span className="text-base font-mono font-bold text-slate-200">{equipment.lastMaintenance}</span>
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-700/50"></div>
              <div>
                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">預計下次維養</span>
                 <span className="text-base font-mono font-bold text-slate-200">{equipment.nextMaintenance}</span>
              </div>
           </div>
        </div>

      </div>
    </Modal>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('campus-1');
  const [selectedSystem, setSelectedSystem] = useState<SystemType | null>(null);
  
  // Collapsible state for equipment groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Modals
  const [viewingStatus, setViewingStatus] = useState<EquipmentStatus | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Derived Data
  const currentSpaceNode = useMemo(() => findNodeById(SPACE_TOPOLOGY, selectedSpaceId), [selectedSpaceId]);
  
  // Get Breadcrumb path nodes
  const breadcrumbNodes = useMemo(() => {
    return findPathToNode(SPACE_TOPOLOGY, selectedSpaceId) || [];
  }, [selectedSpaceId]);

  const filteredEquipment = useMemo(() => {
    let eq = filterEquipmentBySpace(MOCK_EQUIPMENT, selectedSpaceId);
    if (selectedSystem) {
      eq = eq.filter(e => e.system === selectedSystem);
    }
    return eq;
  }, [selectedSpaceId, selectedSystem]);

  // Grouping Logic
  const groupedEquipment = useMemo<Record<string, Equipment[]>>(() => {
    if (!selectedSystem) return {};
    const groups: Record<string, Equipment[]> = {};
    filteredEquipment.forEach(eq => {
      const groupName = getRelativeGroupName(eq.path, currentSpaceNode?.name);
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(eq);
    });
    return groups;
  }, [filteredEquipment, selectedSystem, currentSpaceNode]);

  const stats = useMemo(() => {
    return {
      normal: filteredEquipment.filter(e => e.status === EquipmentStatus.NORMAL).length,
      offline: filteredEquipment.filter(e => e.status === EquipmentStatus.OFFLINE).length,
      abnormal: filteredEquipment.filter(e => e.status === EquipmentStatus.ABNORMAL).length,
      maintenance: filteredEquipment.filter(e => e.status === EquipmentStatus.MAINTENANCE).length,
    };
  }, [filteredEquipment]);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${i*2}:00`,
      value: Math.floor(Math.random() * 60) + 40
    }));
  }, [selectedSpaceId, selectedSystem]);

  const distData = useMemo(() => [
    { name: 'A棟', value: 85 },
    { name: 'B棟', value: 65 },
    { name: '公園', value: 30 },
  ], []);

  const pieData = useMemo(() => [
    { name: '空調', value: 450 },
    { name: '照明', value: 300 },
    { name: '動力', value: 250 },
  ], []);

  const handleSystemSelect = (sys: SystemType | null) => {
    setSelectedSystem(sys);
    setIsSystemDropdownOpen(false);
  };

  const getStatusTitle = (s: EquipmentStatus) => {
    switch(s) {
      case EquipmentStatus.NORMAL: return '正常運作設備';
      case EquipmentStatus.OFFLINE: return '未連線設備';
      case EquipmentStatus.ABNORMAL: return '設備故障清單';
      case EquipmentStatus.MAINTENANCE: return '維護中設備';
      default: return '設備列表';
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 font-sans text-sm overflow-hidden selection:bg-blue-500/30">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 xl:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <TopologySidebar 
        nodes={SPACE_TOPOLOGY} 
        onSelect={(node) => {
          setSelectedSpaceId(node.id);
          setIsSidebarOpen(false);
        }} 
        selectedId={selectedSpaceId}
        isOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Floating Nav Container */}
        <div className="mx-4 mt-4 mb-2 rounded-2xl border border-slate-800 bg-dark-card shadow-2xl shrink-0 z-20 flex flex-col">
          {/* Header - System Switcher */}
          <header className="h-12 md:h-14 flex items-center justify-between px-4 relative rounded-t-2xl">
            <div className="flex items-center gap-3">
              {/* System Dropdown */}
              <div className="relative group inline-flex items-center">
                
                {/* Custom Dropdown Trigger - Icon Removed */}
                <div 
                  className="relative inline-flex items-center gap-2 cursor-pointer group"
                  onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
                >
                  <span className="font-bold text-base text-slate-100 group-hover:text-blue-400 transition-colors">
                    {selectedSystem ? SYSTEM_CONFIG[selectedSystem].label : '全系統監控 (Overview)'}
                  </span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isSystemDropdownOpen ? 'rotate-180' : ''}`} />
                  
                  {/* Dropdown Menu */}
                  {isSystemDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsSystemDropdownOpen(false); }}></div>
                      <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                         <div 
                            className={`px-4 py-2.5 hover:bg-slate-800 cursor-pointer flex items-center gap-3 ${!selectedSystem ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}
                            onClick={(e) => { e.stopPropagation(); handleSystemSelect(null); }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${!selectedSystem ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                            全系統監控 (Overview)
                         </div>
                         <div className="h-px bg-slate-800 my-1 mx-2"></div>
                         {Object.values(SystemType).map(sys => (
                          <div 
                            key={sys}
                            className={`px-4 py-2.5 hover:bg-slate-800 cursor-pointer flex items-center gap-3 ${selectedSystem === sys ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}
                            onClick={(e) => { e.stopPropagation(); handleSystemSelect(sys); }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedSystem === sys ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                            {SYSTEM_CONFIG[sys].label}
                          </div>
                         ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          <div className="h-px bg-slate-800 w-full" />

          {/* Sub-Header - Full Breadcrumbs & Topology Toggle */}
          <div 
            className="h-10 flex items-center px-4 md:px-6 cursor-pointer hover:bg-slate-800/50 transition-colors rounded-b-2xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
             <div className="flex items-center flex-1 gap-2 overflow-hidden">
               {/* Map Icon Removed */}
               <div className="flex items-center text-xs md:text-sm text-slate-300 overflow-x-auto no-scrollbar whitespace-nowrap mask-linear-fade">
                 {breadcrumbNodes.map((node, i) => (
                   <React.Fragment key={node.id}>
                      {i > 0 && <span className="text-slate-600 mx-2">/</span>}
                      <span className={i === breadcrumbNodes.length - 1 ? 'font-bold text-slate-100' : 'text-slate-400'}>
                        {node.name}
                      </span>
                   </React.Fragment>
                 ))}
                 <ChevronDown size={12} className="ml-2 text-slate-500" />
               </div>
             </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 md:pt-2 relative">
          <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
            
            {selectedSystem && (
              <>
                {/* 1. System Status Stats (Availability) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                     <h2 className="text-base font-bold text-slate-200">系統狀態統計</h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="正常運作" count={stats.normal} type="normal" onClick={() => setViewingStatus(EquipmentStatus.NORMAL)} />
                    <StatCard label="未連線" count={stats.offline} type="offline" onClick={() => setViewingStatus(EquipmentStatus.OFFLINE)} />
                    <StatCard label="設備故障" count={stats.abnormal} type="abnormal" onClick={() => setViewingStatus(EquipmentStatus.ABNORMAL)} />
                    <StatCard label="維養中" count={stats.maintenance} type="maintenance" onClick={() => setViewingStatus(EquipmentStatus.MAINTENANCE)} />
                  </div>
                </div>

                {/* 2. Key Performance Indicators (KPIs) */}
                <div>
                   <div className="flex items-center gap-2 mb-3">
                     <h2 className="text-base font-bold text-slate-200">關鍵運行指標</h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                     {MOCK_SYSTEM_KPIS[selectedSystem].map((kpi, idx) => (
                       <KPICard key={idx} {...kpi} />
                     ))}
                  </div>
                </div>

                {/* 3. Charts Section */}
                <div>
                   <div className="flex items-center gap-2 mb-3">
                     <h2 className="text-base font-bold text-slate-200">趨勢與分佈</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                       <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-lg">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                           指標趨勢分析
                         </h3>
                         <TrendChart data={chartData} color={SYSTEM_CONFIG[selectedSystem].color.replace('text-', '').replace('-400', '')} />
                       </div>
                       
                       <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-lg">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                           區域負載佔比
                         </h3>
                         <DistributionBarChart data={distData} />
                       </div>

                       <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-lg lg:col-span-2">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            效率/負載交叉分析
                          </h3>
                          <ComposedMetricChart data={MOCK_MIXED_DATA} />
                        </div>
                  </div>
                </div>
              </>
            )}

            {/* Overview (No System Selected) */}
            {!selectedSystem && (
              <>
                <div className="flex items-center gap-2 pt-2">
                   <h2 className="text-base font-bold text-slate-200">各系統概況</h2>
                </div>
                
                {/* Global Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <StatCard label="正常運作" count={stats.normal} type="normal" onClick={() => setViewingStatus(EquipmentStatus.NORMAL)} />
                  <StatCard label="未連線" count={stats.offline} type="offline" onClick={() => setViewingStatus(EquipmentStatus.OFFLINE)} />
                  <StatCard label="設備故障" count={stats.abnormal} type="abnormal" onClick={() => setViewingStatus(EquipmentStatus.ABNORMAL)} />
                  <StatCard label="維養中" count={stats.maintenance} type="maintenance" onClick={() => setViewingStatus(EquipmentStatus.MAINTENANCE)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.values(SystemType).map(sys => {
                     const sysEq = filteredEquipment.filter(e => e.system === sys);
                     const total = sysEq.length;
                     const available = total > 0 ? (sysEq.filter(e => e.status === EquipmentStatus.NORMAL).length / total) * 100 : 0;
                     const sampleMetrics = sysEq[0]?.metrics.slice(0, 3) || [];
                     return (
                      <SystemCard 
                        key={sys}
                        system={sys}
                        totalEquip={total}
                        availability={available}
                        keyMetrics={sampleMetrics}
                        onClick={() => handleSystemSelect(sys)}
                      />
                     );
                  })}
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                     <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-lg">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">全域用電趨勢</h3>
                       <TrendChart data={chartData} color="#3b82f6" />
                     </div>
                     <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-lg">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">系統能耗佔比</h3>
                       <UsagePieChart data={pieData} />
                     </div>
                 </div>
              </>
            )}

            {/* 5. Equipment List (System View Only) - CCTV REMOVED */}
            {selectedSystem && (
              <div className="space-y-6">
                
                {/* Mobile-First Equipment List */}
                <div className="flex items-center gap-2 pt-2">
                   <h2 className="text-base font-bold text-slate-200">設備清單</h2>
                </div>

                {Object.entries(groupedEquipment).map(([groupName, items]: [string, Equipment[]]) => {
                  // Check if group is expanded (default to true if undefined)
                  const isExpanded = expandedGroups[groupName] !== false;

                  return (
                    <div key={groupName} className="bg-dark-card rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                      {/* Group Header - Collapsible */}
                      <div 
                        className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => setExpandedGroups(prev => ({ ...prev, [groupName]: !isExpanded }))}
                      >
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{groupName}</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <span className="text-[10px] text-slate-500 font-mono">{items.length} DEVICES</span>
                           <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                         </div>
                      </div>

                      {/* List Items - Condition Render */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-800/50">
                          {items.map(eq => (
                            <div 
                              key={eq.id} 
                              onClick={() => setSelectedEquipment(eq)}
                              className="flex items-center py-2.5 px-4 hover:bg-slate-800/40 active:bg-slate-800/60 transition-colors cursor-pointer group"
                            >
                              {/* Col 1: Icon/Status - Changed to Dot */}
                              <div className="mr-3 shrink-0 flex items-center justify-center w-8">
                                 <div className={`w-2.5 h-2.5 rounded-full ${eq.isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} />
                              </div>

                              {/* Col 2: Name & Tag */}
                              <div className="flex-1 min-w-0 mr-2">
                                 <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">{eq.name}</p>
                                 <div className="mt-0.5 flex flex-wrap gap-2 items-center">
                                   <StatusBadge status={eq.status} minimal />
                                   {/* Error Reason */}
                                   {eq.status !== EquipmentStatus.NORMAL && (
                                     <span className="text-xs text-red-400 font-normal">
                                       {eq.status === EquipmentStatus.OFFLINE ? '設備未連線' : '主控制器回應超時 (Error Code: 0x84)'}
                                     </span>
                                   )}
                                 </div>
                              </div>

                              {/* Col 3: Metric & Chevron */}
                              <div className="text-right shrink-0 flex items-center gap-3">
                                 {eq.status !== EquipmentStatus.NORMAL ? (
                                    <span className="font-mono text-slate-600 font-bold text-sm tracking-widest">--</span>
                                 ) : eq.metrics[0] ? (
                                   <div className="flex flex-col items-end">
                                      <span className="font-mono font-bold text-sm text-slate-200">
                                        {eq.metrics[0].value}
                                        <span className="text-[10px] text-slate-500 font-normal ml-0.5">{eq.metrics[0].unit}</span>
                                      </span>
                                      <span className="text-[10px] text-slate-500">{eq.metrics[0].label}</span>
                                   </div>
                                 ) : (
                                   <span className="text-slate-600 text-xs">-</span>
                                 )}
                                 <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Object.keys(groupedEquipment).length === 0 && (
                  <div className="text-center py-12 text-slate-500 bg-[#0f172a] border border-slate-800 rounded-xl border-dashed">
                    此區域無相關設備
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- Modals --- */}
      <EquipmentListModal 
        isOpen={!!viewingStatus}
        onClose={() => setViewingStatus(null)}
        title={viewingStatus ? getStatusTitle(viewingStatus) : ''}
        equipments={filteredEquipment.filter(e => e.status === viewingStatus)}
        onSelect={(eq) => {
           setSelectedEquipment(eq);
           // Optional: close list modal?
           // setViewingStatus(null); 
           // Better to keep it open so user can go back, but modal is z-indexed on top.
           // If we don't close, the new modal will open on top.
        }}
      />
      
      <EquipmentDetailModal 
        equipment={selectedEquipment}
        isOpen={!!selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
      />

    </div>
  );
}
