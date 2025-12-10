
import { SpaceNode, Equipment, SystemType, EquipmentStatus, Ticket } from './types';

export const SPACE_TOPOLOGY: SpaceNode[] = [
  {
    id: 'campus-1',
    name: 'Wulai 智慧園區',
    type: 'campus',
    children: [
      {
        id: 'bldg-a',
        name: 'A棟 (科技大樓)',
        type: 'building',
        children: [
          {
            id: 'bldg-a-1f',
            name: '1F',
            type: 'floor',
            children: [
              { id: 'bldg-a-1f-lobby', name: '大廳', type: 'area' },
              { id: 'bldg-a-1f-server', name: '機房中心', type: 'area' },
            ]
          },
          {
            id: 'bldg-a-2f',
            name: '2F',
            type: 'floor',
            children: [
              { id: 'bldg-a-2f-office', name: '開放辦公區', type: 'area' },
              { id: 'bldg-a-2f-meeting', name: '會議室 A', type: 'area' },
            ]
          }
        ]
      },
      {
        id: 'bldg-b',
        name: 'B棟 (行政中心)',
        type: 'building',
        children: [
          {
            id: 'bldg-b-1f',
            name: '1F',
            type: 'floor',
            children: [{ id: 'bldg-b-1f-cafeteria', name: '員工餐廳', type: 'area' }]
          },
          {
            id: 'bldg-b-b1',
            name: 'B1',
            type: 'floor',
            children: [{ id: 'bldg-b-b1-parking', name: '停車場', type: 'area' }]
          }
        ]
      },
      {
        id: 'zone-park',
        name: '生態公園',
        type: 'building',
        children: [
           { id: 'zone-park-main', name: '主要活動區', type: 'area' }
        ]
      }
    ]
  }
];

// Helper to generate random equipment
const generateEquipment = (): Equipment[] => {
  const equipments: Equipment[] = [];
  const statuses = Object.values(EquipmentStatus);
  const systems = Object.values(SystemType);
  
  // Create 50 random items
  for (let i = 0; i < 50; i++) {
    const sys = systems[i % systems.length];
    // Slightly favor NORMAL status
    const status = Math.random() > 0.85 ? statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1] : EquipmentStatus.NORMAL;
    
    let metrics = [];
    if (sys === SystemType.ELECTRICITY) {
      metrics.push({
        id: 'load', label: '即時負載', value: Math.floor(Math.random() * 100), unit: '%', type: 'gauge',
        thresholds: { warning: 75, danger: 90 }, trend: Math.floor(Math.random() * 10) - 5
      } as const);
      metrics.push({
        id: 'usage', label: '今日用電', value: Math.floor(Math.random() * 500) + 100, unit: 'kWh', type: 'numeric'
      } as const);
      metrics.push({
        id: 'voltage', label: '電壓', value: 220 + Math.floor(Math.random() * 5), unit: 'V', type: 'numeric'
      } as const);
    } else if (sys === SystemType.WATER) {
      metrics.push({
        id: 'pressure', label: '水壓', value: (Math.random() * 5 + 2).toFixed(1), unit: 'bar', type: 'numeric',
        thresholds: { warning: 6, danger: 8 }
      } as const);
      metrics.push({
        id: 'flow', label: '流速', value: Math.floor(Math.random() * 100), unit: 'L/min', type: 'numeric'
      } as const);
    } else if (sys === SystemType.GAS) {
      metrics.push({
        id: 'level', label: '儲槽存量', value: Math.floor(Math.random() * 100), unit: '%', type: 'progress',
        thresholds: { warning: 30, danger: 15 } // Low is bad for storage
      } as const);
       metrics.push({
        id: 'pressure', label: '輸出壓力', value: 100 + Math.floor(Math.random() * 20), unit: 'psi', type: 'numeric'
      } as const);
    } else if (sys === SystemType.HVAC) {
      metrics.push({
        id: 'temp', label: '室內溫度', value: 22 + Math.floor(Math.random() * 8), unit: '°C', type: 'numeric',
        thresholds: { warning: 27, danger: 30 }
      } as const);
      metrics.push({
        id: 'humidity', label: '濕度', value: 40 + Math.floor(Math.random() * 40), unit: '%', type: 'numeric'
      } as const);
    } else if (sys === SystemType.LIGHTING) {
       metrics.push({
        id: 'brightness', label: '亮度', value: Math.floor(Math.random() * 100), unit: '%', type: 'progress',
        thresholds: { warning: 101, danger: 101 } // No danger for lighting usually, just status
      } as const);
    }

    // Assign consistent paths based on index to group them
    let path = ['Wulai 智慧園區'];
    if (i % 3 === 0) path = ['Wulai 智慧園區', 'A棟 (科技大樓)', '1F', '機房中心'];
    else if (i % 3 === 1) path = ['Wulai 智慧園區', 'A棟 (科技大樓)', '2F', '開放辦公區'];
    else path = ['Wulai 智慧園區', 'B棟 (行政中心)', '1F', '員工餐廳'];

    // Generate random location coordinates (10% to 90% to avoid edges)
    const location = Math.random() > 0.2 ? {
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10
    } : undefined;

    equipments.push({
      id: `eq-${i}`,
      name: `${SYSTEM_CONFIG[sys].label} #${i + 100}`,
      system: sys,
      path: path,
      status: status,
      isRunning: status === EquipmentStatus.NORMAL,
      metrics: metrics,
      lastMaintenance: '2023-10-15',
      nextMaintenance: '2024-04-15',
      pendingTickets: status !== EquipmentStatus.NORMAL ? 1 : 0,
      hasCCTV: Math.random() > 0.8,
      location: location
    });
  }
  return equipments;
};

export const SYSTEM_CONFIG = {
  [SystemType.ELECTRICITY]: { label: '電力系統', icon: 'Zap', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  [SystemType.WATER]: { label: '給水系統', icon: 'Droplets', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  [SystemType.GAS]: { label: '瓦斯系統', icon: 'Flame', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  [SystemType.HVAC]: { label: '空調系統', icon: 'Fan', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  [SystemType.LIGHTING]: { label: '照明系統', icon: 'Lightbulb', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
};

export const MOCK_EQUIPMENT = generateEquipment();

export const MOCK_TICKETS: Ticket[] = MOCK_EQUIPMENT.filter(e => e.status !== EquipmentStatus.NORMAL).map((e, idx) => ({
  id: `tkt-${idx}`,
  equipmentId: e.id,
  equipmentName: e.name,
  issue: e.status === EquipmentStatus.OFFLINE ? '訊號中斷' : '數值異常警告',
  status: 'open',
  date: '2023-11-01'
}));

export const MOCK_MIXED_DATA = Array.from({ length: 12 }, (_, i) => ({
  time: `${i*2}:00`,
  load: Math.floor(Math.random() * 50) + 20,
  efficiency: Math.floor(Math.random() * 20) + 80
}));

// Mock System Specific KPIs
export const MOCK_SYSTEM_KPIS: Record<SystemType, { label: string, value: string, unit: string, trend?: number }[]> = {
  [SystemType.ELECTRICITY]: [
    { label: '總負載', value: '452.8', unit: 'kW', trend: 12 },
    { label: '平均電壓', value: '220.4', unit: 'V', trend: -1 },
    { label: '功率因數', value: '0.96', unit: '', trend: 0 },
    { label: '碳排放量', value: '1,204', unit: 'kg', trend: 8 },
  ],
  [SystemType.WATER]: [
    { label: '今日用水', value: '840.5', unit: 'L', trend: -5 },
    { label: '平均水壓', value: '4.2', unit: 'bar', trend: 0 },
    { label: '流速', value: '120', unit: 'L/m', trend: 2 },
  ],
  [SystemType.GAS]: [
    { label: '瓦斯存量', value: '78', unit: '0', trend: -2 },
    { label: '管線壓力', value: '145', unit: 'psi', trend: 0 },
    { label: '洩漏偵測', value: '0', unit: 'ppm', trend: 0 },
  ],
  [SystemType.HVAC]: [
    { label: '平均室溫', value: '24.5', unit: '°C', trend: 1 },
    { label: '冰水溫度', value: '7.2', unit: '°C', trend: -0.5 },
    { label: '運轉效率', value: '0.82', unit: 'kW/RT', trend: 3 },
  ],
  [SystemType.LIGHTING]: [
    { label: '開啟率', value: '85', unit: '%', trend: 10 },
    { label: '故障燈具', value: '3', unit: '盞', trend: 0 },
    { label: '節能成效', value: '12.5', unit: '%', trend: 5 },
  ],
};
