import { Command, CommandResult } from '../types/terminal';

const commands: Record<string, Command> = {
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
};

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
  return Object.values(commands);
};