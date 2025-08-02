import { TraceState, TraceEvent, ProxyConfig } from '../types/trace';
import { CryptoWallet } from '../types/crypto';
import { addTransaction } from './cryptoManager';

const PROXY_CONFIG: ProxyConfig = {
  costPerMinute: 50, // 50 ɄCoins per minute
  traceReductionMultiplier: 0.4 // 60% slower trace increase
};

const TRACE_DECAY_RATE = 0.5; // Points per minute when idle
const IDLE_THRESHOLD = 60000; // 1 minute in milliseconds
const MAX_TRACE_LEVEL = 100;

export const createInitialTraceState = (): TraceState => ({
  level: 0,
  isProxyActive: false,
  proxyStartTime: null,
  lastActivity: Date.now(),
  gameOver: false,
  events: []
});

export const addTraceLevel = (
  currentTrace: TraceState,
  amount: number,
  reason: string
): TraceState => {
  if (currentTrace.gameOver) return currentTrace;

  const multiplier = currentTrace.isProxyActive ? PROXY_CONFIG.traceReductionMultiplier : 1;
  const actualIncrease = amount * multiplier;
  const newLevel = Math.min(currentTrace.level + actualIncrease, MAX_TRACE_LEVEL);
  
  const event: TraceEvent = {
    id: generateEventId(),
    message: `${reason} (+${actualIncrease.toFixed(1)} trace)`,
    timestamp: new Date(),
    severity: getSeverityFromIncrease(actualIncrease)
  };

  const updatedState: TraceState = {
    ...currentTrace,
    level: newLevel,
    lastActivity: Date.now(),
    events: [event, ...currentTrace.events].slice(0, 20), // Keep last 20 events
    gameOver: newLevel >= MAX_TRACE_LEVEL
  };

  // Add critical event if game over
  if (newLevel >= MAX_TRACE_LEVEL && !currentTrace.gameOver) {
    const gameOverEvent: TraceEvent = {
      id: generateEventId(),
      message: 'TRACE COMPLETE - LOCATION COMPROMISED!',
      timestamp: new Date(),
      severity: 'critical'
    };
    updatedState.events = [gameOverEvent, ...updatedState.events];
  }

  return updatedState;
};

export const activateProxy = (
  currentTrace: TraceState,
  wallet: CryptoWallet
): { success: boolean; updatedTrace: TraceState; updatedWallet: CryptoWallet; message: string } => {
  if (currentTrace.isProxyActive) {
    return {
      success: false,
      updatedTrace: currentTrace,
      updatedWallet: wallet,
      message: 'Proxy is already active'
    };
  }

  if (wallet.balance < PROXY_CONFIG.costPerMinute) {
    return {
      success: false,
      updatedTrace: currentTrace,
      updatedWallet: wallet,
      message: 'Insufficient funds for proxy activation'
    };
  }

  const updatedWallet = addTransaction(
    wallet,
    'spent',
    PROXY_CONFIG.costPerMinute,
    'Proxy network activation'
  );

  const event: TraceEvent = {
    id: generateEventId(),
    message: 'Proxy network activated - trace rate reduced',
    timestamp: new Date(),
    severity: 'low'
  };

  const updatedTrace: TraceState = {
    ...currentTrace,
    isProxyActive: true,
    proxyStartTime: Date.now(),
    events: [event, ...currentTrace.events]
  };

  return {
    success: true,
    updatedTrace,
    updatedWallet,
    message: 'Proxy network activated successfully'
  };
};

export const deactivateProxy = (currentTrace: TraceState): TraceState => {
  if (!currentTrace.isProxyActive) return currentTrace;

  const event: TraceEvent = {
    id: generateEventId(),
    message: 'Proxy network deactivated',
    timestamp: new Date(),
    severity: 'medium'
  };

  return {
    ...currentTrace,
    isProxyActive: false,
    proxyStartTime: null,
    events: [event, ...currentTrace.events]
  };
};

export const deleteServerLogs = (
  currentTrace: TraceState,
  serverIp: string
): TraceState => {
  const traceReduction = Math.min(15, currentTrace.level); // Reduce by up to 15 points
  const newLevel = Math.max(0, currentTrace.level - traceReduction);

  const event: TraceEvent = {
    id: generateEventId(),
    message: `Logs deleted from ${serverIp} (-${traceReduction.toFixed(1)} trace)`,
    timestamp: new Date(),
    severity: 'low'
  };

  return {
    ...currentTrace,
    level: newLevel,
    lastActivity: Date.now(),
    events: [event, ...currentTrace.events]
  };
};

export const updateTraceDecay = (
  currentTrace: TraceState,
  wallet: CryptoWallet
): { updatedTrace: TraceState; updatedWallet: CryptoWallet } => {
  if (currentTrace.gameOver) {
    return { updatedTrace: currentTrace, updatedWallet: wallet };
  }

  const now = Date.now();
  const timeSinceActivity = now - currentTrace.lastActivity;
  let updatedTrace = { ...currentTrace };
  let updatedWallet = wallet;

  // Handle proxy costs
  if (currentTrace.isProxyActive && currentTrace.proxyStartTime) {
    const proxyDuration = now - currentTrace.proxyStartTime;
    const minutesActive = proxyDuration / 60000;
    const costAccrued = minutesActive * PROXY_CONFIG.costPerMinute;

    if (wallet.balance < costAccrued) {
      // Deactivate proxy if can't afford it
      updatedTrace = deactivateProxy(updatedTrace);
      const event: TraceEvent = {
        id: generateEventId(),
        message: 'Proxy deactivated - insufficient funds',
        timestamp: new Date(),
        severity: 'medium'
      };
      updatedTrace.events = [event, ...updatedTrace.events];
    }
  }

  // Handle trace decay when idle
  if (timeSinceActivity >= IDLE_THRESHOLD && currentTrace.level > 0) {
    const minutesIdle = timeSinceActivity / 60000;
    const decayAmount = minutesIdle * TRACE_DECAY_RATE;
    const newLevel = Math.max(0, currentTrace.level - decayAmount);

    if (newLevel < currentTrace.level) {
      updatedTrace = {
        ...updatedTrace,
        level: newLevel
      };
    }
  }

  return { updatedTrace, updatedWallet };
};

export const resetTrace = (): TraceState => createInitialTraceState();

export const getTraceStatus = (level: number): {
  status: string;
  color: string;
  severity: 'safe' | 'caution' | 'danger' | 'critical';
} => {
  if (level >= 90) return { status: 'CRITICAL', color: 'text-red-500', severity: 'critical' };
  if (level >= 70) return { status: 'HIGH RISK', color: 'text-red-400', severity: 'danger' };
  if (level >= 40) return { status: 'MODERATE', color: 'text-yellow-400', severity: 'caution' };
  return { status: 'SAFE', color: 'text-green-400', severity: 'safe' };
};

export const getTraceIncreaseForAction = (action: string): number => {
  switch (action) {
    case 'bruteforce': return 8;
    case 'ddos': return 12;
    case 'inject': return 15;
    case 'bypass': return 6;
    case 'scan': return 2;
    case 'connect': return 3;
    default: return 5;
  }
};

const generateEventId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

const getSeverityFromIncrease = (increase: number): TraceEvent['severity'] => {
  if (increase >= 15) return 'critical';
  if (increase >= 10) return 'high';
  if (increase >= 5) return 'medium';
  return 'low';
};

export const formatTraceLevel = (level: number): string => {
  return `${level.toFixed(1)}%`;
};