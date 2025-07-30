import React, { useState, useRef, useEffect } from 'react';
import { parseCommand } from '../utils/commandParser';
import { CommandResult } from '../types/terminal';

interface TerminalProps {
  toolProgress?: { progress: number; message: string } | null;
}

const Terminal: React.FC<TerminalProps> = ({ toolProgress }) => {
  const [history, setHistory] = useState<CommandResult[]>([]);
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
    // Auto-focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keep input focused when clicking anywhere in terminal
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentInput.trim()) {
      const result = parseCommand(currentInput);
      
      // Handle clear command specially
      if (result.output.length === 1 && result.output[0] === 'CLEAR') {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, result]);
      }
      
      // Add to command history for up/down arrow navigation
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div 
      className="w-full h-full bg-black text-green-400 font-mono text-sm overflow-hidden cursor-text"
      onClick={handleTerminalClick}
    >
      <div className="p-4 border-b border-green-400/30 bg-black/50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-green-300">Hacker Tycoon Terminal</span>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black"
        style={{ height: 'calc(100% - 60px)' }}
      >
        {/* Welcome message */}
        {history.length === 0 && (
          <div className="mb-4">
            <div className="text-green-300 mb-2">
              ╔══════════════════════════════════════════════════════════════╗
            </div>
            <div className="text-green-300 mb-2">
              ║                    HACKER TYCOON v1.0                        ║
            </div>
            <div className="text-green-300 mb-2">
              ║              Welcome to the Underground Terminal              ║
            </div>
            <div className="text-green-300 mb-4">
              ╚══════════════════════════════════════════════════════════════╝
            </div>
            <div className="text-green-400 mb-2">
              System initialized successfully.
            </div>
            <div className="text-green-400 mb-4">
              Type 'help' to see available commands.
            </div>
            <div className="text-yellow-400 mb-2">
              💡 New: Use 'skills' command to view your skill tree!
            </div>
          </div>
        )}
        
        {/* Command history */}
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center text-green-300">
              <span className="text-green-500 mr-2">[{formatTime(entry.timestamp)}]</span>
              <span className="text-cyan-400">hacker@tycoon-terminal</span>
              <span className="text-white mx-1">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-white mx-1">$</span>
              <span className="text-green-400">{entry.command}</span>
            </div>
            {entry.output.map((line, lineIndex) => (
              <div key={lineIndex} className="text-green-400 ml-4">
                {line}
              </div>
            ))}
          </div>
        ))}
        
        {/* Tool Progress Display */}
        {toolProgress && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-400/30 rounded">
            <div className="text-yellow-400 mb-2">{toolProgress.message}</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${toolProgress.progress}%` }}
              />
            </div>
            <div className="text-yellow-300 text-sm mt-1">
              Progress: {Math.round(toolProgress.progress)}%
            </div>
          </div>
        )}
        
        {/* Current input line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-500 mr-2">[{formatTime(new Date())}]</span>
          <span className="text-cyan-400">hacker@tycoon-terminal</span>
          <span className="text-white mx-1">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-white mx-1">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none caret-green-400 ml-1"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="text-green-400 animate-pulse">█</span>
        </form>
      </div>
    </div>
  );
};

export default Terminal;