import React from 'react';
import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import TerminalPage from './pages/TerminalPage';
import MissionsPage from './pages/MissionsPage';
import WalletPage from './pages/WalletPage';
import DarkWebPage from './pages/DarkWebPage';
import ToolsPanel from './components/ToolsPanel';
import DownloadsPanel from './components/DownloadsPanel';
import HackHistoryPanel from './components/HackHistoryPanel';
import SkillTreePanel from './components/SkillTreePanel';
import InventoryPanel from './components/InventoryPanel';
import TraceIndicator from './components/TraceIndicator';
import GameOverModal from './components/GameOverModal';
import ResetButton from './components/ResetButton';
import { NetworkNode } from './types/network';
import { DownloadedFile } from './types/filesystem';
import { HackingTool } from './types/tools';
import { SkillNode, SkillTreeState } from './types/skills';
import { CryptoWallet, CryptoMarket } from './types/crypto';
import { MissionState } from './types/missions';
import { BlackMarketState, PlayerInventory } from './types/inventory';
import { TraceState } from './types/trace';
import { ReputationState } from './types/reputation';
import { generateNetworkGrid } from './utils/networkGenerator';
import { setCommandContext } from './utils/commandParser';
import { DEFAULT_TOOLS, unlockTool } from './utils/toolsManager';
import { DEFAULT_SKILL_TREE, getDefaultPlayerStats, calculatePlayerStats, awardSkillPoints } from './utils/skillTree';
import { createInitialWallet, createInitialMarket, startMarketUpdates } from './utils/cryptoManager';
import { createInitialMissionState, acceptMission, updateMissionProgress, checkExpiredMissions, completeMission } from './utils/missionManager';
import { createInitialBlackMarket, createInitialInventory, purchaseItem, getItemEffects } from './utils/blackMarket';
import { saveGameState, loadGameState, resetGameState, hasExistingGameState } from './utils/storageManager';
import ReputationPanel from './components/ReputationPanel';
import { 
  createInitialTraceState, 
  addTraceLevel, 
  activateProxy, 
  deactivateProxy, 
  deleteServerLogs, 
  updateTraceDecay, 
  resetTrace,
  getTraceIncreaseForAction 
} from './utils/traceManager';
import { 
  createInitialReputationState, 
  updateReputation, 
  applyGameOverPenalties, 
  triggerRandomEvent,
  getMarketPriceModifier,
  checkJailTime 
} from './utils/reputationManager';

function App() {
  const [currentPage, setCurrentPage] = useState('terminal');
  
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

  const [traceState, setTraceState] = useState<TraceState>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.traceState || createInitialTraceState();
    }
    return createInitialTraceState();
  });

  const [reputationState, setReputationState] = useState<ReputationState>(() => {
    if (hasExistingGameState()) {
      const savedState = loadGameState();
      return savedState.reputationState || createInitialReputationState();
    }
    return createInitialReputationState();
  });

  const [isReputationOpen, setIsReputationOpen] = useState(false);

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
  
  // Handle showing reputation panel
  const handleShowReputation = useCallback(() => {
    setIsReputationOpen(true);
  }, []);
  
  // Handle reputation updates
  const handleReputationUpdate = useCallback((
    change: number, 
    reason: string, 
    severity: 'minor' | 'moderate' | 'major' | 'critical' = 'moderate'
  ) => {
    const updatedReputation = updateReputation(reputationState, change, reason, severity);
    setReputationState(updatedReputation);
    saveGameState({ reputationState: updatedReputation });
  }, [reputationState]);

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
    // Check if game is over due to trace
    if (traceState.gameOver) return;
    
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
  }, [skillTree, playerStats.hacksCompleted, traceState.gameOver]);
  
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
    const priceModifier = getMarketPriceModifier(reputationState);
    const result = purchaseItem(itemId, blackMarket.items, playerInventory, cryptoWallet.balance, priceModifier);
    
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
        const adjustedPrice = Math.floor(item.price * priceModifier);
        const updatedWallet = addTransaction(
          cryptoWallet,
          'spent',
          adjustedPrice,
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
  }, [blackMarket, playerInventory, cryptoWallet, reputationState]);

  // Handle game reset
  const handleReset = useCallback(() => {
    // Reset trace state
    const newTraceState = resetTrace();
    const newReputationState = createInitialReputationState();
    
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
    
    setTraceState(newTraceState);
    setNetworkNodes(newNetworkNodes);
    setReputationState(newReputationState);
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
    setIsReputationOpen(false);
    
    // Save initial state
    saveGameState({
      traceState: newTraceState,
      reputationState: newReputationState,
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

  // Handle trace updates
  const handleTraceUpdate = useCallback((action: string, details?: string) => {
    if (traceState.gameOver) return;
    
    const increase = getTraceIncreaseForAction(action);
    const reason = details || `${action.charAt(0).toUpperCase() + action.slice(1)} operation`;
    
    const updatedTrace = addTraceLevel(traceState, increase, reason, reputationState);
    setTraceState(updatedTrace);
    
    // Save to localStorage
    saveGameState({ traceState: updatedTrace });
  }, [traceState, reputationState]);

  // Handle proxy commands
  const handleProxyCommand = useCallback((command: 'on' | 'off') => {
    if (command === 'on') {
      const result = activateProxy(traceState, cryptoWallet);
      if (result.success) {
        setTraceState(result.updatedTrace);
        setCryptoWallet(result.updatedWallet);
        saveGameState({ 
          traceState: result.updatedTrace,
          cryptoWallet: result.updatedWallet 
        });
      }
      return result.message;
    } else {
      const updatedTrace = deactivateProxy(traceState);
      setTraceState(updatedTrace);
      saveGameState({ traceState: updatedTrace });
      return 'Proxy network deactivated';
    }
  }, [traceState, cryptoWallet]);

  // Handle log deletion
  const handleDeleteLogs = useCallback((serverIp: string) => {
    const updatedTrace = deleteServerLogs(traceState, serverIp);
    setTraceState(updatedTrace);
    saveGameState({ traceState: updatedTrace });
    return `Logs deleted from ${serverIp}`;
  }, [traceState]);

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
      onTraceUpdate: handleTraceUpdate,
      onProxyCommand: handleProxyCommand,
      onDeleteLogs: handleDeleteLogs,
      traceState,
      reputationState,
      onReputationUpdate: handleReputationUpdate,
      onShowReputation: handleShowReputation,
    });
  }, [networkNodes, playerPosition, downloads, tools, skillTree, cryptoWallet, cryptoMarket, playerStats, missionState, playerInventory, traceState, reputationState, handleScanWithNodes, handleConnect, handleShowDownloads, handleShowTools, handleShowHackHistory, handleShowSkillTree, handleShowCryptoWallet, handleShowMissions, handleShowBlackMarket, handleShowInventory, handleUpdateTools, handleUpdateCryptoWallet, handleToolProgress, handleHackSuccess, handleMissionProgress, handleCompleteMission, handleReset, handleTraceUpdate, handleProxyCommand, handleDeleteLogs, handleReputationUpdate, handleShowReputation]);
  
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

  // Handle trace decay and proxy costs
  React.useEffect(() => {
    const interval = setInterval(() => {
      const { updatedTrace, updatedWallet } = updateTraceDecay(traceState, cryptoWallet);
      
      if (updatedTrace !== traceState) {
        setTraceState(updatedTrace);
        saveGameState({ traceState: updatedTrace });
      }
      
      if (updatedWallet !== cryptoWallet) {
        setCryptoWallet(updatedWallet);
        saveGameState({ cryptoWallet: updatedWallet });
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [traceState, cryptoWallet]);

  // Handle game over penalties and random events
  React.useEffect(() => {
    if (traceState.gameOver && !checkJailTime(reputationState)) {
      // Apply game over penalties
      const penalties = applyGameOverPenalties(reputationState, cryptoWallet, tools);
      
      setReputationState(penalties.updatedReputation);
      setCryptoWallet(penalties.updatedWallet);
      setTools(penalties.updatedTools);
      
      // Save updated state
      saveGameState({
        reputationState: penalties.updatedReputation,
        cryptoWallet: penalties.updatedWallet,
        tools: penalties.updatedTools
      });
    }
  }, [traceState.gameOver, reputationState, cryptoWallet, tools]);

  // Trigger random events periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!traceState.gameOver && !checkJailTime(reputationState)) {
        const eventResult = triggerRandomEvent(reputationState, cryptoWallet);
        
        if (eventResult.event) {
          setReputationState(eventResult.updatedReputation);
          setCryptoWallet(eventResult.updatedWallet);
          
          // Display event message in terminal (you could add a notification system here)
          console.log('Random Event:', eventResult.message);
          
          saveGameState({
            reputationState: eventResult.updatedReputation,
            cryptoWallet: eventResult.updatedWallet
          });
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [reputationState, cryptoWallet, traceState.gameOver]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'terminal':
        return (
          <TerminalPage
            networkNodes={networkNodes}
            playerPosition={playerPosition}
            connectedNode={connectedNode}
            isModalOpen={isModalOpen}
            toolProgress={toolProgress}
            onNodeClick={handleNodeClick}
            onCloseModal={() => setIsModalOpen(false)}
            onDownload={handleDownload}
          />
        );
      case 'missions':
        return (
          <MissionsPage
            missionState={missionState}
            onAcceptMission={handleAcceptMission}
          />
        );
      case 'wallet':
        return (
          <WalletPage
            wallet={cryptoWallet}
            market={cryptoMarket}
          />
        );
      case 'darkweb':
        return (
          <DarkWebPage
            blackMarket={blackMarket}
            playerInventory={playerInventory}
            cryptoWallet={cryptoWallet}
            onPurchaseItem={handlePurchaseItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Navigation */}
      <Navbar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        reputationState={reputationState}
      />
      
      {/* Main container */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Page Content */}
        <div className="flex-1 p-4">
          <div className="w-full max-w-7xl mx-auto h-[calc(100vh-160px)] min-h-[600px]">
            {renderCurrentPage()}
          </div>
        </div>
        
        {/* Trace Indicator at bottom */}
        <div className="p-4 border-t border-green-400/30 bg-black/50">
          <div className="max-w-7xl mx-auto">
            <TraceIndicator traceState={traceState} />
          </div>
        </div>
      </div>
      
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
      
      {/* Inventory Panel */}
      <InventoryPanel
        inventory={playerInventory}
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
      
      {/* Reputation Panel */}
      <ReputationPanel
        reputationState={reputationState}
        isOpen={isReputationOpen}
        onClose={() => setIsReputationOpen(false)}
      />
      
      {/* Game Over Modal */}
      <GameOverModal
        isOpen={traceState.gameOver}
        onReset={handleReset}
      />
      
      {/* Reset Button */}
      <ResetButton onReset={handleReset} />
      
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

// Helper function for addTransaction import
import { addTransaction } from './utils/cryptoManager';

export default App;