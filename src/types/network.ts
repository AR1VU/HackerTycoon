export interface NetworkNode {
  id: string;
  ip: string;
  x: number;
  y: number;
  vulnerability: 'Low' | 'Medium' | 'High';
  status: 'Hidden' | 'Scanned' | 'Bruteforced' | 'Connected' | 'Bypassed' | 'Hacked';
  isPlayerLocation?: boolean;
  isTemporarilyDown?: boolean;
  downUntil?: number;
  hackHistory?: HackAttempt[];
}

export interface HackAttempt {
  toolId: string;
  toolName: string;
  timestamp: Date;
  success: boolean;
  vulnerability: 'Low' | 'Medium' | 'High';
}

export interface NetworkState {
  nodes: NetworkNode[];
  playerPosition: { x: number; y: number };
  connectedNode: NetworkNode | null;
  scanRadius: number;
}