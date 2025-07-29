import { NetworkNode, HackAttempt } from '../types/network';
import { HackingTool } from '../types/tools';

export const addHackAttempt = (
  nodes: NetworkNode[],
  targetIp: string,
  tool: HackingTool,
  success: boolean,
  vulnerability: 'Low' | 'Medium' | 'High'
): NetworkNode[] => {
  return nodes.map(node => {
    if (node.ip === targetIp) {
      const hackAttempt: HackAttempt = {
        toolId: tool.id,
        toolName: tool.name,
        timestamp: new Date(),
        success,
        vulnerability
      };
      
      return {
        ...node,
        hackHistory: [...(node.hackHistory || []), hackAttempt]
      };
    }
    return node;
  });
};

export const getHackHistory = (node: NetworkNode): HackAttempt[] => {
  return node.hackHistory || [];
};

export const getSuccessfulHacks = (node: NetworkNode): HackAttempt[] => {
  return getHackHistory(node).filter(hack => hack.success);
};

export const getFailedHacks = (node: NetworkNode): HackAttempt[] => {
  return getHackHistory(node).filter(hack => !hack.success);
};

export const getHacksByTool = (node: NetworkNode, toolId: string): HackAttempt[] => {
  return getHackHistory(node).filter(hack => hack.toolId === toolId);
};

export const getTotalHackAttempts = (nodes: NetworkNode[]): number => {
  return nodes.reduce((total, node) => total + getHackHistory(node).length, 0);
};

export const getTotalSuccessfulHacks = (nodes: NetworkNode[]): number => {
  return nodes.reduce((total, node) => total + getSuccessfulHacks(node).length, 0);
};

export const getHackStatistics = (nodes: NetworkNode[]) => {
  const totalAttempts = getTotalHackAttempts(nodes);
  const totalSuccessful = getTotalSuccessfulHacks(nodes);
  const successRate = totalAttempts > 0 ? (totalSuccessful / totalAttempts) * 100 : 0;
  
  const toolStats: Record<string, { attempts: number; successes: number; successRate: number }> = {};
  
  nodes.forEach(node => {
    getHackHistory(node).forEach(hack => {
      if (!toolStats[hack.toolId]) {
        toolStats[hack.toolId] = { attempts: 0, successes: 0, successRate: 0 };
      }
      toolStats[hack.toolId].attempts++;
      if (hack.success) {
        toolStats[hack.toolId].successes++;
      }
    });
  });
  
  // Calculate success rates for each tool
  Object.keys(toolStats).forEach(toolId => {
    const stats = toolStats[toolId];
    stats.successRate = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
  });
  
  return {
    totalAttempts,
    totalSuccessful,
    successRate,
    toolStats
  };
};