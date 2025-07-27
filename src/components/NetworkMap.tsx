import React, { useState } from 'react';
import { NetworkNode } from '../types/network';

interface NetworkMapProps {
  nodes: NetworkNode[];
  onNodeClick: (node: NetworkNode) => void;
  playerPosition: { x: number; y: number };
}

const NetworkMap: React.FC<NetworkMapProps> = ({ nodes, onNodeClick, playerPosition }) => {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  
  const getNodeColor = (node: NetworkNode): string => {
    if (node.isPlayerLocation) return 'bg-cyan-400';
    
    switch (node.status) {
      case 'Hidden':
        return 'bg-gray-700';
      case 'Scanned':
        switch (node.vulnerability) {
          case 'Low': return 'bg-green-500';
          case 'Medium': return 'bg-yellow-500';
          case 'High': return 'bg-red-500';
          default: return 'bg-green-500';
        }
      case 'Hacked':
        return 'bg-purple-500';
      default:
        return 'bg-gray-700';
    }
  };
  
  const getNodeBorder = (node: NetworkNode): string => {
    if (node.isPlayerLocation) return 'border-cyan-300 border-2';
    if (node.status === 'Scanned') return 'border-green-300 border';
    if (node.status === 'Hacked') return 'border-purple-300 border';
    return 'border-gray-600 border';
  };
  
  const handleNodeClick = (node: NetworkNode) => {
    if (node.status === 'Scanned' && !node.isPlayerLocation) {
      onNodeClick(node);
    }
  };
  
  const handleNodeHover = (node: NetworkNode) => {
    if (node.status !== 'Hidden') {
      setHoveredNode(node);
    }
  };

  return (
    <div className="bg-black/90 border border-green-400/30 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-green-400 font-mono text-lg font-bold">Network Map</h2>
        <div className="text-green-300 text-sm">
          Position: ({playerPosition.x}, {playerPosition.y})
        </div>
      </div>
      
      {/* Legend */}
      <div className="mb-4 text-xs text-green-300 space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cyan-400 border border-cyan-300"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-700 border border-gray-600"></div>
          <span>Unknown</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 border border-green-300"></div>
          <span>Low Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 border border-green-300"></div>
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 border border-green-300"></div>
          <span>High Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 border border-purple-300"></div>
          <span>Compromised</span>
        </div>
      </div>
      
      {/* Grid */}
      <div className="relative">
        <div className="grid grid-cols-10 gap-1 w-fit mx-auto">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`
                w-6 h-6 ${getNodeColor(node)} ${getNodeBorder(node)}
                cursor-pointer transition-all duration-200 hover:scale-110
                ${node.status === 'Scanned' && !node.isPlayerLocation ? 'hover:shadow-lg hover:shadow-green-500/50' : ''}
                ${node.isPlayerLocation ? 'animate-pulse' : ''}
              `}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeHover(node)}
              onMouseLeave={() => setHoveredNode(null)}
              title={node.status !== 'Hidden' ? `${node.ip} (${node.vulnerability})` : 'Unknown'}
            />
          ))}
        </div>
        
        {/* Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black border border-green-400 rounded px-2 py-1 text-green-400 text-xs whitespace-nowrap z-10">
            <div>{hoveredNode.ip}</div>
            <div className="text-green-300">Risk: {hoveredNode.vulnerability}</div>
            <div className="text-green-300">Status: {hoveredNode.status}</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-green-300 text-center">
        Use 'scan' to discover nearby nodes • Click scanned nodes to connect
      </div>
    </div>
  );
};

export default NetworkMap;