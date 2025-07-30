import { NetworkNode } from '../types/network';
import { HackingTool } from '../types/tools';
import { DownloadedFile } from '../types/filesystem';
import { SkillTreeState } from '../types/skills';

const STORAGE_KEYS = {
  NETWORK_NODES: 'hackerTycoon_networkNodes',
  TOOLS: 'hackerTycoon_tools',
  DOWNLOADS: 'hackerTycoon_downloads',
  PLAYER_POSITION: 'hackerTycoon_playerPosition',
  GAME_STATE: 'hackerTycoon_gameState'
};

export interface GameState {
  networkNodes: NetworkNode[];
  tools: HackingTool[];
  downloads: DownloadedFile[];
  playerPosition: { x: number; y: number };
  skillTree?: SkillTreeState;
  lastSaved: Date;
}

export const saveGameState = (gameState: Partial<GameState>): void => {
  try {
    const currentState = loadGameState();
    const updatedState: GameState = {
      ...currentState,
      ...gameState,
      lastSaved: new Date()
    };
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(updatedState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const loadGameState = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      if (parsed.lastSaved) {
        parsed.lastSaved = new Date(parsed.lastSaved);
      }
      if (parsed.downloads) {
        parsed.downloads = parsed.downloads.map((download: any) => ({
          ...download,
          downloadedAt: new Date(download.downloadedAt)
        }));
      }
      if (parsed.networkNodes) {
        parsed.networkNodes = parsed.networkNodes.map((node: any) => ({
          ...node,
          hackHistory: node.hackHistory?.map((hack: any) => ({
            ...hack,
            timestamp: new Date(hack.timestamp)
          })) || []
        }));
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  
  return {
    networkNodes: [],
    tools: [],
    downloads: [],
    playerPosition: { x: 5, y: 5 },
    lastSaved: new Date()
  };
};

export const resetGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    // Also clear individual keys for backward compatibility
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to reset game state:', error);
  }
};

export const hasExistingGameState = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return saved !== null;
  } catch (error) {
    return false;
  }
};

export const exportGameState = (): string => {
  const gameState = loadGameState();
  return JSON.stringify(gameState, null, 2);
};

export const importGameState = (jsonString: string): boolean => {
  try {
    const gameState = JSON.parse(jsonString);
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, jsonString);
    return true;
  } catch (error) {
    console.error('Failed to import game state:', error);
    return false;
  }
};