export interface CommandResult {
  command: string;
  output: string[];
  timestamp: Date;
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string[];
}