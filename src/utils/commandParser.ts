import { Command, CommandResult } from '../types/terminal';
import { NetworkNode } from '../types/network';
import { DownloadedFile } from '../types/filesystem';
import { getNodesInRadius } from './networkGenerator';

interface CommandContext {
  networkNodes: NetworkNode[];
  playerPosition: { x: number; y: number };
  downloads: DownloadedFile[];
  onScan: (scannedNodes: NetworkNode[]) => void;
  onConnect: (node: NetworkNode) => void;
  onShowDownloads: () => void;
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
      '  help           - Display this help message',
      '  clear          - Clear the terminal screen',
      '  echo [text]    - Print text to the terminal',
      '  whoami         - Display current user information',
      '  date           - Display current date and time',
      '  system         - Display system information',
      '  scan           - Scan nearby network nodes',
      '  connect [ip]   - Connect to a scanned network node',
      '  downloads      - View downloaded files',
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
  scan: {
    name: 'scan',
    description: 'Scan nearby network nodes',
    execute: () => {
      if (!commandContext) {
        return ['Error: Network interface not initialized'];
      }
      
      const { networkNodes, playerPosition, onScan } = commandContext;
      const nearbyNodes = getNodesInRadius(networkNodes, playerPosition.x, playerPosition.y, 2);
      
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
      
      const results = [
        'Network scan initiated...',
        `Scanning radius: 2 nodes`,
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
      
      if (targetNode.status !== 'Scanned') {
        return [
          `Error: Cannot connect to ${targetIp}`,
          'Node must be scanned first. Use "scan" command.',
        ];
      }
      
      if (targetNode.isPlayerLocation) {
        return ['Error: Cannot connect to your own location.'];
      }
      
      // Trigger connection
      onConnect(targetNode);
      
      return [
        `Initiating connection to ${targetIp}...`,
        'Establishing secure tunnel...',
        'Bypassing firewall...',
        `Successfully connected to ${targetIp}`,
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
});

export const parseCommand = (input: string): CommandResult => {
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