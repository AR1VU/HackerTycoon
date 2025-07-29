import React from 'react';
import { useState, useCallback } from 'react';
import Terminal from './components/Terminal';
import NetworkMap from './components/NetworkMap';
import ConnectionModal from './components/ConnectionModal';
import DownloadsPanel from './components/DownloadsPanel';
import ToolsPanel from './components/ToolsPanel';
import HackHistoryPanel from './components/HackHistoryPanel';
import ResetButton from './components/ResetButton';
import { NetworkNode } from './types/network';
import { DownloadedFile } from './types/filesystem';
import { HackingTool } from './types/tools';
import { generateNetworkGrid } from './utils/networkGenerator';
import { setCommandContext } from './utils/commandParser';
import { DEFAULT_TOOLS, unlockTool } from './utils/toolsManager';
import { saveGameState, loadGameState, resetGameState, hasExistingGameState } from './utils/storageManager';

function App() {
  // Initialize state from localStorage or defaults
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.networkNodes.length > 0 ? savedState.networkNodes : generateNetworkGrid();
    }
    return generateNetworkGrid();
  });
  
  const [playerPosition] = useState(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.playerPosition;
    }
    return { x: 5, y: 5 }; // Center of 10x10 grid
  });
  
  const [connectedNode, setConnectedNode] = useState<NetworkNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [downloads, setDownloads] = useState<DownloadedFile[]>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.downloads;
    }
    return [];
  });
  
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  
  const [tools, setTools] = useState<HackingTool[]>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.tools.length > 0 ? savedState.tools : DEFAULT_TOOLS;
    }
    return DEFAULT_TOOLS;
  });
  
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isHackHistoryOpen, setIsHackHistoryOpen] = useState(false);
  const [toolProgress, setToolProgress] = useState<{ progress: number; message: string } | null>(null);

  // Handle scanning - update node statuses

  // Update networkNodes dependency for handleScan
  const handleScanWithNodes = useCallback((scannedNodes: NetworkNode[]) => {
    // If scannedNodes is a complete array, use it directly
    // Otherwise, merge with existing nodes for scan updates
    if (scannedNodes.length === networkNodes.length) {
      // Complete node array update (from tool execution)
      setNetworkNodes(scannedNodes);
      saveGameState({ networkNodes: scannedNodes });
    } else {
      // Partial update for scan command
      setNetworkNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          const scannedNode = scannedNodes.find(s => s.id === node.id);
          return scannedNode ? { ...node, status: 'Scanned' as const } : node;
        });
        
        // Save to localStorage
        saveGameState({ networkNodes: updatedNodes });
        return updatedNodes;
      });
    }
  }, [networkNodes]);

  // Handle connection - show modal and update node status
  const handleConnect = useCallback((node: NetworkNode) => {
    setConnectedNode(node);
    setIsModalOpen(true);
    
    // Mark node as connected
    setNetworkNodes(prevNodes => {
      const updatedNodes = prevNodes.map(n => 
        n.id === node.id ? { ...n, status: 'Connected' as const } : n
      );
      
      // Save to localStorage
      saveGameState({ networkNodes: updatedNodes });
      return updatedNodes;
    });
  }, []);

  // Handle node click from map
  const handleNodeClick = useCallback((node: NetworkNode) => {
    handleConnect(node);
  }, [handleConnect]);

  // Handle file downloads
  const handleDownload = useCallback((file: DownloadedFile) => {
    setDownloads(prev => {
      const updatedDownloads = [...prev, file];
      // Save to localStorage
      saveGameState({ downloads: updatedDownloads });
      return updatedDownloads;
    });
  }, []);

  // Handle showing downloads panel
  const handleShowDownloads = useCallback(() => {
    setIsDownloadsOpen(true);
  }, []);

  // Handle showing tools panel
  const handleShowTools = useCallback(() => {
    setIsToolsOpen(true);
  }, []);

  // Handle showing hack history panel
  const handleShowHackHistory = useCallback(() => {
    setIsHackHistoryOpen(true);
  }, []);

  // Handle updating tools
  const handleUpdateTools = useCallback((updatedTools: HackingTool[]) => {
    setTools(updatedTools);
    // Save to localStorage
    saveGameState({ tools: updatedTools });
  }, []);

  // Handle tool progress updates
  const handleToolProgress = useCallback((progress: number, message: string) => {
    setToolProgress({ progress, message });
    
    // Clear progress after completion
    if (progress >= 100) {
      setTimeout(() => setToolProgress(null), 2000);
    }
  }, []);

  // Handle game reset
  const handleReset = useCallback(() => {
    resetGameState();
    
    // Reset all state to defaults
    const newNetworkNodes = generateNetworkGrid();
    setNetworkNodes(newNetworkNodes);
    setDownloads([]);
    setTools(DEFAULT_TOOLS);
    setConnectedNode(null);
    setIsModalOpen(false);
    setIsDownloadsOpen(false);
    setIsToolsOpen(false);
    setIsHackHistoryOpen(false);
    setToolProgress(null);
    
    // Save initial state
    saveGameState({
      networkNodes: newNetworkNodes,
      downloads: [],
      tools: DEFAULT_TOOLS,
      playerPosition: { x: 5, y: 5 }
    });
  }, []);

  // Set up command context for terminal
  React.useEffect(() => {
    setCommandContext({
      networkNodes,
      playerPosition,
      downloads,
      tools,
      onScan: handleScanWithNodes,
      onConnect: handleConnect,
      onShowDownloads: handleShowDownloads,
      onShowTools: handleShowTools,
      onShowHackHistory: handleShowHackHistory,
      onUpdateTools: handleUpdateTools,
      onToolProgress: handleToolProgress,
    });
  }, [networkNodes, playerPosition, downloads, tools, handleScanWithNodes, handleConnect, handleShowDownloads, handleShowTools, handleShowHackHistory, handleUpdateTools, handleToolProgress]);

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
              <Terminal toolProgress={toolProgress} />
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
      
      {/* Tools Panel */}
      <ToolsPanel
        tools={tools}
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
      />
      
      {/* Hack History Panel */}
      <HackHistoryPanel
        nodes={networkNodes}
        isOpen={isHackHistoryOpen}
        onClose={() => setIsHackHistoryOpen(false)}
      />
      
      {/* Reset Button */}
      <ResetButton onReset={handleReset} />
      
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export default App;