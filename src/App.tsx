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
import { SkillNode, SkillTreeState } from './types/skills';
import { CryptoWallet, CryptoMarket } from './types/crypto';
import { MissionState } from './types/missions';
import { BlackMarketState, PlayerInventory } from './types/inventory';
import { generateNetworkGrid } from './utils/networkGenerator';
import { setCommandContext } from './utils/commandParser';
import { DEFAULT_TOOLS, unlockTool } from './utils/toolsManager';
import { DEFAULT_SKILL_TREE, getDefaultPlayerStats, calculatePlayerStats, awardSkillPoints } from './utils/skillTree';
import { createInitialWallet, createInitialMarket, startMarketUpdates } from './utils/cryptoManager';
import { createInitialMissionState, acceptMission, updateMissionProgress, checkExpiredMissions, completeMission } from './utils/missionManager';
import { createInitialBlackMarket, createInitialInventory, purchaseItem, getItemEffects } from './utils/blackMarket';
import { saveGameState, loadGameState, resetGameState, hasExistingGameState } from './utils/storageManager';
import SkillTreePanel from './components/SkillTreePanel';
import CryptoWalletPanel from './components/CryptoWalletPanel';
import MissionsPanel from './components/MissionsPanel';
import BlackMarketPanel from './components/BlackMarketPanel';
import InventoryPanel from './components/InventoryPanel';
function App() {
  // Initialize state from localStorage or defaults
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.networkNodes?.length > 0 ? savedState.networkNodes : generateNetworkGrid();
    }
    return generateNetworkGrid();
  });
  
  const [playerPosition] = useState(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.playerPosition || { x: 5, y: 5 };
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
      return savedState.tools?.length > 0 ? savedState.tools : DEFAULT_TOOLS;
    }
    return DEFAULT_TOOLS;
  });
  
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isHackHistoryOpen, setIsHackHistoryOpen] = useState(false);
  const [toolProgress, setToolProgress] = useState<{ progress: number; message: string } | null>(null);
  
  const [skillTree, setSkillTree] = useState<SkillTreeState>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return {
        nodes: savedState.skillTree?.nodes || DEFAULT_SKILL_TREE,
        skillPoints: savedState.skillTree?.skillPoints || 0,
        totalPointsEarned: savedState.skillTree?.totalPointsEarned || 0
      };
    }
    return {
      nodes: DEFAULT_SKILL_TREE,
      skillPoints: 0,
      totalPointsEarned: 0
    };
  });
  
  const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState(() => {
    const baseStats = getDefaultPlayerStats();
    const skillBonuses = calculatePlayerStats(skillTree.nodes);
    return { ...baseStats, ...skillBonuses };
  });
  
  const [cryptoWallet, setCryptoWallet] = useState<CryptoWallet>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.cryptoWallet || createInitialWallet();
    }
    return createInitialWallet();
  });
  
  const [cryptoMarket, setCryptoMarket] = useState<CryptoMarket>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.cryptoMarket || createInitialMarket();
    }
    return createInitialMarket();
  });
  
  const [isCryptoWalletOpen, setIsCryptoWalletOpen] = useState(false);
  
  const [missionState, setMissionState] = useState<MissionState>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.missionState || createInitialMissionState();
    }
    return createInitialMissionState();
  });
  
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  
  const [blackMarket, setBlackMarket] = useState<BlackMarketState>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.blackMarket || createInitialBlackMarket();
    }
    return createInitialBlackMarket();
  });
  
  const [playerInventory, setPlayerInventory] = useState<PlayerInventory>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.playerInventory || createInitialInventory();
    }
    return createInitialInventory();
  });
  
  const [isBlackMarketOpen, setIsBlackMarketOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

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

  // Handle mission progress updates
  const handleMissionProgress = useCallback((
    eventType: 'hack_success' | 'file_download' | 'tool_use' | 'crypto_earn',
    eventData: any
  ) => {
    const updatedMissionState = updateMissionProgress(missionState, eventType, eventData);
    if (updatedMissionState !== missionState) {
      setMissionState(updatedMissionState);
      // Save to localStorage
      saveGameState({ missionState: updatedMissionState });
    }
  }, [missionState]);

  // Handle file downloads
  const handleDownload = useCallback((file: DownloadedFile) => {
    setDownloads(prev => {
      const updatedDownloads = [...prev, file];
      // Save to localStorage
      saveGameState({ downloads: updatedDownloads });
      
      // Update mission progress for file downloads
      handleMissionProgress('file_download', { fileName: file.name });
      
      return updatedDownloads;
    });
  }, [handleMissionProgress]);

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
  
  // Handle showing skill tree panel
  const handleShowSkillTree = useCallback(() => {
    setIsSkillTreeOpen(true);
  }, []);
  
  // Handle showing crypto wallet panel
  const handleShowCryptoWallet = useCallback(() => {
    setIsCryptoWalletOpen(true);
  }, []);
  
  // Handle showing missions panel
  const handleShowMissions = useCallback(() => {
    setIsMissionsOpen(true);
  }, []);
  
  // Handle showing black market panel
  const handleShowBlackMarket = useCallback(() => {
    setIsBlackMarketOpen(true);
  }, []);
  
  // Handle showing inventory panel
  const handleShowInventory = useCallback(() => {
    setIsInventoryOpen(true);
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
  
  // Handle skill tree updates
  const handleUpdateSkillTree = useCallback((updatedNodes: SkillNode[], remainingPoints: number) => {
    const newSkillTree = {
      nodes: updatedNodes,
      skillPoints: remainingPoints,
      totalPointsEarned: skillTree.totalPointsEarned
    };
    
    setSkillTree(newSkillTree);
    
    // Update player stats based on purchased skills
    const baseStats = getDefaultPlayerStats();
    const skillBonuses = calculatePlayerStats(updatedNodes);
    setPlayerStats({ ...baseStats, ...skillBonuses });
    
    // Save to localStorage
    saveGameState({ skillTree: newSkillTree });
  }, [skillTree.totalPointsEarned]);
  
  // Handle successful hack completion (award skill points)
  const handleHackSuccess = useCallback(() => {
    const newSkillPoints = awardSkillPoints(skillTree.skillPoints, playerStats.hacksCompleted + 1);
    const newSkillTree = {
      ...skillTree,
      skillPoints: newSkillPoints,
      totalPointsEarned: skillTree.totalPointsEarned + (newSkillPoints - skillTree.skillPoints)
    };
    
    setSkillTree(newSkillTree);
    setPlayerStats(prev => ({ ...prev, hacksCompleted: prev.hacksCompleted + 1 }));
    
    // Save to localStorage
    saveGameState({ skillTree: newSkillTree });
  }, [skillTree, playerStats.hacksCompleted]);
  
  // Handle crypto wallet updates
  const handleUpdateCryptoWallet = useCallback((newWallet: CryptoWallet) => {
    setCryptoWallet(newWallet);
    // Save to localStorage
    saveGameState({ cryptoWallet: newWallet });
  }, []);
  
  // Handle crypto market updates
  const handleUpdateCryptoMarket = useCallback((newMarket: CryptoMarket) => {
    setCryptoMarket(newMarket);
    // Save to localStorage
    saveGameState({ cryptoMarket: newMarket });
  }, []);
  
  // Handle mission acceptance
  const handleAcceptMission = useCallback((missionId: string) => {
    const newMissionState = acceptMission(missionId, missionState);
    setMissionState(newMissionState);
    // Save to localStorage
    saveGameState({ missionState: newMissionState });
  }, [missionState]);
  
  // Handle mission completion
  const handleCompleteMission = useCallback((missionId: string) => {
    const result = completeMission(missionId, missionState);
    if (result.success && result.mission) {
      setMissionState(result.updatedMissionState);
      
      // Award ɄCoins and skill points
      const updatedWallet = addTransaction(
        cryptoWallet,
        'earned',
        result.mission.reward,
        `Mission completed: ${result.mission.name}`
      );
      setCryptoWallet(updatedWallet);
      
      const newSkillPoints = skillTree.skillPoints + result.mission.skillPointReward;
      const newSkillTree = {
        ...skillTree,
        skillPoints: newSkillPoints,
        totalPointsEarned: skillTree.totalPointsEarned + result.mission.skillPointReward
      };
      setSkillTree(newSkillTree);
      
      // Save to localStorage
      saveGameState({ 
        missionState: result.updatedMissionState,
        cryptoWallet: updatedWallet,
        skillTree: newSkillTree
      });
    }
  }, [missionState, cryptoWallet, skillTree]);
  
  // Handle black market purchases
  const handlePurchaseItem = useCallback((itemId: string) => {
    const result = purchaseItem(itemId, blackMarket.items, playerInventory, cryptoWallet.balance);
    
    if (result.success) {
      // Update black market
      setBlackMarket(prev => ({
        ...prev,
        items: result.updatedMarket
      }));
      
      // Update inventory
      setPlayerInventory(result.updatedInventory);
      
      // Deduct ɄCoins
      const item = blackMarket.items.find(i => i.id === itemId);
      if (item) {
        const updatedWallet = addTransaction(
          cryptoWallet,
          'spent',
          item.price,
          `Purchased: ${item.name}`
        );
        setCryptoWallet(updatedWallet);
        
        // Save to localStorage
        saveGameState({ 
          blackMarket: { ...blackMarket, items: result.updatedMarket },
          playerInventory: result.updatedInventory,
          cryptoWallet: updatedWallet
        });
      }
    }
  }, [blackMarket, playerInventory, cryptoWallet]);

  // Handle game reset
  const handleReset = useCallback(() => {
    resetGameState();
    
    // Reset all state to defaults
    const newNetworkNodes = generateNetworkGrid();
    const newSkillTree = {
      nodes: DEFAULT_SKILL_TREE,
      skillPoints: 0,
      totalPointsEarned: 0
    };
    const newCryptoWallet = createInitialWallet();
    const newCryptoMarket = createInitialMarket();
    const newMissionState = createInitialMissionState();
    const newBlackMarket = createInitialBlackMarket();
    const newPlayerInventory = createInitialInventory();
    
    setNetworkNodes(newNetworkNodes);
    setDownloads([]);
    setTools(DEFAULT_TOOLS);
    setSkillTree(newSkillTree);
    setCryptoWallet(newCryptoWallet);
    setCryptoMarket(newCryptoMarket);
    setMissionState(newMissionState);
    setPlayerStats(getDefaultPlayerStats());
    setBlackMarket(newBlackMarket);
    setPlayerInventory(newPlayerInventory);
    setConnectedNode(null);
    setIsModalOpen(false);
    setIsDownloadsOpen(false);
    setIsToolsOpen(false);
    setIsHackHistoryOpen(false);
    setIsSkillTreeOpen(false);
    setIsCryptoWalletOpen(false);
    setIsMissionsOpen(false);
    setToolProgress(null);
    setIsBlackMarketOpen(false);
    setIsInventoryOpen(false);
    
    // Save initial state
    saveGameState({
      networkNodes: newNetworkNodes,
      downloads: [],
      tools: DEFAULT_TOOLS,
      skillTree: newSkillTree,
      cryptoWallet: newCryptoWallet,
      cryptoMarket: newCryptoMarket,
      missionState: newMissionState,
      blackMarket: newBlackMarket,
      playerInventory: newPlayerInventory,
      playerPosition: { x: 5, y: 5 }
    });
  }, []);

  // Set up command context for terminal
  React.useEffect(() => {
    const inventoryEffects = getItemEffects(playerInventory);
    setCommandContext({
      networkNodes,
      playerPosition,
      downloads,
      tools,
      skillTree,
      cryptoWallet,
      cryptoMarket,
      playerStats,
      onScan: handleScanWithNodes,
      playerInventory,
      onConnect: handleConnect,
      onShowDownloads: handleShowDownloads,
      onShowTools: handleShowTools,
      onShowHackHistory: handleShowHackHistory,
      onShowSkillTree: handleShowSkillTree,
      onShowCryptoWallet: handleShowCryptoWallet,
      onShowMissions: handleShowMissions,
      onShowBlackMarket: handleShowBlackMarket,
      onShowInventory: handleShowInventory,
      onUpdateTools: handleUpdateTools,
      onUpdateCryptoWallet: handleUpdateCryptoWallet,
      onToolProgress: handleToolProgress,
      onHackSuccess: handleHackSuccess,
      onMissionProgress: handleMissionProgress,
      onCompleteMission: handleCompleteMission,
      onResetGame: handleReset,
    });
  }, [networkNodes, playerPosition, downloads, tools, skillTree, cryptoWallet, cryptoMarket, playerStats, missionState, playerInventory, handleScanWithNodes, handleConnect, handleShowDownloads, handleShowTools, handleShowHackHistory, handleShowSkillTree, handleShowCryptoWallet, handleShowMissions, handleShowBlackMarket, handleShowInventory, handleUpdateTools, handleUpdateCryptoWallet, handleToolProgress, handleHackSuccess, handleMissionProgress, handleCompleteMission, handleReset]);
  
  // Start market updates
  React.useEffect(() => {
    const stopMarketUpdates = startMarketUpdates(handleUpdateCryptoMarket, cryptoMarket);
    return stopMarketUpdates;
  }, [handleUpdateCryptoMarket, cryptoMarket]);
  
  // Check for expired missions periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      const updatedMissionState = checkExpiredMissions(missionState);
      if (updatedMissionState !== missionState) {
        setMissionState(updatedMissionState);
        saveGameState({ missionState: updatedMissionState });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [missionState]);

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
      
      {/* Skill Tree Panel */}
      <SkillTreePanel
        skillTree={skillTree}
        isOpen={isSkillTreeOpen}
        onClose={() => setIsSkillTreeOpen(false)}
        onUpdateSkillTree={handleUpdateSkillTree}
      />
      
      {/* Crypto Wallet Panel */}
      <CryptoWalletPanel
        wallet={cryptoWallet}
        market={cryptoMarket}
        isOpen={isCryptoWalletOpen}
        onClose={() => setIsCryptoWalletOpen(false)}
      />
      
      {/* Missions Panel */}
      <MissionsPanel
        missionState={missionState}
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        onAcceptMission={handleAcceptMission}
      />
      
      {/* Black Market Panel */}
      <BlackMarketPanel
        blackMarket={blackMarket}
        playerInventory={playerInventory}
        cryptoWallet={cryptoWallet}
        isOpen={isBlackMarketOpen}
        onClose={() => setIsBlackMarketOpen(false)}
        onPurchaseItem={handlePurchaseItem}
      />
      
      {/* Inventory Panel */}
      <InventoryPanel
        inventory={playerInventory}
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
      
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export default App;