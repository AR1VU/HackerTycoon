import React, { useState } from 'react';
import { Mission, MissionState } from '../types/missions';
import { Target, Clock, Star, CheckCircle, AlertCircle, Trophy, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/cryptoManager';
import { formatTimeRemaining, getDifficultyColor, getMissionStats } from '../utils/missionManager';

interface MissionsPanelProps {
  missionState: MissionState;
  isOpen: boolean;
  onClose: () => void;
  onAcceptMission: (missionId: string) => void;
}

const MissionsPanel: React.FC<MissionsPanelProps> = ({ 
  missionState, 
  isOpen, 
  onClose, 
  onAcceptMission 
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAcceptMission = (missionId: string) => {
    onAcceptMission(missionId);
    setSelectedMission(null);
  };

  const getRequirementProgress = (mission: Mission, requirementIndex: number): boolean => {
    const progress = missionState.missionProgress[mission.id];
    return progress?.requirements[requirementIndex] || false;
  };

  const getMissionProgress = (mission: Mission): { completed: number; total: number } => {
    const progress = missionState.missionProgress[mission.id];
    if (!progress) return { completed: 0, total: mission.requirements.length };
    
    const completed = mission.requirements.filter((_, index) => progress.requirements[index]).length;
    return { completed, total: mission.requirements.length };
  };

  if (!isOpen) return null;

  const stats = getMissionStats(missionState);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-orange-400 rounded-lg w-full max-w-6xl h-[90vh] mx-4 shadow-2xl shadow-orange-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Target className="w-6 h-6 text-orange-400" />
            <div>
              <span className="text-orange-300 font-mono text-xl font-bold">
                Mission Control
              </span>
              <div className="text-orange-400 text-sm">
                {stats.completed} completed • {formatCurrency(stats.totalRewardsEarned)} earned
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-orange-400 hover:text-orange-300 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Mission List */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-orange-400/30 bg-black/50">
              {[
                { key: 'available', label: 'Available', count: stats.available },
                { key: 'active', label: 'Active', count: stats.active },
                { key: 'completed', label: 'Completed', count: stats.completed }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 font-mono text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'text-orange-300 border-b-2 border-orange-400'
                      : 'text-orange-400 hover:text-orange-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Mission List Content */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-black">
              {activeTab === 'available' && (
                <div className="space-y-3">
                  {missionState.availableMissions.length === 0 ? (
                    <div className="text-center text-orange-300 mt-8">
                      <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-mono mb-2">No Available Missions</h3>
                      <p className="text-orange-400">Complete active missions to unlock new contracts.</p>
                    </div>
                  ) : (
                    missionState.availableMissions.map(mission => (
                      <div
                        key={mission.id}
                        className={`bg-orange-900/20 border border-orange-400/30 rounded-lg p-4 cursor-pointer hover:bg-orange-900/30 transition-colors ${
                          selectedMission?.id === mission.id ? 'ring-2 ring-orange-400' : ''
                        }`}
                        onClick={() => setSelectedMission(mission)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-orange-300 font-mono font-bold">{mission.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(mission.difficulty)} bg-black/50`}>
                              {mission.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400">💰</span>
                              <span className="text-orange-300">{formatCurrency(mission.reward)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span className="text-orange-300">{mission.skillPointReward} SP</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-orange-400" />
                              <span className="text-orange-300">{mission.timeLimit}m</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-orange-400 text-sm">{mission.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'active' && (
                <div className="space-y-3">
                  {missionState.activeMissions.length === 0 ? (
                    <div className="text-center text-orange-300 mt-8">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-mono mb-2">No Active Missions</h3>
                      <p className="text-orange-400">Accept missions from the Available tab to start earning rewards.</p>
                    </div>
                  ) : (
                    missionState.activeMissions.map(mission => {
                      const progress = getMissionProgress(mission);
                      const progressPercent = (progress.completed / progress.total) * 100;
                      
                      return (
                        <div
                          key={mission.id}
                          className={`bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 cursor-pointer hover:bg-blue-900/30 transition-colors ${
                            selectedMission?.id === mission.id ? 'ring-2 ring-blue-400' : ''
                          }`}
                          onClick={() => setSelectedMission(mission)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-blue-300 font-mono font-bold">{mission.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(mission.difficulty)} bg-black/50`}>
                                {mission.difficulty}
                              </span>
                            </div>
                            <div className="text-sm text-blue-400">
                              {mission.expiresAt && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimeRemaining(mission.expiresAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-blue-400 text-sm mb-3">{mission.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-blue-300 mb-1">
                              <span>Progress: {progress.completed}/{progress.total}</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="space-y-3">
                  {missionState.completedMissions.length === 0 ? (
                    <div className="text-center text-orange-300 mt-8">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-mono mb-2">No Completed Missions</h3>
                      <p className="text-orange-400">Complete your first mission to see it here.</p>
                    </div>
                  ) : (
                    missionState.completedMissions.map(mission => (
                      <div
                        key={mission.id}
                        className={`bg-green-900/20 border border-green-400/30 rounded-lg p-4 cursor-pointer hover:bg-green-900/30 transition-colors ${
                          selectedMission?.id === mission.id ? 'ring-2 ring-green-400' : ''
                        }`}
                        onClick={() => setSelectedMission(mission)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <h4 className="text-green-300 font-mono font-bold">{mission.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(mission.difficulty)} bg-black/50`}>
                              {mission.difficulty}
                            </span>
                          </div>
                          <div className="text-sm text-green-400">
                            {mission.completedAt && (
                              <span>Completed {mission.completedAt.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <p className="text-green-400 text-sm">{mission.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">💰</span>
                            <span className="text-green-300">{formatCurrency(mission.reward)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="text-green-300">{mission.skillPointReward} SP</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mission Details Panel */}
          <div className="w-80 border-l border-orange-400/30 bg-black/50 p-4">
            {selectedMission ? (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-orange-400" />
                  <h3 className="text-orange-300 font-mono font-bold text-lg">
                    {selectedMission.name}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-orange-400 font-mono text-sm font-bold mb-2">Description</h4>
                    <p className="text-orange-300 text-sm">
                      {selectedMission.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-orange-400">Difficulty:</span>
                      <div className={`font-mono ${getDifficultyColor(selectedMission.difficulty)}`}>
                        {selectedMission.difficulty}
                      </div>
                    </div>
                    <div>
                      <span className="text-orange-400">Time Limit:</span>
                      <div className="text-orange-300 font-mono">{selectedMission.timeLimit}m</div>
                    </div>
                    <div>
                      <span className="text-orange-400">Reward:</span>
                      <div className="text-orange-300 font-mono">{formatCurrency(selectedMission.reward)}</div>
                    </div>
                    <div>
                      <span className="text-orange-400">Skill Points:</span>
                      <div className="text-orange-300 font-mono">{selectedMission.skillPointReward} SP</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-orange-400 font-mono text-sm font-bold mb-2">Requirements</h4>
                    <div className="space-y-2">
                      {selectedMission.requirements.map((requirement, index) => {
                        const isCompleted = selectedMission.status === 'active' 
                          ? getRequirementProgress(selectedMission, index)
                          : selectedMission.status === 'completed';
                        
                        return (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            {isCompleted ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <div className="w-3 h-3 border border-orange-400 rounded-full" />
                            )}
                            <span className={isCompleted ? 'text-green-300' : 'text-orange-300'}>
                              {requirement.description}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedMission.status === 'active' && selectedMission.expiresAt && (
                    <div className="p-3 bg-yellow-900/20 border border-yellow-400/30 rounded">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-sm">
                          Time Remaining: {formatTimeRemaining(selectedMission.expiresAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4 border-t border-orange-400/30">
                    {selectedMission.status === 'available' ? (
                      <button
                        onClick={() => handleAcceptMission(selectedMission.id)}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-black font-mono font-bold py-2 px-4 rounded transition-colors"
                      >
                        Accept Mission
                      </button>
                    ) : selectedMission.status === 'active' ? (
                      <div className="text-center text-blue-400 font-mono">
                        ⚡ Mission In Progress
                      </div>
                    ) : selectedMission.status === 'completed' ? (
                      <div className="text-center text-green-400 font-mono">
                        ✓ Mission Completed
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-orange-400 mt-8">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-mono mb-2">Select a Mission</h3>
                <p className="text-sm">
                  Click on any mission to view details and requirements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionsPanel;