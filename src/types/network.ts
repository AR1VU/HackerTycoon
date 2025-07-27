export interface NetworkNode {
  id: string;
  ip: string;
  x: number;
  y: number;
  vulnerability: 'Low' | 'Medium' | 'High';
  status: 'Hidden' | 'Scanned' | 'Hacked';
  isPlayerLocation?: boolean;
}

export interface NetworkState {
  nodes: NetworkNode[];
  playerPosition: { x: number; y: number };
  connectedNode: NetworkNode | null;
  scanRadius: number;
}