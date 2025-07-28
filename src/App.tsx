import React from 'react';
import { useState, useCallback } from 'react';
import Terminal from './components/Terminal';
import NetworkMap from './components/NetworkMap';
import ConnectionModal from './components/ConnectionModal';
import DownloadsPanel from './components/DownloadsPanel';
import { NetworkNode } from './types/network';
import { DownloadedFile } from './types/filesystem';
import { generateNetworkGrid } from './utils/networkGenerator';
import { setCommandContext } from './utils/commandParser';

function App() {
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>(() => generateNetworkGrid());
  const [playerPosition] = useState({ x: 5, y: 5 }); // Center of 10x10 grid
  const [connectedNode, setConnectedNode] = useState<NetworkNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloads, setDownloads] = useState<DownloadedFile[]>([]);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);

  // Handle scanning - update node statuses
  const handleScan = useCallback((scannedNodes: NetworkNode[]) => {
    setNetworkNodes(prevNodes => 
      prevNodes.map(node => {
        const scannedNode = scannedNodes.find(s => s.id === node.id);
        return scannedNode ? { ...node, status: 'Scanned' as const } : node;
      })
    );
  }, []);

  // Handle connection - show modal and update node status
  const handleConnect = useCallback((node: NetworkNode) => {
    setConnectedNode(node);
    setIsModalOpen(true);
    
    // Mark node as hacked
    setNetworkNodes(prevNodes =>
      prevNodes.map(n => 
        n.id === node.id ? { ...n, status: 'Hacked' as const } : n
      )
    );
  }, []);

  // Handle node click from map
  const handleNodeClick = useCallback((node: NetworkNode) => {
    handleConnect(node);
  }, [handleConnect]);

  // Handle file downloads
  const handleDownload = useCallback((file: DownloadedFile) => {
    setDownloads(prev => [...prev, file]);
  }, []);

  // Handle showing downloads panel
  const handleShowDownloads = useCallback(() => {
    setIsDownloadsOpen(true);
  }, []);

  // Set up command context for terminal
  React.useEffect(() => {
    setCommandContext({
      networkNodes,
      playerPosition,
      downloads,
      onScan: handleScan,
      onConnect: handleConnect,
      onShowDownloads: handleShowDownloads,
    });
  }, [networkNodes, playerPosition, downloads, handleScan, handleConnect, handleShowDownloads]);

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Main container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl h-[85vh] min-h-[700px] flex gap-4">
          {/* Terminal Panel */}
          <div className="flex-1 bg-black/90 backdrop-blur-sm border border-green-400/30 rounded-lg shadow-2xl shadow-green-500/10">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-xl"></div>
            
            {/* Terminal content */}
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Terminal />
            </div>
          </div>
          
          {/* Network Map Panel */}
          <div className="w-80 shadow-2xl shadow-green-500/10">
            <NetworkMap 
              nodes={networkNodes}
              onNodeClick={handleNodeClick}
              playerPosition={playerPosition}
            />
          </div>
        </div>
      </div>
      
      {/* Connection Modal */}
      <ConnectionModal
        node={connectedNode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownload={handleDownload}
      />
      
      {/* Downloads Panel */}
      <DownloadsPanel
        downloads={downloads}
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
      />
      
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export default App;