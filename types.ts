
export enum Decision {
  APPROVE = 'APPROVE',
  BLOCK = 'BLOCK',
  MANUAL_REVIEW = 'MANUAL_REVIEW'
}

export enum RiskFlag {
  IMPOSSIBLE_TRAVEL = 'IMPOSSIBLE_TRAVEL',
  VELOCITY_SPIKE = 'VELOCITY_SPIKE',
  NEW_DEVICE = 'NEW_DEVICE',
  HIGH_VALUE = 'HIGH_VALUE',
  RISKY_GEO = 'RISKY_GEO',
  PATTERN_MISMATCH = 'PATTERN_MISMATCH'
}

export enum LogSeverity {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: string;
  severity: LogSeverity;
  message: string;
  metadata?: any;
}

export interface Strategy {
  name: string;
  version: string;
  mlWeight: number;
  ruleWeight: number;
  description: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  userId: string;
  amount: number;
  currency: string;
  merchant: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  device: {
    id: string;
    type: string;
    os: string;
    ip: string;
  };
}

export interface RiskAnalysis {
  transactionId: string;
  score: number; // 0 to 100
  decision: Decision;
  flags: RiskFlag[];
  ruleOutput: number;
  mlOutput: number;
  processingTimeMs: number;
  isFallback: boolean;
  timestamp: number;
  strategyName: string;
}

export interface UserHistory {
  userId: string;
  lastLocation: { lat: number; lng: number; timestamp: number };
  lastDeviceIds: string[];
  avgTransactionValue: number;
  recentTransactionCount: number;
}

export interface SystemMetrics {
  throughput: number; // tx/sec
  avgLatency: number;
  p99Latency: number;
  fraudRate: number;
  modelDrift: number;
}
