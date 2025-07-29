import React, { useState, useRef, useEffect } from 'react';
import { NetworkNode } from '../types/network';
import { FileSystem, FileSystemNode, DownloadedFile } from '../types/filesystem';
import { generateFileSystem } from '../utils/filesystemGenerator';

interface ServerTerminalProps {
  node: NetworkNode;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: DownloadedFile) => void;
}

interface ServerCommandResult {
  command: string;
  output: string[];
  timestamp: Date;
}

const ServerTerminal: React.FC<ServerTerminalProps> = ({ node, isOpen, onClose, onDownload }) => {
  // Check if server can be accessed
  const canAccess = node.status === 'Bypassed' || node.status === 'Hacked';
  
  const [fileSystem] = useState<FileSystem>(() => ({
    root: generateFileSystem(),
    currentPath: []
  }));
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [history, setHistory] = useState<ServerCommandResult[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getCurrentDirectory = (): FileSystemNode | null => {
    let current: any = fileSystem.root;
    for (const pathPart of currentPath) {
      if (current[pathPart] && current[pathPart].type === 'directory') {
        current = current[pathPart].children || {};
      } else {
        return null;
      }
    }
    return { name: '/', type: 'directory', children: current };
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)}K`;
    return `${Math.round(size / (1024 * 1024))}M`;
  };

  const executeCommand = (input: string): string[] => {
    const [command, ...args] = input.trim().split(' ');
    
    // Check access for file system commands
    if (!canAccess && ['ls', 'cd', 'cat', 'download'].includes(command.toLowerCase())) {
      return [
        'Access Denied: Firewall protection active',
        'Use "bypass" command in main terminal first',
        'File system access requires bypassing security measures'
      ];
    }
    
    switch (command.toLowerCase()) {
      case 'ls':
        const currentDir = getCurrentDirectory();
        if (!currentDir || !currentDir.children) {
          return ['ls: cannot access directory'];
        }
        
        const entries = Object.values(currentDir.children);
        if (entries.length === 0) {
          return ['total 0'];
        }
        
        const output = ['total ' + entries.length];
        entries.forEach(entry => {
          const permissions = entry.permissions || (entry.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
          const owner = entry.owner || 'root';
          const size = entry.type === 'directory' ? '4096' : formatFileSize(entry.size || 0);
          const modified = entry.modified || '2023-01-01';
          const name = entry.type === 'directory' ? `\x1b[34m${entry.name}/\x1b[0m` : entry.name;
          
          output.push(`${permissions} 1 ${owner} ${owner} ${size.padStart(8)} ${modified} ${name}`);
        });
        return output;
        
      case 'cd':
        if (args.length === 0) {
          setCurrentPath([]);
          return [];
        }
        
        const targetPath = args[0];
        if (targetPath === '..') {
          if (currentPath.length > 0) {
            setCurrentPath(currentPath.slice(0, -1));
          }
          return [];
        }
        
        if (targetPath === '/') {
          setCurrentPath([]);
          return [];
        }
        
        if (targetPath.startsWith('/')) {
          // Absolute path
          const pathParts = targetPath.split('/').filter(p => p);
          let testCurrent: any = fileSystem.root;
          
          for (const part of pathParts) {
            if (testCurrent[part] && testCurrent[part].type === 'directory') {
              testCurrent = testCurrent[part].children || {};
            } else {
              return [`cd: ${targetPath}: No such file or directory`];
            }
          }
          setCurrentPath(pathParts);
        } else {
          // Relative path
          const currentDir = getCurrentDirectory();
          if (!currentDir || !currentDir.children || !currentDir.children[targetPath]) {
            return [`cd: ${targetPath}: No such file or directory`];
          }
          
          const target = currentDir.children[targetPath];
          if (target.type !== 'directory') {
            return [`cd: ${targetPath}: Not a directory`];
          }
          
          setCurrentPath([...currentPath, targetPath]);
        }
        return [];
        
      case 'cat':
        if (args.length === 0) {
          return ['cat: missing file operand'];
        }
        
        const filename = args[0];
        const dir = getCurrentDirectory();
        if (!dir || !dir.children || !dir.children[filename]) {
          return [`cat: ${filename}: No such file or directory`];
        }
        
        const file = dir.children[filename];
        if (file.type !== 'file') {
          return [`cat: ${filename}: Is a directory`];
        }
        
        return (file.content || 'File is empty').split('\n');
        
      case 'pwd':
        return ['/' + currentPath.join('/')];
        
      case 'download':
        if (args.length === 0) {
          return ['download: missing file operand'];
        }
        
        const downloadFilename = args[0];
        const downloadDir = getCurrentDirectory();
        if (!downloadDir || !downloadDir.children || !downloadDir.children[downloadFilename]) {
          return [`download: ${downloadFilename}: No such file or directory`];
        }
        
        const downloadFile = downloadDir.children[downloadFilename];
        if (downloadFile.type !== 'file') {
          return [`download: ${downloadFilename}: Is a directory`];
        }
        
        const downloadedFile: DownloadedFile = {
          name: downloadFilename,
          content: downloadFile.content || '',
          sourceIp: node.ip,
          downloadedAt: new Date(),
          size: downloadFile.size || 0
        };
        
        onDownload(downloadedFile);
        return [
          `Downloading ${downloadFilename}...`,
          `Transfer complete: ${formatFileSize(downloadFile.size || 0)}`,
          `File saved to local downloads`
        ];
        
      case 'help':
        return [
          'Available commands:',
          '',
          '  ls              - List directory contents',
          '  cd [directory]  - Change directory',
          '  cat [file]      - Display file contents',
          '  pwd             - Print working directory',
          '  download [file] - Download file to local system',
          '  help            - Show this help message',
          '  exit            - Close connection',
        ];
        
      case 'exit':
        onClose();
        return ['Connection closed.'];
        
      default:
        return [`${command}: command not found`];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentInput.trim()) {
      const output = executeCommand(currentInput);
      const result: ServerCommandResult = {
        command: currentInput,
        output,
        timestamp: new Date()
      };
      
      setHistory(prev => [...prev, result]);
      setCommandHistory(prev => [...prev, currentInput]);
      setHistoryIndex(-1);
    }
    
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentPathString = () => {
    return currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-blue-400 rounded-lg w-full max-w-4xl h-[80vh] mx-4 shadow-2xl shadow-blue-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-blue-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-blue-300 font-mono">
              Connected to {node.ip} - File System Access
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-300 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Terminal Content */}
        <div 
          className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-black cursor-text"
          onClick={handleTerminalClick}
          ref={terminalRef}
        >
          {/* Welcome message */}
          {history.length === 0 && (
            <div className="mb-4">
              <div className="text-blue-300 mb-2">
                Connected to {node.ip}
              </div>
              {canAccess ? (
                <>
                  <div className="text-blue-400 mb-2">
                    File system access granted. Type 'help' for available commands.
                  </div>
                  <div className="text-blue-400 mb-4">
                    Use 'download [filename]' to copy files to your local system.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-red-400 mb-2">
                    Access Denied: Firewall protection active
                  </div>
                  <div className="text-yellow-400 mb-4">
                    Use 'bypass' command in main terminal to gain file system access
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Command history */}
          {history.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="flex items-center text-blue-300">
                <span className="text-blue-500 mr-2">[{formatTime(entry.timestamp)}]</span>
                <span className="text-cyan-400">root@{node.ip.replace(/\./g, '-')}</span>
                <span className="text-white mx-1">:</span>
                <span className="text-yellow-400">{getCurrentPathString()}</span>
                <span className="text-white mx-1">#</span>
                <span className="text-blue-400">{entry.command}</span>
              </div>
              {entry.output.map((line, lineIndex) => (
                <div 
                  key={lineIndex} 
                  className="text-blue-400 ml-4 font-mono"
                  dangerouslySetInnerHTML={{
                    __html: line
                      .replace(/\x1b\[34m/g, '<span class="text-blue-300">')
                      .replace(/\x1b\[0m/g, '</span>')
                  }}
                />
              ))}
            </div>
          ))}
          
          {/* Current input line */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="text-blue-500 mr-2">[{formatTime(new Date())}]</span>
            <span className="text-cyan-400">root@{node.ip.replace(/\./g, '-')}</span>
            <span className="text-white mx-1">:</span>
            <span className="text-yellow-400">{getCurrentPathString()}</span>
            <span className="text-white mx-1">#</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-blue-400 outline-none caret-blue-400 ml-1 font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <span className="text-blue-400 animate-pulse">█</span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServerTerminal;