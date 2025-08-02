import { CommandResult } from '../types/terminal';
import { NetworkNode } from '../types/network';
import { DownloadedFile } from '../types/filesystem';
import { HackingTool } from '../types/tools';
import { SkillTreeState } from '../types/skills';
import { CryptoWallet, CryptoMarket } from '../types/crypto';
import { PlayerInventory } from '../types/inventory';
import { TraceState } from '../types/trace';
import { ReputationState } from '../types/reputation';
import { getNodesInRadius } from './networkGenerator';
import { simulateToolExecution, checkToolCooldown, updateToolLastUsed } from './toolsManager';
import { addHackAttempt } from './hackTracker';
import { calculateHackReward, addTransaction } from './cryptoManager';
import { getItemEffects } from './blackMarket';

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
}

export interface CommandContext {
  currentDirectory: string;
  environment: Record<string, string>;
  history: string[];
}

// Extended command context for hacking game
interface GameCommandContext extends CommandContext {
  networkNodes?: NetworkNode[];
  playerPosition?: { x: number; y: number };
  downloads?: DownloadedFile[];
  tools?: HackingTool[];
  skillTree?: SkillTreeState;
  cryptoWallet?: CryptoWallet;
  cryptoMarket?: CryptoMarket;
  playerStats?: any;
  playerInventory?: PlayerInventory;
  traceState?: TraceState;
  reputationState?: ReputationState;
  onScan?: (nodes: NetworkNode[]) => void;
  onConnect?: (node: NetworkNode) => void;
  onShowDownloads?: () => void;
  onShowTools?: () => void;
  onShowHackHistory?: () => void;
  onShowSkillTree?: () => void;
  onShowCryptoWallet?: () => void;
  onShowMissions?: () => void;
  onShowBlackMarket?: () => void;
  onShowInventory?: () => void;
  onShowReputation?: () => void;
  onUpdateTools?: (tools: HackingTool[]) => void;
  onUpdateCryptoWallet?: (wallet: CryptoWallet) => void;
  onToolProgress?: (progress: number, message: string) => void;
  onHackSuccess?: () => void;
  onMissionProgress?: (eventType: string, eventData: any) => void;
  onCompleteMission?: (missionId: string) => void;
  onResetGame?: () => void;
  onTraceUpdate?: (action: string, details?: string) => void;
  onProxyCommand?: (command: 'on' | 'off') => string;
  onDeleteLogs?: (serverIp: string) => string;
  onReputationUpdate?: (change: number, reason: string, severity?: string) => void;
}

let commandContext: CommandContext = {
  currentDirectory: '/',
  environment: {},
  history: []
};

let gameContext: GameCommandContext = commandContext;

// Basic command implementations
const commands: Record<string, (args: string[], flags: Record<string, string | boolean>) => string[]> = {
  help: () => [
    'Available commands:',
    '  help     - Show this help message',
    '  clear    - Clear the terminal',
    '',
    'Hacking Commands:',
    '  scan [radius]     - Scan nearby network nodes',
    '  bruteforce <ip>   - Brute force attack on target',
    '  connect <ip>      - Connect to compromised target',
    '  bypass <ip>       - Bypass firewall protection',
    '  inject <ip> [script] - Inject malicious code',
    '  download <file>   - Download file from connected server',
    '',
    'System Commands:',
    '  tools      - Show available hacking tools',
    '  downloads  - View downloaded files',
    '  history    - Show hack history',
    '  skills     - View skill tree',
    '  wallet     - Show crypto wallet',
    '  missions   - View available missions',
    '  darkweb    - Access dark web market',
    '  inventory  - View owned items',
    '  reputation - View reputation status',
    '  proxy <on|off> - Control proxy network',
    '  logs <ip>  - Delete server logs',
    '  reset      - Reset game progress',
    '',
    'Utility Commands:',
    '  ls         - List directory contents',
    '  pwd        - Print working directory',
    '  whoami     - Display current user',
    '  date       - Show current date and time',
    '  echo <text> - Display text',
    '  status     - Show system status'
  ],
  
  clear: () => ['CLEAR'],
  
  ls: () => [
    'total 8',
    'drwxr-xr-x  2 hacker hacker 4096 Jan 15 12:00 documents',
    'drwxr-xr-x  2 hacker hacker 4096 Jan 15 12:00 downloads',
    '-rw-r--r--  1 hacker hacker  256 Jan 15 12:00 readme.txt'
  ],
  
  pwd: () => [commandContext.currentDirectory],
  
  whoami: () => ['hacker'],
  
  date: () => [new Date().toString()],
  
  echo: (args) => [args.join(' ')],
  
  // Hacking Commands
  scan: (args) => {
    if (!gameContext.networkNodes || !gameContext.playerPosition) {
      return ['Error: Network interface not initialized'];
    }

    const radius = args[0] ? parseInt(args[0]) : (gameContext.playerStats?.scanRadius || 2);
    if (isNaN(radius) || radius < 1 || radius > 10) {
      return ['Error: Invalid scan radius. Use 1-10.'];
    }

    const nearbyNodes = getNodesInRadius(
      gameContext.networkNodes,
      gameContext.playerPosition.x,
      gameContext.playerPosition.y,
      radius
    );

    if (nearbyNodes.length === 0) {
      return ['No network nodes detected in scan radius.'];
    }

    // Update trace
    if (gameContext.onTraceUpdate) {
      gameContext.onTraceUpdate('scan', `Scanned ${nearbyNodes.length} nodes`);
    }

    // Mark nodes as scanned and trigger callback
    const scannedNodes = nearbyNodes.map(node => ({ ...node, status: 'Scanned' as const }));
    if (gameContext.onScan) {
      gameContext.onScan(scannedNodes);
    }

    const output = [
      `Scanning network within radius ${radius}...`,
      `Found ${nearbyNodes.length} network nodes:`,
      ''
    ];

    nearbyNodes.forEach(node => {
      output.push(`${node.ip.padEnd(15)} | ${node.vulnerability.padEnd(8)} | Distance: ${Math.round(Math.sqrt(Math.pow(node.x - gameContext.playerPosition!.x, 2) + Math.pow(node.y - gameContext.playerPosition!.y, 2)) * 10) / 10}`);
    });

    output.push('');
    output.push('Use "bruteforce <ip>" to attack a target');

    return output;
  },

  bruteforce: (args) => {
    if (args.length === 0) {
      return ['Usage: bruteforce <target_ip>'];
    }

    const targetIp = args[0];
    const targetNode = gameContext.networkNodes?.find(node => node.ip === targetIp);
    
    if (!targetNode) {
      return [`Error: Target ${targetIp} not found. Use "scan" first.`];
    }

    if (targetNode.status === 'Hidden') {
      return [`Error: Target ${targetIp} not scanned. Use "scan" first.`];
    }

    const bruteForceTool = gameContext.tools?.find(tool => tool.id === 'bruteforce');
    if (!bruteForceTool || !bruteForceTool.unlocked) {
      return ['Error: Brute force tool not available'];
    }

    if (!checkToolCooldown(bruteForceTool)) {
      const remaining = Math.ceil((bruteForceTool.cooldown - (Date.now() - bruteForceTool.lastUsed) / 1000));
      return [`Error: Brute force tool on cooldown. ${remaining}s remaining.`];
    }

    // Check if server is down
    if (targetNode.isTemporarilyDown && targetNode.downUntil && Date.now() < targetNode.downUntil) {
      return [`Error: Target server ${targetIp} is currently offline`];
    }

    // Apply inventory effects
    const inventoryEffects = gameContext.playerInventory ? getItemEffects(gameContext.playerInventory) : {
      cooldownReductions: {},
      successRateBoosts: {},
      scanRadiusBonus: 0,
      stealthBonus: 0,
      hasAutoExploit: false
    };

    // Calculate success rate with bonuses
    let baseSuccessRate = bruteForceTool.successRate[targetNode.vulnerability.toLowerCase() as keyof typeof bruteForceTool.successRate];
    const successRateBonus = inventoryEffects.successRateBoosts['bruteforce'] || 0;
    const finalSuccessRate = Math.min(1, baseSuccessRate + successRateBonus);
    
    const success = Math.random() < finalSuccessRate;

    // Update tool cooldown
    if (gameContext.onUpdateTools) {
      const updatedTools = updateToolLastUsed('bruteforce', gameContext.tools || []);
      gameContext.onUpdateTools(updatedTools);
    }

    // Update trace
    if (gameContext.onTraceUpdate) {
      gameContext.onTraceUpdate('bruteforce', `Brute force attack on ${targetIp}`);
    }

    // Add to hack history
    if (gameContext.networkNodes) {
      const updatedNodes = addHackAttempt(gameContext.networkNodes, targetIp, bruteForceTool, success, targetNode.vulnerability);
      if (gameContext.onScan) {
        gameContext.onScan(updatedNodes);
      }
    }

    if (success) {
      // Update node status
      targetNode.status = 'Bruteforced';
      
      // Award crypto and trigger callbacks
      const reward = calculateHackReward(targetNode.vulnerability, 'bruteforce');
      if (gameContext.onUpdateCryptoWallet && gameContext.cryptoWallet) {
        const updatedWallet = addTransaction(
          gameContext.cryptoWallet,
          'earned',
          reward,
          `Brute force hack: ${targetIp}`
        );
        gameContext.onUpdateCryptoWallet(updatedWallet);
      }

      // Update mission progress
      if (gameContext.onMissionProgress) {
        gameContext.onMissionProgress('hack_success', { vulnerability: targetNode.vulnerability });
        gameContext.onMissionProgress('tool_use', { toolId: 'bruteforce' });
      }

      // Update reputation
      if (gameContext.onReputationUpdate) {
        const repChange = targetNode.vulnerability === 'High' ? 3 : targetNode.vulnerability === 'Medium' ? 2 : 1;
        gameContext.onReputationUpdate(repChange, `Successful brute force attack on ${targetNode.vulnerability} security target`);
      }

      if (gameContext.onHackSuccess) {
        gameContext.onHackSuccess();
      }

      return [
        `✓ Brute force attack successful on ${targetIp}`,
        `Credentials discovered: admin / ${generateRandomPassword()}`,
        `Earned: ${reward} ɄCoins`,
        'Login credentials obtained',
        'Use "connect ' + targetIp + '" to establish connection'
      ];
    } else {
      return [
        `✗ Brute force attack failed on ${targetIp}`,
        'Password dictionary exhausted',
        'Account lockout detected',
        'Consider using advanced tools for high-security targets'
      ];
    }
  },

  connect: (args) => {
    if (args.length === 0) {
      return ['Usage: connect <target_ip>'];
    }

    const targetIp = args[0];
    const targetNode = gameContext.networkNodes?.find(node => node.ip === targetIp);
    
    if (!targetNode) {
      return [`Error: Target ${targetIp} not found`];
    }

    if (targetNode.status !== 'Bruteforced' && targetNode.status !== 'Connected' && targetNode.status !== 'Bypassed') {
      return [`Error: Cannot connect to ${targetIp}. Use "bruteforce" first.`];
    }

    // Update trace
    if (gameContext.onTraceUpdate) {
      gameContext.onTraceUpdate('connect', `Connected to ${targetIp}`);
    }

    // Trigger connection modal
    if (gameContext.onConnect) {
      gameContext.onConnect(targetNode);
    }

    return [
      `Establishing connection to ${targetIp}...`,
      'Connection successful!',
      'Opening secure terminal session...'
    ];
  },

  bypass: (args) => {
    if (args.length === 0) {
      return ['Usage: bypass <target_ip>'];
    }

    const targetIp = args[0];
    const targetNode = gameContext.networkNodes?.find(node => node.ip === targetIp);
    
    if (!targetNode) {
      return [`Error: Target ${targetIp} not found`];
    }

    if (targetNode.status !== 'Connected' && targetNode.status !== 'Bruteforced') {
      return [`Error: Must be connected to ${targetIp} first. Use "connect" command.`];
    }

    const bypassTool = gameContext.tools?.find(tool => tool.id === 'bypass');
    if (!bypassTool || !bypassTool.unlocked) {
      return ['Error: Bypass tool not available'];
    }

    if (!checkToolCooldown(bypassTool)) {
      const remaining = Math.ceil((bypassTool.cooldown - (Date.now() - bypassTool.lastUsed) / 1000));
      return [`Error: Bypass tool on cooldown. ${remaining}s remaining.`];
    }

    // Apply inventory effects
    const inventoryEffects = gameContext.playerInventory ? getItemEffects(gameContext.playerInventory) : {
      cooldownReductions: {},
      successRateBoosts: {},
      scanRadiusBonus: 0,
      stealthBonus: 0,
      hasAutoExploit: false
    };

    // Calculate success rate with bonuses
    let baseSuccessRate = bypassTool.successRate[targetNode.vulnerability.toLowerCase() as keyof typeof bypassTool.successRate];
    const successRateBonus = inventoryEffects.successRateBoosts['bypass'] || 0;
    const finalSuccessRate = Math.min(1, baseSuccessRate + successRateBonus);
    
    const success = Math.random() < finalSuccessRate;

    // Update tool cooldown
    if (gameContext.onUpdateTools) {
      const updatedTools = updateToolLastUsed('bypass', gameContext.tools || []);
      gameContext.onUpdateTools(updatedTools);
    }

    // Update trace
    if (gameContext.onTraceUpdate) {
      gameContext.onTraceUpdate('bypass', `Firewall bypass on ${targetIp}`);
    }

    // Add to hack history
    if (gameContext.networkNodes) {
      const updatedNodes = addHackAttempt(gameContext.networkNodes, targetIp, bypassTool, success, targetNode.vulnerability);
      if (gameContext.onScan) {
        gameContext.onScan(updatedNodes);
      }
    }

    if (success) {
      // Update node status
      targetNode.status = 'Bypassed';
      
      // Award crypto
      const reward = calculateHackReward(targetNode.vulnerability, 'bypass');
      if (gameContext.onUpdateCryptoWallet && gameContext.cryptoWallet) {
        const updatedWallet = addTransaction(
          gameContext.cryptoWallet,
          'earned',
          reward,
          `Firewall bypass: ${targetIp}`
        );
        gameContext.onUpdateCryptoWallet(updatedWallet);
      }

      // Update mission progress
      if (gameContext.onMissionProgress) {
        gameContext.onMissionProgress('hack_success', { vulnerability: targetNode.vulnerability });
        gameContext.onMissionProgress('tool_use', { toolId: 'bypass' });
      }

      // Update reputation
      if (gameContext.onReputationUpdate) {
        const repChange = targetNode.vulnerability === 'High' ? 4 : targetNode.vulnerability === 'Medium' ? 3 : 2;
        gameContext.onReputationUpdate(repChange, `Successful firewall bypass on ${targetNode.vulnerability} security target`);
      }

      if (gameContext.onHackSuccess) {
        gameContext.onHackSuccess();
      }

      return [
        `✓ Firewall bypass successful on ${targetIp}`,
        'Circumvented security measures',
        `Earned: ${reward} ɄCoins`,
        'File system access enabled',
        'You can now download files from this server'
      ];
    } else {
      return [
        `✗ Firewall bypass failed on ${targetIp}`,
        'Security measures too advanced',
        'Intrusion detection system activated',
        'Connection blocked and logged'
      ];
    }
  },

  inject: (args) => {
    if (args.length === 0) {
      return ['Usage: inject <target_ip> [script_name]'];
    }

    const targetIp = args[0];
    const scriptName = args[1] || 'default_payload.js';
    const targetNode = gameContext.networkNodes?.find(node => node.ip === targetIp);
    
    if (!targetNode) {
      return [`Error: Target ${targetIp} not found`];
    }

    if (targetNode.status !== 'Connected' && targetNode.status !== 'Bruteforced' && targetNode.status !== 'Bypassed') {
      return [`Error: Must be connected to ${targetIp} first. Use "connect" command.`];
    }

    const injectTool = gameContext.tools?.find(tool => tool.id === 'inject');
    if (!injectTool || !injectTool.unlocked) {
      return ['Error: Code injection tool not available'];
    }

    if (!checkToolCooldown(injectTool)) {
      const remaining = Math.ceil((injectTool.cooldown - (Date.now() - injectTool.lastUsed) / 1000));
      return [`Error: Injection tool on cooldown. ${remaining}s remaining.`];
    }

    // Apply inventory effects
    const inventoryEffects = gameContext.playerInventory ? getItemEffects(gameContext.playerInventory) : {
      cooldownReductions: {},
      successRateBoosts: {},
      scanRadiusBonus: 0,
      stealthBonus: 0,
      hasAutoExploit: false
    };

    // Calculate success rate with bonuses
    let baseSuccessRate = injectTool.successRate[targetNode.vulnerability.toLowerCase() as keyof typeof injectTool.successRate];
    const successRateBonus = inventoryEffects.successRateBoosts['inject'] || 0;
    const finalSuccessRate = Math.min(1, baseSuccessRate + successRateBonus);
    
    const success = Math.random() < finalSuccessRate;

    // Update tool cooldown
    if (gameContext.onUpdateTools) {
      const updatedTools = updateToolLastUsed('inject', gameContext.tools || []);
      gameContext.onUpdateTools(updatedTools);
    }

    // Update trace
    if (gameContext.onTraceUpdate) {
      gameContext.onTraceUpdate('inject', `Code injection on ${targetIp}`);
    }

    // Add to hack history
    if (gameContext.networkNodes) {
      const updatedNodes = addHackAttempt(gameContext.networkNodes, targetIp, injectTool, success, targetNode.vulnerability);
      if (gameContext.onScan) {
        gameContext.onScan(updatedNodes);
      }
    }

    if (success) {
      // Update node status and set temporary downtime
      targetNode.status = 'Hacked';
      targetNode.isTemporarilyDown = true;
      targetNode.downUntil = Date.now() + 60000; // 60 seconds downtime
      
      // Award crypto
      const reward = calculateHackReward(targetNode.vulnerability, 'inject');
      if (gameContext.onUpdateCryptoWallet && gameContext.cryptoWallet) {
        const updatedWallet = addTransaction(
          gameContext.cryptoWallet,
          'earned',
          reward,
          `Code injection: ${targetIp}`
        );
        gameContext.onUpdateCryptoWallet(updatedWallet);
      }

      // Update mission progress
      if (gameContext.onMissionProgress) {
        gameContext.onMissionProgress('hack_success', { vulnerability: targetNode.vulnerability });
        gameContext.onMissionProgress('tool_use', { toolId: 'inject' });
      }

      // Update reputation
      if (gameContext.onReputationUpdate) {
        const repChange = targetNode.vulnerability === 'High' ? 5 : targetNode.vulnerability === 'Medium' ? 4 : 3;
        gameContext.onReputationUpdate(repChange, `Successful code injection on ${targetNode.vulnerability} security target`);
      }

      if (gameContext.onHackSuccess) {
        gameContext.onHackSuccess();
      }

      return [
        `✓ Code injection successful on ${targetIp}`,
        `Payload "${scriptName}" injected into system files`,
        `Earned: ${reward} ɄCoins`,
        'Malicious code executed successfully',
        'Server shutting down... (60 seconds)',
        'Target system compromised'
      ];
    } else {
      return [
        `✗ Code injection failed on ${targetIp}`,
        `Payload "${scriptName}" was detected and blocked`,
        'Input validation prevented injection',
        'System integrity maintained'
      ];
    }
  },

  ddos: (args) => {
    if (args.length === 0) {
      return ['Usage: ddos <target_ip>'];
    }

    const targetIp = args[0];
    const targetNode = gameContext.networkNodes?.find(node => node.ip === targetIp);
    
    if (!targetNode) {
      return [`Error: Target ${targetIp} not found`];
    }

    if (targetNode.status === 'Hidden') {
      return [`Error: Target ${targetIp} not scanned. Use "scan" first.`];
    }

    const ddosTool = gameContext.tools?.find(tool => tool.id === 'ddos');
    if (!ddosTool || !ddosTool.unlocked) {
      return ['Error: DDoS tool not available'];
    }

    if (!checkToolCooldown(ddosTool)) {
      const remaining = Math.ceil((ddosTool.cooldown - (Date.now() - ddosTool.lastUsed) / 1000));
      return [`Error: DDoS tool on cooldown. ${remaining}s remaining.`];
    }

    // Apply inventory effects
    const inventoryEffects = gameContext.playerInventory ? getItemEffects(gameContext.playerInventory) : {
      cooldownReductions: {},
      successRateBoosts: {},
      scanRadiusBonus: 0,
      stealthBonus: 0,
      hasAutoExploit: false
    };

    // Calculate success rate with bonuses
    let baseSuccessRate = ddosTool.successRate[targetNode.vulnerability.toLowerCase() as keyof typeof ddosTool.successRate];
    const successRateBonus = inventoryEffects.successRateBoosts['ddos'] || 0;
    const finalSuccessRate = Math.min(1, baseSuccessRate + successRateBonus);
    
    const success = Math.random() < finalSuccessRate;

    // Update tool cooldown
    if (gameContext.onUpdateTools) {
      const updatedTools = updateToolLastUsed('ddos', gameContext.tools || []);
      gameContext.onUpdateTools(updatedTools);
    }

    // Update trace
    if (gameContext.onTraceUpdate) {
      gameContext.onTraceUpdate('ddos', `DDoS attack on ${targetIp}`);
    }

    // Add to hack history
    if (gameContext.networkNodes) {
      const updatedNodes = addHackAttempt(gameContext.networkNodes, targetIp, ddosTool, success, targetNode.vulnerability);
      if (gameContext.onScan) {
        gameContext.onScan(updatedNodes);
      }
    }

    if (success) {
      // Set server as temporarily down
      targetNode.isTemporarilyDown = true;
      targetNode.downUntil = Date.now() + 30000; // 30 seconds downtime
      
      // Award crypto
      const reward = calculateHackReward(targetNode.vulnerability, 'ddos');
      if (gameContext.onUpdateCryptoWallet && gameContext.cryptoWallet) {
        const updatedWallet = addTransaction(
          gameContext.cryptoWallet,
          'earned',
          reward,
          `DDoS attack: ${targetIp}`
        );
        gameContext.onUpdateCryptoWallet(updatedWallet);
      }

      // Update mission progress
      if (gameContext.onMissionProgress) {
        gameContext.onMissionProgress('tool_use', { toolId: 'ddos' });
      }

      return [
        `✓ DDoS attack successful on ${targetIp}`,
        'Server overwhelmed with traffic',
        `Earned: ${reward} ɄCoins`,
        'Target system temporarily disabled',
        'Server will be down for 30 seconds'
      ];
    } else {
      return [
        `✗ DDoS attack failed on ${targetIp}`,
        'Target has DDoS protection enabled',
        'Traffic filtered by upstream providers',
        'Server remains operational'
      ];
    }
  },

  download: (args) => {
    if (args.length === 0) {
      return ['Usage: download <filename>'];
    }

    return [
      'Error: No active server connection',
      'Use "connect <ip>" to establish a connection first',
      'Then use the file system terminal to download files'
    ];
  },

  // System Commands
  tools: () => {
    if (gameContext.onShowTools) {
      gameContext.onShowTools();
      return ['Opening tools panel...'];
    }
    return ['Tools panel not available'];
  },

  downloads: () => {
    if (gameContext.onShowDownloads) {
      gameContext.onShowDownloads();
      return ['Opening downloads panel...'];
    }
    return ['Downloads panel not available'];
  },

  history: () => {
    if (gameContext.onShowHackHistory) {
      gameContext.onShowHackHistory();
      return ['Opening hack history panel...'];
    }
    return ['Hack history panel not available'];
  },

  skills: () => {
    if (gameContext.onShowSkillTree) {
      gameContext.onShowSkillTree();
      return ['Opening skill tree panel...'];
    }
    return ['Skill tree panel not available'];
  },

  wallet: () => {
    if (gameContext.onShowCryptoWallet) {
      gameContext.onShowCryptoWallet();
      return ['Opening crypto wallet panel...'];
    }
    return ['Crypto wallet panel not available'];
  },

  missions: () => {
    if (gameContext.onShowMissions) {
      gameContext.onShowMissions();
      return ['Opening missions panel...'];
    }
    return ['Missions panel not available'];
  },

  darkweb: () => {
    if (gameContext.onShowBlackMarket) {
      gameContext.onShowBlackMarket();
      return ['Accessing dark web marketplace...'];
    }
    return ['Dark web access not available'];
  },

  inventory: () => {
    if (gameContext.onShowInventory) {
      gameContext.onShowInventory();
      return ['Opening inventory panel...'];
    }
    return ['Inventory panel not available'];
  },

  reputation: () => {
    if (gameContext.onShowReputation) {
      gameContext.onShowReputation();
      return ['Opening reputation panel...'];
    }
    return ['Reputation panel not available'];
  },

  proxy: (args) => {
    if (args.length === 0) {
      return ['Usage: proxy <on|off>'];
    }

    const command = args[0].toLowerCase();
    if (command !== 'on' && command !== 'off') {
      return ['Usage: proxy <on|off>'];
    }

    if (gameContext.onProxyCommand) {
      const result = gameContext.onProxyCommand(command as 'on' | 'off');
      return [result];
    }

    return ['Proxy control not available'];
  },

  logs: (args) => {
    if (args.length === 0) {
      return ['Usage: logs <server_ip>'];
    }

    const serverIp = args[0];
    if (gameContext.onDeleteLogs) {
      const result = gameContext.onDeleteLogs(serverIp);
      return [result];
    }

    return ['Log deletion not available'];
  },

  reset: () => {
    if (gameContext.onResetGame) {
      gameContext.onResetGame();
      return ['Game reset initiated...'];
    }
    return ['Reset function not available'];
  },
  
  status: () => {
    const reputation = gameContext.reputationState?.rank?.name || 'Unknown';
    const balance = gameContext.cryptoWallet?.balance || 0;
    const traceLevel = gameContext.traceState?.level || 0;
    const toolsCount = gameContext.tools?.filter(t => t.unlocked).length || 0;
    const skillPoints = gameContext.skillTree?.skillPoints || 0;

    return [
      '╔══════════════════════════════════════════════════════════════╗',
      '║                      SYSTEM STATUS                           ║',
      '╠══════════════════════════════════════════════════════════════╣',
      `║ Reputation: ${reputation.padEnd(20)} ║`,
      `║ ɄCoin Balance: ${balance.toString().padEnd(15)} ║`,
      `║ Skill Points: ${skillPoints.toString().padEnd(16)} ║`,
      `║ Trace Level: ${traceLevel.toFixed(1)}%`.padEnd(30) + ' ║',
      `║ Tools Available: ${toolsCount.toString().padEnd(12)} ║`,
      '╚══════════════════════════════════════════════════════════════╝'
    ];
  }
};

// Helper function to generate random passwords
function generateRandomPassword(): string {
  const passwords = [
    'password123',
    'admin2023',
    'qwerty456',
    'letmein',
    'welcome1',
    'secret789'
  ];
  return passwords[Math.floor(Math.random() * passwords.length)];
}

function parseCommandString(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed) {
    return { command: '', args: [], flags: {} };
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.startsWith('--')) {
      // Long flag
      const flagName = part.substring(2);
      if (flagName.includes('=')) {
        const [key, value] = flagName.split('=', 2);
        flags[key] = value;
      } else {
        flags[flagName] = true;
      }
    } else if (part.startsWith('-') && part.length > 1) {
      // Short flag(s)
      const flagChars = part.substring(1);
      for (const char of flagChars) {
        flags[char] = true;
      }
    } else {
      // Regular argument
      args.push(part);
    }
  }

  return { command, args, flags };
}

export function parseCommand(input: string): CommandResult {
  const parsed = parseCommandString(input);
  const { command, args, flags } = parsed;
  
  // Add to history
  addToHistory(input);
  
  // Execute command
  let output: string[];
  
  if (commands[command]) {
    try {
      output = commands[command](args, flags);
    } catch (error) {
      output = [`Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`];
    }
  } else if (command === '') {
    output = [];
  } else {
    output = [`Command not found: ${command}. Type 'help' for available commands.`];
  }
  
  return {
    command: input,
    output,
    timestamp: new Date()
  };
}

export function setCommandContext(context: Partial<CommandContext>): void {
  gameContext = { ...gameContext, ...context };
  commandContext = gameContext;
}

export function getCommandContext(): CommandContext {
  return { ...commandContext };
}

export function addToHistory(command: string): void {
  commandContext.history.push(command);
  // Keep only last 100 commands
  if (commandContext.history.length > 100) {
    commandContext.history = commandContext.history.slice(-100);
  }
}

export function getCommandHistory(): string[] {
  return [...commandContext.history];
}

export function setCurrentDirectory(directory: string): void {
  commandContext.currentDirectory = directory;
}

export function getCurrentDirectory(): string {
  return commandContext.currentDirectory;
}

export function setEnvironmentVariable(key: string, value: string): void {
  commandContext.environment[key] = value;
}

export function getEnvironmentVariable(key: string): string | undefined {
  return commandContext.environment[key];
}

export function getAllEnvironmentVariables(): Record<string, string> {
  return { ...commandContext.environment };
}