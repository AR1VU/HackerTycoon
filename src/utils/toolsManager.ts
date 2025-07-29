import { HackingTool, ToolResult } from '../types/tools';
import { NetworkNode } from '../types/network';

export const DEFAULT_TOOLS: HackingTool[] = [
  {
    id: 'bruteforce',
    name: 'Brute Force',
    description: 'Attempts to crack login credentials through systematic password attempts',
    command: 'bruteforce',
    unlocked: true,
    cooldown: 30,
    lastUsed: 0,
    successRate: {
      low: 0.8,
      medium: 0.6,
      high: 0.3
    }
  },
  {
    id: 'ddos',
    name: 'DDoS Attack',
    description: 'Overwhelms target server with traffic, temporarily disabling it',
    command: 'ddos',
    unlocked: true,
    cooldown: 60,
    lastUsed: 0,
    successRate: {
      low: 0.9,
      medium: 0.7,
      high: 0.4
    }
  },
  {
    id: 'inject',
    name: 'Code Injection',
    description: 'Injects malicious payloads into target system files',
    command: 'inject',
    unlocked: true,
    cooldown: 45,
    lastUsed: 0,
    successRate: {
      low: 0.7,
      medium: 0.5,
      high: 0.2
    }
  },
  {
    id: 'bypass',
    name: 'Firewall Bypass',
    description: 'Advanced tool for circumventing high-security firewalls',
    command: 'bypass',
    unlocked: true,
    cooldown: 90,
    lastUsed: 0,
    successRate: {
      low: 0.95,
      medium: 0.8,
      high: 0.6
    }
  }
];

export const checkToolCooldown = (tool: HackingTool): boolean => {
  const now = Date.now();
  const timeSinceLastUse = (now - tool.lastUsed) / 1000;
  return timeSinceLastUse >= tool.cooldown;
};

export const getRemainingCooldown = (tool: HackingTool): number => {
  const now = Date.now();
  const timeSinceLastUse = (now - tool.lastUsed) / 1000;
  return Math.max(0, tool.cooldown - timeSinceLastUse);
};

export const getSuccessRate = (tool: HackingTool, vulnerability: 'Low' | 'Medium' | 'High'): number => {
  switch (vulnerability) {
    case 'Low': return tool.successRate.low;
    case 'Medium': return tool.successRate.medium;
    case 'High': return tool.successRate.high;
    default: return 0.5;
  }
};

export const simulateToolExecution = async (
  tool: HackingTool,
  target: NetworkNode,
  args: string[] = [],
  onProgress?: (progress: number, message: string) => void
): Promise<ToolResult> => {
  const successRate = getSuccessRate(tool, target.vulnerability);
  const isSuccess = Math.random() < successRate;
  
  // Simulate progress for different tools
  if (onProgress) {
    const steps = getToolSteps(tool.id);
    for (let i = 0; i < steps.length; i++) {
      const progress = ((i + 1) / steps.length) * 100;
      onProgress(progress, steps[i]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return generateToolResult(tool, target, args, isSuccess);
};

const getToolSteps = (toolId: string): string[] => {
  switch (toolId) {
    case 'bruteforce':
      return [
        'Initializing brute force attack...',
        'Loading password dictionary...',
        'Testing common passwords...',
        'Attempting credential combinations...',
        'Finalizing attack...'
      ];
    case 'ddos':
      return [
        'Setting up botnet...',
        'Coordinating attack vectors...',
        'Flooding target with requests...',
        'Monitoring server response...'
      ];
    case 'inject':
      return [
        'Analyzing target vulnerabilities...',
        'Crafting payload...',
        'Injecting malicious code...',
        'Verifying injection success...'
      ];
    case 'bypass':
      return [
        'Scanning firewall configuration...',
        'Identifying bypass vectors...',
        'Executing advanced techniques...',
        'Establishing secure tunnel...'
      ];
    default:
      return ['Executing tool...'];
  }
};

const generateToolResult = (
  tool: HackingTool,
  target: NetworkNode,
  args: string[],
  success: boolean
): ToolResult => {
  const baseOutput = [];
  
  switch (tool.id) {
    case 'bruteforce':
      if (success) {
        baseOutput.push(
          `✓ Brute force attack successful on ${target.ip}`,
          `Credentials discovered: admin / ${generateRandomPassword()}`,
          'Login credentials obtained',
          'Use "connect [ip]" to establish connection'
        );
      } else {
        baseOutput.push(
          `✗ Brute force attack failed on ${target.ip}`,
          'Password dictionary exhausted',
          'Account lockout detected',
          'Consider using advanced tools for high-security targets'
        );
      }
      break;
      
    case 'ddos':
      if (success) {
        baseOutput.push(
          `✓ DDoS attack successful on ${target.ip}`,
          'Server overwhelmed with traffic',
          'Target system temporarily disabled',
          'Server will be down for 30 seconds'
        );
      } else {
        baseOutput.push(
          `✗ DDoS attack failed on ${target.ip}`,
          'Target has DDoS protection enabled',
          'Traffic filtered by upstream providers',
          'Server remains operational'
        );
      }
      break;
      
    case 'inject':
      const script = args[0] || 'default_payload.js';
      if (success) {
        baseOutput.push(
          `✓ Code injection successful on ${target.ip}`,
          `Payload "${script}" injected into system files`,
          'Malicious code executed successfully',
          'Server shutting down... (60 seconds)',
          'Target system compromised'
        );
      } else {
        baseOutput.push(
          `✗ Code injection failed on ${target.ip}`,
          `Payload "${script}" was detected and blocked`,
          'Input validation prevented injection',
          'System integrity maintained'
        );
      }
      break;
      
    case 'bypass':
      const firewall = args[0] || 'default_firewall';
      if (success) {
        baseOutput.push(
          `✓ Firewall bypass successful on ${target.ip}`,
          `Circumvented security measures`,
          'File system access enabled',
          'You can now download files from this server'
        );
      } else {
        baseOutput.push(
          `✗ Firewall bypass failed on ${target.ip}`,
          'Security measures too advanced',
          'Intrusion detection system activated',
          'Connection blocked and logged'
        );
      }
      break;
      
    default:
      baseOutput.push(success ? 'Tool executed successfully' : 'Tool execution failed');
  }
  
  return {
    success,
    output: baseOutput,
    toolUsed: tool.id,
    target: target.ip
  };
};

const generateRandomPassword = (): string => {
  const passwords = [
    'password123',
    'admin2023',
    'qwerty456',
    'letmein',
    'welcome1',
    'secret789'
  ];
  return passwords[Math.floor(Math.random() * passwords.length)];
};

export const unlockTool = (toolId: string, tools: HackingTool[]): HackingTool[] => {
  return tools.map(tool => 
    tool.id === toolId ? { ...tool, unlocked: true } : tool
  );
};

export const updateToolLastUsed = (toolId: string, tools: HackingTool[]): HackingTool[] => {
  return tools.map(tool => 
    tool.id === toolId ? { ...tool, lastUsed: Date.now() } : tool
  );
};