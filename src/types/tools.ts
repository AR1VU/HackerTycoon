export interface HackingTool {
  id: string;
  name: string;
  description: string;
  command: string;
  unlocked: boolean;
  cooldown: number; // in seconds
  lastUsed: number; // timestamp
  successRate: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface ToolsState {
  tools: HackingTool[];
  unlockedCount: number;
}

export interface ToolResult {
  success: boolean;
  output: string[];
  toolUsed: string;
  target?: string;
}