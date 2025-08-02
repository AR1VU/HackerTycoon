import React from 'react';
import Terminal from '../components/Terminal';
import NetworkMap from '../components/NetworkMap';
import ConnectionModal from '../components/ConnectionModal';
import { NetworkNode } from '../types/network';
import { DownloadedFile } from '../types/filesystem';

interface TerminalPageProps {
  networkNodes: NetworkNode[];
  playerPosition: { x: number; y: number };
  connectedNode: NetworkNode | null;
  isModalOpen: boolean;
  toolProgress: { progress: number; message: string } | null;
  onNodeClick: (node: NetworkNode) => void;
  onCloseModal: () => void;
  onDownload: (file: DownloadedFile) => void;
}

const TerminalPage: React.FC<TerminalPageProps> = ({
  networkNodes,
  playerPosition,
  connectedNode,
  isModalOpen,
  toolProgress,
  onNodeClick,
  onCloseModal,
  onDownload
}) => {
  return (
    <div className="flex gap-4 h-full">
      {/* Terminal Panel */}
      <div className="flex-1 bg-black/90 backdrop-blur-sm border border-green-400/30 rounded-lg shadow-2xl shadow-green-500/10">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-xl"></div>
        
        {/* Terminal content */}
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Terminal toolProgress={toolProgress} />
        </div>
      </div>
      
      {/* Network Map Panel */}
      <div className="w-80 shadow-2xl shadow-green-500/10">
        <NetworkMap 
          nodes={networkNodes}
          onNodeClick={onNodeClick}
          playerPosition={playerPosition}
        />
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        node={connectedNode}
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onDownload={onDownload}
      />
    </div>
  );
};

export default TerminalPage;