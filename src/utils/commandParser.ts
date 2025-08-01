import { Command, CommandResult } from '../types/terminal';
import { NetworkNode } from '../types/network';
import { DownloadedFile } from '../types/filesystem';
import { HackingTool, ToolResult } from '../types/tools';
import { SkillTreeState, PlayerStats } from '../types/skills';
import { CryptoWallet, CryptoMarket } from '../types/crypto';
import { MissionState } from '../types/missions';
import { TraceState } from '../types/trace';
import { getNodesInRadius } from './networkGenerator';
import { 
  checkToolCooldown, 
  getRemainingCooldown, 
  simulateToolExecution,
  updateToolLastUsed 
} from './toolsManager';
import { 
  formatCurrency, 
  formatUSD, 
  calculateHackReward, 
  addTransaction 
} from '../utils/cryptoManager';
import { addHackAttempt } from './hackTracker';

interface CommandContext {
  networkNodes: NetworkNode[];
  playerPosition: { x: number; y: number };
  downloads: DownloadedFile[];
  tools: HackingTool[];
  skillTree: SkillTreeState;
  cryptoWallet: CryptoWallet;
  cryptoMarket: CryptoMarket;
  missionState: MissionState;
  playerStats: PlayerStats;
  playerInventory: any;
  traceState: TraceState;
  onScan: (scannedNodes: NetworkNode[]) => void;
  onConnect: (node: NetworkNode) => void;
  onShowDownloads: () => void;
  onShowTools: () => void;
  onShowHackHistory: () => void;
  onShowCryptoWallet: () => void;
  onShowMissions: () => void;
  onShowBlackMarket: () => void;
  onShowInventory: () => void;
  onUpdateTools: (tools: HackingTool[]) => void;
  onUpdateCryptoWallet: (wallet: CryptoWallet) => void;
  onToolProgress: (progress: number, message: string) => void;
  onShowSkillTree: () => void;
  onHackSuccess: () => void;
  onMissionProgress: (eventType: 'hack_success' | 'file_download' | 'tool_use' | 'crypto_earn', eventData: any) => void;
  onCompleteMission: (missionId: string) => void;
  onResetGame: () => void;
  onTraceUpdate: (action: string, details?: string) => void;
  onProxyCommand: (command: 'on' | 'off') => string;
  onDeleteLogs: (serverIp: string) => string;
}


let commandContext: CommandContext | null = null;

export const setCommandContext = (context: CommandContext) => {
  commandContext = context;
};

const getCommands = (): Record<string, Command> => ({
  help: {
    name: 'help',
    description: 'Display available commands',
    execute: () => [
      'Available commands:',
      '',
      '📋 SYSTEM COMMANDS:',
      '  help           - Display this help message',
      '  clear          - Clear the terminal screen',
      '  echo [text]    - Print text to the terminal',
      '  whoami         - Display current user information',
      '  date           - Display current date and time',
      '  system         - Display system information',
      '  trace          - Display current trace level and status',
      '',
      '🔍 NETWORK COMMANDS:',
      '  scan           - Scan nearby network nodes',
      '  connect [ip]   - Connect to a scanned network node',
      '',
      '⚔️  HACKING TOOLS:',
      '  bruteforce [ip]        - Brute force attack on target',
      '  ddos [ip]              - DDoS attack on target',
      '  inject [ip] [script]   - Code injection attack',
      '  bypass [ip] [firewall] - Bypass firewall protection',
      '',
      '🛡️  SECURITY COMMANDS:',
      '  proxy [on|off]         - Activate/deactivate proxy network',
      '  logs delete [ip]       - Delete logs from compromised server',
      '',
      '📊 INFORMATION PANELS:',
      '  downloads      - View downloaded files',
      '  tools          - View available hacking tools',
      '  history        - View hack history and statistics',
      '  skills         - View and manage skill tree',
      '',
      'Welcome to Hacker Tycoon v1.0',
      'Type commands to interact with the system.',
    ],
  },
  clear: {
    name: 'clear',
    description: 'Clear the terminal screen',
    execute: () => [],
  },
  echo: {
    name: 'echo',
    description: 'Print text to the terminal',
    execute: (args) => [args.join(' ') || ''],
  },
  whoami: {
    name: 'whoami',
    description: 'Display current user information',
    execute: () => ['hacker@tycoon-terminal'],
  },
  date: {
    name: 'date',
    description: 'Display current date and time',
    execute: () => [new Date().toString()],
  },
  system: {
    name: 'system',
    description: 'Display system information',
    execute: () => [
      'Hacker Tycoon Terminal v1.0',
      'OS: CyberLinux 3.14',
      'Kernel: 5.15.0-hacker',
      'Architecture: x86_64',
      'Memory: 16GB DDR4',
      'Status: CONNECTED',
    ],
  },
  trace: {
    name: 'trace',
    description: 'Display current trace level and status',
    execute: () => {
      if (!commandContext) {
        return ['Error: Trace system not initialized'];
      }
      
      const { traceState } = commandContext;
      
      const output = [
        '╔══════════════════════════════════════════════════════════════╗',
        '║                      TRACE STATUS                            ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        `Current Trace Level: ${traceState.level.toFixed(1)}%`,
        `Proxy Status: ${traceState.isProxyActive ? 'ACTIVE' : 'INACTIVE'}`,
        `Last Activity: ${new Date(traceState.lastActivity).toLocaleTimeString()}`,
        ''
      ];
      
      if (traceState.level < 30) {
        output.push('🟢 Status: SAFE - Low detection risk');
      } else if (traceState.level < 60) {
        output.push('🟡 Status: CAUTION - Moderate detection risk');
      } else if (traceState.level < 90) {
        output.push('🟠 Status: HIGH RISK - Authorities may be tracking');
      } else {
        output.push('🔴 Status: CRITICAL - Immediate danger of detection');
      }
      
      output.push('');
      output.push('💡 Use "proxy on" to reduce trace accumulation');
      output.push('💡 Use "logs delete [ip]" to reduce trace level');
      
      return output;
    },
  },
  proxy: {
    name: 'proxy',
    description: 'Activate or deactivate proxy network',
    execute: (args) => {
      if (!commandContext) {
        return ['Error: Proxy system not initialized'];
      }
      
      if (args.length === 0) {
        const { traceState } = commandContext;
        return [
          'Proxy Network Status:',
          `Status: ${traceState.isProxyActive ? 'ACTIVE' : 'INACTIVE'}`,
          `Cost: 50 ɄCoins per minute`,
          `Effect: Reduces trace accumulation by 60%`,
          '',
          'Usage: proxy [on|off]',
          'Example: proxy on'
        ];
      }
      
      const command = args[0].toLowerCase();
      if (command !== 'on' && command !== 'off') {
        return [
          'Invalid proxy command.',
          'Usage: proxy [on|off]',
          'Example: proxy on'
        ];
      }
      
      const { onProxyCommand } = commandContext;
      const result = onProxyCommand(command as 'on' | 'off');
      
      return [result];
    },
  },
  logs: {
    name: 'logs',
    description: 'Manage server logs',
    execute: (args) => {
      if (!commandContext) {
        return ['Error: Log management system not initialized'];
      }
      
      if (args.length < 2 || args[0] !== 'delete') {
        return [
          'Log Management Commands:',
          '',
          '  logs delete [ip]  - Delete logs from compromised server',
          '',
          'Deleting logs reduces your trace level but requires',
          'the target server to be compromised (bypassed or hacked).',
          '',
          'Example: logs delete 192.168.1.100'
        ];
      }
      
      const serverIp = args[1];
      const { networkNodes, onDeleteLogs } = commandContext;
      
      // Check if server exists and is compromised
      const targetNode = networkNodes.find(node => node.ip === serverIp);
      if (!targetNode) {
        return [`Error: Server ${serverIp} not found in network`];
      }
      
      if (targetNode.status !== 'Bypassed' && targetNode.status !== 'Hacked') {
        return [
          `Error: Cannot delete logs from ${serverIp}`,
          `Server status: ${targetNode.status}`,
          'Server must be bypassed or hacked to delete logs.'
        ];
      }
      
      const result = onDeleteLogs(serverIp);
      
      return [
        `Accessing ${serverIp}...`,
        'Locating system logs...',
        'Deleting access records...',
        'Clearing authentication logs...',
        'Removing trace evidence...',
        '',
        '✓ Log deletion successful',
        result,
        '',
        'Your digital footprint has been reduced.'
      ];
    },
  },
  scan: {
    name: 'scan',
    description: 'Scan nearby network nodes',
    execute: () => {
      if (!commandContext) {
        return ['Error: Network interface not initialized'];
      }
      
      const { networkNodes, playerPosition, playerStats, onScan } = commandContext;
      const scanRadius = playerStats.scanRadius || 2;
      const nearbyNodes = getNodesInRadius(networkNodes, playerPosition.x, playerPosition.y, scanRadius);
      
      if (nearbyNodes.length === 0) {
        return [
          'Network scan complete.',
          'No vulnerable nodes detected in range.',
          'Try moving to a different location.',
        ];
      }
      
      // Mark nodes as scanned
      const scannedNodes = nearbyNodes.map(node => ({ ...node, status: 'Scanned' as const }));
      onScan(scannedNodes);
      
      // Update trace level
      const { onTraceUpdate } = commandContext;
      onTraceUpdate('scan', `Network scan (${nearbyNodes.length} nodes)`);
      
      const results = [
        'Network scan initiated...',
        `Scanning radius: ${scanRadius} nodes`,
        '',
        `Found ${nearbyNodes.length} vulnerable node(s):`,
        '',
      ];
      
      nearbyNodes.forEach(node => {
        const riskColor = node.vulnerability === 'High' ? '[HIGH RISK]' : 
                         node.vulnerability === 'Medium' ? '[MEDIUM RISK]' : '[LOW RISK]';
        results.push(`  ${node.ip} - ${riskColor}`);
      });
      
      results.push('');
      results.push('Use "connect [ip]" to establish connection.');
      
      return results;
    },
  },
  connect: {
    name: 'connect',
    description: 'Connect to a scanned network node',
    execute: (args) => {
      if (!commandContext) {
        return ['Error: Network interface not initialized'];
      }
      
      if (args.length === 0) {
        return ['Usage: connect [ip]', 'Example: connect 192.168.1.100'];
      }
      
      const targetIp = args[0];
      const { networkNodes, onConnect } = commandContext;
      const targetNode = networkNodes.find(node => node.ip === targetIp);
      
      if (!targetNode) {
        return [`Error: IP address ${targetIp} not found in network.`];
      }
      
      if (targetNode.status !== 'Bruteforced' && targetNode.status !== 'Connected') {
        return [
          `Error: Cannot connect to ${targetIp}`,
          `Current status: ${targetNode.status}`,
          'Node must be bruteforced first. Use "bruteforce [ip]" command.'
        ];
      }
      
      if (targetNode.isPlayerLocation) {
        return ['Error: Cannot connect to your own location.'];
      }
      
      if (targetNode.isTemporarilyDown && targetNode.downUntil && Date.now() < targetNode.downUntil) {
        const remainingTime = Math.ceil((targetNode.downUntil - Date.now()) / 1000);
        return [
          `Error: Server ${targetIp} is temporarily down`,
          `Time remaining: ${remainingTime} seconds`,
          'Server was disabled by DDoS attack'
        ];
      }
      
      // Trigger connection
      onConnect(targetNode);
      
      // Update trace level
      const { onTraceUpdate } = commandContext;
      onTraceUpdate('connect', `Connection to ${targetIp}`);
      
      return [
        `Initiating connection to ${targetIp}...`,
        'Establishing secure tunnel...',
        `Successfully connected to ${targetIp}`,
        'Use "bypass" to access file system for downloads',
        '',
        'Connection details displayed in popup window.',
      ];
    },
  },
  downloads: {
    name: 'downloads',
    description: 'View downloaded files',
    execute: () => {
      if (!commandContext) {
        return ['Error: Downloads system not initialized'];
      }
      
      const { downloads, onShowDownloads } = commandContext;
      onShowDownloads();
      
      return [
        `Opening downloads panel...`,
        `Total files: ${downloads.length}`,
        downloads.length === 0 ? 'No files downloaded yet.' : 'Downloads panel opened.',
      ];
    },
  },
  tools: {
    name: 'tools',
    description: 'View available hacking tools',
    execute: () => {
      if (!commandContext) {
        return ['Error: Tools system not initialized'];
      }
      
      const { tools, onShowTools } = commandContext;
      onShowTools();
      
      const unlockedTools = tools.filter(tool => tool.unlocked);
      
      return [
        `Opening tools panel...`,
        `Unlocked tools: ${unlockedTools.length}/${tools.length}`,
        'Tools panel opened.',
      ];
    },
  },
  history: {
    name: 'history',
    description: 'View hack history and statistics',
    execute: () => {
      if (!commandContext) {
        return ['Error: History system not initialized'];
      }
      
      const { onShowHackHistory } = commandContext;
      onShowHackHistory();
      
      return [
        'Opening hack history panel...',
        'View all your previous hack attempts and success rates.',
      ];
    },
  },
  skills: {
    name: 'skills',
    description: 'View and manage skill tree',
    execute: () => {
      if (!commandContext) {
        return ['Error: Skills system not initialized'];
      }
      
      const { skillTree, onShowSkillTree } = commandContext;
      onShowSkillTree();
      
      const purchased = skillTree.nodes.filter(s => s.purchased).length;
      const available = skillTree.nodes.filter(s => s.unlocked && !s.purchased).length;
      
      return [
        'Opening skill tree panel...',
        `Skill Points: ${skillTree.skillPoints}`,
        `Skills Purchased: ${purchased}/${skillTree.nodes.length}`,
        `Skills Available: ${available}`,
        'Skill tree panel opened.',
      ];
    },
  },
  bruteforce: {
    name: 'bruteforce',
    description: 'Brute force attack on target system',
    execute: (args) => executeHackingTool('bruteforce', args),
  },
  ddos: {
    name: 'ddos',
    description: 'DDoS attack on target system',
    execute: (args) => executeHackingTool('ddos', args),
  },
  inject: {
    name: 'inject',
    description: 'Code injection attack on target system',
    execute: (args) => executeHackingTool('inject', args),
  },
  bypass: {
    name: 'bypass',
    description: 'Bypass firewall protection',
    execute: (args) => executeHackingTool('bypass', args),
  },
});

const executeHackingTool = (toolId: string, args: string[]): string[] => {
  if (!commandContext) {
    return ['Error: Tools system not initialized'];
  }
  
  const { tools, networkNodes, playerStats, cryptoWallet, onUpdateTools, onUpdateCryptoWallet, onToolProgress, onScan, onHackSuccess, onMissionProgress } = commandContext;
  
  // Find the tool
  const tool = tools.find(t => t.id === toolId);
  if (!tool) {
    return [`Error: Tool ${toolId} not found`];
  }
  
  // Check if tool is unlocked
  if (!tool.unlocked) {
    return [
      `Error: Tool "${tool.name}" is locked`,
      'Complete more hacks to unlock advanced tools',
      'Use "tools" command to view available tools'
    ];
  }
  
  // Check cooldown
  if (!checkToolCooldown(tool)) {
    const remaining = getRemainingCooldown(tool);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    
    return [
      `Error: Tool "${tool.name}" is on cooldown`,
      `Time remaining: ${timeStr}`,
      'Wait before using this tool again'
    ];
  }
  
  // Validate arguments
  if (args.length === 0) {
    return [
      `Usage: ${toolId} [ip] ${toolId === 'inject' ? '[script]' : toolId === 'bypass' ? '[firewall]' : ''}`,
      'Example: ' + getToolExample(toolId)
    ];
  }
  
  const targetIp = args[0];
  const targetNode = networkNodes.find(node => node.ip === targetIp);
  
  if (!targetNode) {
    return [`Error: IP address ${targetIp} not found in network`];
  }
  
  // Check prerequisites for each tool
  if (toolId === 'bruteforce') {
    if (targetNode.status !== 'Scanned') {
      return [
        `Error: Cannot bruteforce ${targetIp}`,
        'Node must be scanned first. Use "scan" command.'
      ];
    }
  } else if (toolId === 'ddos') {
    if (targetNode.status === 'Hidden') {
      return [
        `Error: Cannot DDoS ${targetIp}`,
        'Node must be scanned first. Use "scan" command.'
      ];
    }
  } else if (toolId === 'bypass') {
    if (targetNode.status !== 'Connected') {
      return [
        `Error: Cannot bypass ${targetIp}`,
        'Must be connected to target first. Use "connect [ip]" command.'
      ];
    }
  } else if (toolId === 'inject') {
    if (targetNode.status !== 'Bypassed') {
      return [
        `Error: Cannot inject into ${targetIp}`,
        'Must bypass firewall first. Use "bypass [ip]" command.'
      ];
    }
  }
  
  if (targetNode.isTemporarilyDown && targetNode.downUntil && Date.now() < targetNode.downUntil && toolId !== 'ddos') {
    const remainingTime = Math.ceil((targetNode.downUntil - Date.now()) / 1000);
    return [
      `Error: Server ${targetIp} is temporarily down`,
      `Time remaining: ${remainingTime} seconds`,
      'Server was disabled by DDoS attack'
    ];
  }
  
  if (targetNode.isPlayerLocation) {
    return ['Error: Cannot target your own location'];
  }
  
  // Update tool last used time
  const updatedTools = updateToolLastUsed(toolId, tools);
  onUpdateTools(updatedTools);
  
  // Update trace level
  const { onTraceUpdate } = commandContext;
  onTraceUpdate(toolId, `${tool.name} attack on ${targetIp}`);
  
  // Start tool execution
  const additionalArgs = args.slice(1);
  
  // Execute tool asynchronously with progress updates
  setTimeout(async () => {
    try {
      const result = await simulateToolExecution(tool, targetNode, additionalArgs, onToolProgress);
      
      // Update nodes with hack attempt and status changes
      let updatedNodes = [...networkNodes];
      
      // Add hack attempt to history
      updatedNodes = addHackAttempt(updatedNodes, targetIp, tool, result.success, targetNode.vulnerability);
      
      // Update node status based on successful tool execution
      if (result.success) {
        // Award skill points for successful hack
        onHackSuccess();
        
        // Award ɄCoins for successful hack
        const reward = calculateHackReward(targetNode.vulnerability, toolId);
        const updatedWallet = addTransaction(
          cryptoWallet,
          'earned',
          reward,
          `Successful ${tool.name} on ${targetIp} (${targetNode.vulnerability} risk)`
        );
        onUpdateCryptoWallet(updatedWallet);
        
        // Update mission progress
        onMissionProgress('hack_success', { 
          vulnerability: targetNode.vulnerability,
          toolId: toolId
        });
        onMissionProgress('tool_use', { toolId: toolId });
        onMissionProgress('crypto_earn', { amount: reward });
        
        updatedNodes = updatedNodes.map(node => {
          if (node.id === targetNode.id) {
            if (toolId === 'bruteforce') {
              return { ...node, status: 'Bruteforced' as const };
            } else if (toolId === 'ddos') {
              return { 
                ...node, 
                isTemporarilyDown: true, 
                downUntil: Date.now() + 30000 // 30 seconds
              };
            } else if (toolId === 'bypass') {
              return { ...node, status: 'Bypassed' as const };
            } else if (toolId === 'inject') {
              return { 
                ...node, 
                status: 'Hacked' as const,
                isTemporarilyDown: true,
                downUntil: Date.now() + 60000 // 1 minute shutdown
              };
            }
          }
          return node;
        });
      }
      
      // Use onScan to update the nodes and save to localStorage
      onScan(updatedNodes);
    } catch (error) {
      console.error('Tool execution error:', error);
    }
  }, 100);
  
  return [
    `Initiating ${tool.name} attack on ${targetIp}...`,
    `Target vulnerability: ${targetNode.vulnerability}`,
    'Executing attack sequence...',
    '',
    'Progress will be displayed below:'
  ];
};

const getToolExample = (toolId: string): string => {
  switch (toolId) {
    case 'bruteforce': return 'bruteforce 192.168.1.100';
    case 'ddos': return 'ddos 192.168.1.100';
    case 'inject': return 'inject 192.168.1.100 malware.js';
    case 'bypass': return 'bypass 192.168.1.100 corporate_firewall';
    default: return `${toolId} 192.168.1.100`;
  }
};

export const parseCommand = (input: string): CommandResult => {
  // Check if game is over due to trace
  if (commandContext && commandContext.traceState.gameOver) {
    return {
      command: input,
      output: [
        '🚨 SYSTEM LOCKED DOWN 🚨',
        '',
        'Your location has been compromised.',
        'All network access has been terminated.',
        'Use the reset button to start a new operation.'
      ],
      timestamp: new Date(),
    };
  }
  
  const trimmedInput = input.trim();
  const [commandName, ...args] = trimmedInput.split(' ');
  
  if (!commandName) {
    return {
      command: input,
      output: [''],
      timestamp: new Date(),
    };
  }

  const commands = getCommands();
  const command = commands[commandName.toLowerCase()];
  
  if (!command) {
    return {
      command: input,
      output: [`Command not found: ${commandName}`, 'Type "help" for available commands.'],
      timestamp: new Date(),
    };
  }

  // Special handling for clear command
  if (commandName.toLowerCase() === 'clear') {
    return {
      command: input,
      output: ['CLEAR'],
      timestamp: new Date(),
    };
  }

  return {
    command: input,
    output: command.execute(args),
    timestamp: new Date(),
  };
};

export const getAvailableCommands = (): Command[] => {
  return Object.values(getCommands());
};