import React from 'react';
import { HackingTool } from '../types/tools';
import { Wrench, Lock, Clock, CheckCircle, XCircle } from 'lucide-react';
import { checkToolCooldown, getRemainingCooldown } from '../utils/toolsManager';

interface ToolsPanelProps {
  tools: HackingTool[];
  isOpen: boolean;
  onClose: () => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ tools, isOpen, onClose }) => {
  const formatCooldown = (seconds: number): string => {
    if (seconds <= 0) return 'Ready';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getToolStatusColor = (tool: HackingTool): string => {
    if (!tool.unlocked) return 'text-gray-500';
    if (!checkToolCooldown(tool)) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getToolStatusIcon = (tool: HackingTool) => {
    if (!tool.unlocked) return <Lock className="w-4 h-4" />;
    if (!checkToolCooldown(tool)) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const unlockedTools = tools.filter(tool => tool.unlocked);
  const lockedTools = tools.filter(tool => !tool.unlocked);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-orange-400 rounded-lg w-full max-w-4xl h-[80vh] mx-4 shadow-2xl shadow-orange-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            <span className="text-orange-300 font-mono text-lg font-bold">
              Hacking Tools ({unlockedTools.length}/{tools.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-orange-400 hover:text-orange-300 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-black">
          {/* Unlocked Tools */}
          {unlockedTools.length > 0 && (
            <div className="mb-6">
              <h3 className="text-orange-300 font-mono text-lg font-bold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Available Tools
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {unlockedTools.map((tool) => {
                  const isReady = checkToolCooldown(tool);
                  const remainingCooldown = getRemainingCooldown(tool);
                  
                  return (
                    <div
                      key={tool.id}
                      className="bg-orange-900/20 border border-orange-400/30 rounded-lg p-4 hover:bg-orange-900/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getToolStatusIcon(tool)}
                          <h4 className={`font-mono font-bold ${getToolStatusColor(tool)}`}>
                            {tool.name}
                          </h4>
                        </div>
                        <div className="text-xs">
                          <span className="bg-orange-600 text-white px-2 py-1 rounded font-mono">
                            {tool.command}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-orange-300 text-sm mb-3">
                        {tool.description}
                      </p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-orange-400">Cooldown:</span>
                          <span className={isReady ? 'text-green-400' : 'text-yellow-400'}>
                            {isReady ? 'Ready' : formatCooldown(remainingCooldown)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-400">Success Rate:</span>
                          <div className="flex space-x-1">
                            <span className="text-green-400">{Math.round(tool.successRate.low * 100)}%</span>
                            <span className="text-yellow-400">{Math.round(tool.successRate.medium * 100)}%</span>
                            <span className="text-red-400">{Math.round(tool.successRate.high * 100)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isReady && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-800 rounded-full h-1">
                            <div 
                              className="bg-orange-400 h-1 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${Math.max(0, 100 - (remainingCooldown / tool.cooldown) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Locked Tools */}
          {lockedTools.length > 0 && (
            <div>
              <h3 className="text-gray-400 font-mono text-lg font-bold mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Locked Tools
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {lockedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-gray-900/20 border border-gray-600/30 rounded-lg p-4 opacity-60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <h4 className="font-mono font-bold text-gray-400">
                          {tool.name}
                        </h4>
                      </div>
                      <div className="text-xs">
                        <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded font-mono">
                          {tool.command}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">
                      {tool.description}
                    </p>
                    
                    <div className="text-center">
                      <span className="text-yellow-400 text-xs font-mono">
                        🔒 Unlock by completing more hacks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-orange-400/30 bg-black/50">
          <div className="text-center text-orange-400 text-sm font-mono">
            Use tools in terminal: <span className="text-orange-300">[command] [target_ip] [args]</span>
          </div>
          <div className="text-center text-orange-300 text-xs mt-1">
            Success rates shown for Low/Medium/High vulnerability targets
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel;