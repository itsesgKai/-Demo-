
export enum SystemType {
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  GAS = 'GAS',
  HVAC = 'HVAC',
  LIGHTING = 'LIGHTING'
}

export enum EquipmentStatus {
  NORMAL = 'NORMAL',
  OFFLINE = 'OFFLINE',
  ABNORMAL = 'ABNORMAL',
  MAINTENANCE = 'MAINTENANCE'
}

export enum AlertLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  DANGER = 'DANGER'
}

export interface MetricDefinition {
  id: string;
  label: string;
  value: number;
  unit: string;
  type: 'numeric' | 'progress' | 'gauge';
  thresholds?: {
    warning: number;
    danger: number;
  };
  trend?: number; // percentage change
}

export interface Equipment {
  id: string;
  name: string;
  system: SystemType;
  path: string[]; // [Campus, Building, Floor, Area]
  status: EquipmentStatus;
  isRunning: boolean;
  metrics: MetricDefinition[];
  lastMaintenance: string;
  nextMaintenance: string;
  pendingTickets: number;
  hasCCTV: boolean;
  location?: { x: number; y: number }; // Percentage coordinates (0-100)
}

export interface SpaceNode {
  id: string;
  name: string;
  type: 'campus' | 'building' | 'floor' | 'area';
  children?: SpaceNode[];
}

export interface Ticket {
  id: string;
  equipmentId: string;
  equipmentName: string;
  issue: string;
  status: 'open' | 'in-progress' | 'closed';
  date: string;
}
