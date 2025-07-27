import { NetworkNode } from '../types/network';

export const generateNetworkGrid = (width: number = 10, height: number = 10): NetworkNode[] => {
  const nodes: NetworkNode[] = [];
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Generate random IP in 192.168.x.y format
      const ipX = Math.floor(Math.random() * 255) + 1;
      const ipY = Math.floor(Math.random() * 255) + 1;
      const ip = `192.168.${ipX}.${ipY}`;
      
      // Random vulnerability level
      const vulnerabilities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
      const vulnerability = vulnerabilities[Math.floor(Math.random() * vulnerabilities.length)];
      
      nodes.push({
        id: `${x}-${y}`,
        ip,
        x,
        y,
        vulnerability,
        status: 'Hidden',
      });
    }
  }
  
  // Set player starting position (center of grid)
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const playerNode = nodes.find(node => node.x === centerX && node.y === centerY);
  if (playerNode) {
    playerNode.isPlayerLocation = true;
    playerNode.status = 'Scanned';
  }
  
  return nodes;
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const getNodesInRadius = (nodes: NetworkNode[], centerX: number, centerY: number, radius: number): NetworkNode[] => {
  return nodes.filter(node => {
    const distance = getDistance(centerX, centerY, node.x, node.y);
    return distance <= radius && !node.isPlayerLocation;
  });
};