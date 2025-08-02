import React from 'react';
import { ReputationState } from '../types/reputation';
import { Star, TrendingUp, TrendingDown, Clock, Award } from 'lucide-react';
import { REPUTATION_RANKS } from '../utils/reputationManager';

interface ReputationPanelProps {
  reputationState: ReputationState;
  isOpen: boolean;
  onClose: () => void;
}

const ReputationPanel: React.FC<ReputationPanelProps> = ({ 
  reputationState, 
  isOpen, 
  onClose 
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getNextRank = () => {
    return REPUTATION_RANKS.find(rank => rank.minLevel > reputationState.level);
  };

  const getProgressToNext = () => {
    const nextRank = getNextRank();
    if (!nextRank) return 100;
    
    const currentRank = reputationState.rank;
    const progress = ((reputationState.level - currentRank.minLevel) / (nextRank.minLevel - currentRank.minLevel)) * 100;
    return Math.round(progress);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'major': return 'text-orange-400';
      case 'moderate': return 'text-yellow-400';
      case 'minor': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  const nextRank = getNextRank();
  const progressToNext = getProgressToNext();

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-purple-400 rounded-lg w-full max-w-5xl h-[80vh] mx-4 shadow-2xl shadow-purple-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Award className="w-6 h-6 text-purple-400" />
            <div>
              <span className="text-purple-300 font-mono text-xl font-bold">
                Reputation System
              </span>
              <div className="text-purple-400 text-sm">
                {reputationState.rank.name} • Level {reputationState.level}/100
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-300 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-black">
            {/* Current Rank */}
            <div className="mb-6">
              <h3 className="text-purple-400 font-mono text-lg font-bold mb-4">Current Status</h3>
              <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={`text-2xl font-bold font-mono ${reputationState.rank.color}`}>
                      {reputationState.rank.name}
                    </div>
                    <div className="text-purple-300 text-sm">
                      "{reputationState.title}"
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-300 font-mono text-lg font-bold">
                      {reputationState.level}/100
                    </div>
                    <div className="text-purple-400 text-xs">
                      Reputation Level
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {nextRank && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-purple-300 mb-1">
                      <span>Progress to {nextRank.name}</span>
                      <span>{progressToNext}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressToNext}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits & Penalties */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Benefits */}
              <div>
                <h4 className="text-green-400 font-mono text-md font-bold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Benefits
                </h4>
                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                  {reputationState.rank.benefits.length > 0 ? (
                    <div className="space-y-1">
                      {reputationState.rank.benefits.map((benefit, index) => (
                        <div key={index} className="text-green-300 text-sm flex items-center">
                          <span className="text-green-400 mr-2">•</span>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-green-400 text-sm">No special benefits at this rank</div>
                  )}
                </div>
              </div>

              {/* Penalties */}
              <div>
                <h4 className="text-red-400 font-mono text-md font-bold mb-3 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Penalties
                </h4>
                <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3">
                  {reputationState.rank.penalties.length > 0 ? (
                    <div className="space-y-1">
                      {reputationState.rank.penalties.map((penalty, index) => (
                        <div key={index} className="text-red-300 text-sm flex items-center">
                          <span className="text-red-400 mr-2">•</span>
                          {penalty}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm">No active penalties</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <h4 className="text-purple-400 font-mono text-md font-bold mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Recent Events
              </h4>
              <div className="space-y-2">
                {reputationState.events.length === 0 ? (
                  <div className="text-center text-purple-300 py-8">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <div className="text-sm">No reputation events yet</div>
                    <div className="text-xs text-purple-400 mt-1">
                      Complete hacks and missions to build your reputation
                    </div>
                  </div>
                ) : (
                  reputationState.events.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        event.type === 'gain' 
                          ? 'bg-green-900/20 border-green-400/30' 
                          : 'bg-red-900/20 border-red-400/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {event.type === 'gain' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <div className="text-purple-300 font-mono text-sm font-bold">
                              {event.reason}
                            </div>
                            <div className="text-purple-400 text-xs flex items-center space-x-2">
                              <span>{formatTime(event.timestamp)}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(event.severity)} bg-black/50`}>
                                {event.severity.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-mono px-3 py-1 rounded ${
                          event.type === 'gain' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {event.type === 'gain' ? '+' : '-'}{event.amount}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Rank Progression */}
          <div className="w-80 border-l border-purple-400/30 bg-black/50 p-4">
            <h3 className="text-purple-400 font-mono text-sm font-bold mb-4">Rank Progression</h3>
            <div className="space-y-3">
              {REPUTATION_RANKS.map((rank, index) => {
                const isCurrentRank = rank.id === reputationState.rank.id;
                const isUnlocked = reputationState.level >= rank.minLevel;
                
                return (
                  <div
                    key={rank.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      isCurrentRank 
                        ? 'border-purple-400 bg-purple-900/30' 
                        : isUnlocked
                        ? 'border-gray-600 bg-gray-900/20'
                        : 'border-gray-700 bg-gray-900/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-mono font-bold text-sm ${rank.color}`}>
                        {rank.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {rank.minLevel}-{rank.maxLevel}
                      </div>
                    </div>
                    <div className="text-xs text-gray-300">
                      "{rank.title}"
                    </div>
                    {isCurrentRank && (
                      <div className="mt-2 text-xs text-purple-400">
                        ← Current Rank
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-400/30 bg-black/50">
          <div className="text-center text-purple-400 text-sm font-mono">
            Build your reputation through successful hacks and missions • Higher ranks unlock exclusive content
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReputationPanel;