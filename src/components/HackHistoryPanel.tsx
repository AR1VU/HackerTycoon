import React from 'react';
import { NetworkNode, HackAttempt } from '../types/network';
import { History, CheckCircle, XCircle, Clock, Target } from 'lucide-react';

interface HackHistoryPanelProps {
  nodes: NetworkNode[];
  isOpen: boolean;
  onClose: () => void;
}

const HackHistoryPanel: React.FC<HackHistoryPanelProps> = ({ nodes, isOpen, onClose }) => {
  const getAllHackHistory = (): (HackAttempt & { ip: string })[] => {
    const allHacks: (HackAttempt & { ip: string })[] = [];
    
    nodes.forEach(node => {
      if (node.hackHistory && node.hackHistory.length > 0) {
        node.hackHistory.forEach(hack => {
          allHacks.push({ ...hack, ip: node.ip });
        });
      }
    });
    
    return allHacks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    );
  };

  const getVulnerabilityColor = (vulnerability: string) => {
    switch (vulnerability) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hackHistory = getAllHackHistory();
  const totalAttempts = hackHistory.length;
  const successfulAttempts = hackHistory.filter(hack => hack.success).length;
  const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-cyan-400 rounded-lg w-full max-w-4xl h-[80vh] mx-4 shadow-2xl shadow-cyan-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-cyan-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 font-mono text-lg font-bold">
              Hack History ({totalAttempts} attempts)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Statistics */}
        <div className="p-4 border-b border-cyan-400/30 bg-cyan-900/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{totalAttempts}</div>
              <div className="text-cyan-300 text-sm">Total Attempts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{successfulAttempts}</div>
              <div className="text-cyan-300 text-sm">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{successRate.toFixed(1)}%</div>
              <div className="text-cyan-300 text-sm">Success Rate</div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-black">
          {hackHistory.length === 0 ? (
            <div className="text-center text-cyan-300 mt-8">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-mono mb-2">No Hack History</h3>
              <p className="text-cyan-400">
                Start hacking networks to see your attack history here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {hackHistory.map((hack, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-colors ${
                    hack.success 
                      ? 'bg-green-900/20 border-green-400/30 hover:bg-green-900/30' 
                      : 'bg-red-900/20 border-red-400/30 hover:bg-red-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(hack.success)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-300 font-mono font-bold">
                            {hack.toolName}
                          </span>
                          <span className="text-cyan-400">→</span>
                          <span className="text-cyan-400 font-mono">{hack.ip}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getVulnerabilityColor(hack.vulnerability)} bg-black/50`}>
                            {hack.vulnerability}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-cyan-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(hack.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-mono px-3 py-1 rounded ${
                      hack.success 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {hack.success ? 'SUCCESS' : 'FAILED'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-cyan-400/30 bg-black/50">
          <div className="text-center text-cyan-400 text-sm font-mono">
            Track all your hacking attempts and success rates
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackHistoryPanel;