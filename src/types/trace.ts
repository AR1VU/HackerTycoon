export interface TraceState {
  level: number; // 0-100
  isProxyActive: boolean;
  proxyStartTime: number | null;
  lastActivity: number;
  gameOver: boolean;
  events: TraceEvent[];
}

export interface TraceEvent {
  id: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProxyConfig {
  costPerMinute: number;
  traceReductionMultiplier: number; // 0.5 = 50% slower trace increase
}