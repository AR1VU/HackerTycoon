import React, { useState } from 'react';
import { SkillNode, SkillTreeState } from '../types/skills';
import { Brain, Star, Lock, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { canPurchaseSkill, purchaseSkill, getSkillTreeStats } from '../utils/skillTree';

interface SkillTreePanelProps {
  skillTree: SkillTreeState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSkillTree: (skillTree: SkillNode[], skillPoints: number) => void;
}

const SkillTreePanel: React.FC<SkillTreePanelProps> = ({ 
  skillTree, 
  isOpen, 
  onClose, 
  onUpdateSkillTree 
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePurchaseSkill = (skillId: string) => {
    const result = purchaseSkill(skillId, skillTree.nodes, skillTree.skillPoints);
    if (result.success) {
      onUpdateSkillTree(result.updatedTree, result.remainingPoints);
      setSelectedSkill(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scanning': return 'text-blue-400 border-blue-400';
      case 'attack': return 'text-red-400 border-red-400';
      case 'stealth': return 'text-purple-400 border-purple-400';
      case 'automation': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'scanning': return 'bg-blue-900/20 hover:bg-blue-900/30';
      case 'attack': return 'bg-red-900/20 hover:bg-red-900/30';
      case 'stealth': return 'bg-purple-900/20 hover:bg-purple-900/30';
      case 'automation': return 'bg-green-900/20 hover:bg-green-900/30';
      default: return 'bg-gray-900/20 hover:bg-gray-900/30';
    }
  };

  const getSkillIcon = (skill: SkillNode) => {
    if (skill.purchased) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (!skill.unlocked) return <Lock className="w-4 h-4 text-gray-500" />;
    return <Star className="w-4 h-4 text-yellow-400" />;
  };

  const renderSkillConnections = () => {
    return skillTree.nodes.map(skill => 
      skill.dependencies.map(depId => {
        const dependency = skillTree.nodes.find(s => s.id === depId);
        if (!dependency) return null;

        const startX = dependency.position.x * 200 + 100;
        const startY = dependency.position.y * 120 + 60;
        const endX = skill.position.x * 200 + 100;
        const endY = skill.position.y * 120 + 60;

        return (
          <line
            key={`${depId}-${skill.id}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={skill.purchased ? '#10b981' : skill.unlocked ? '#fbbf24' : '#6b7280'}
            strokeWidth="2"
            strokeDasharray={skill.unlocked ? '0' : '5,5'}
          />
        );
      })
    ).flat();
  };

  if (!isOpen) return null;

  const stats = getSkillTreeStats(skillTree.nodes);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-yellow-400 rounded-lg w-full max-w-6xl h-[90vh] mx-4 shadow-2xl shadow-yellow-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-yellow-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="w-6 h-6 text-yellow-400" />
            <div>
              <span className="text-yellow-300 font-mono text-xl font-bold">
                Skill Tree
              </span>
              <div className="text-yellow-400 text-sm">
                {stats.purchased}/{stats.total} skills unlocked
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-mono text-lg font-bold">
                {skillTree.skillPoints} SP
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-yellow-400 hover:text-yellow-300 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Skill Tree Visualization */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="relative" style={{ width: '800px', height: '600px' }}>
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderSkillConnections()}
              </svg>

              {/* Skill Nodes */}
              {skillTree.nodes.map(skill => (
                <div
                  key={skill.id}
                  className={`absolute w-40 h-24 rounded-lg border-2 p-2 cursor-pointer transition-all duration-200 ${
                    getCategoryBg(skill.category)
                  } ${getCategoryColor(skill.category)} ${
                    selectedSkill?.id === skill.id ? 'ring-2 ring-yellow-400' : ''
                  } ${
                    skill.purchased ? 'opacity-100' : skill.unlocked ? 'opacity-90' : 'opacity-50'
                  }`}
                  style={{
                    left: `${skill.position.x * 200}px`,
                    top: `${skill.position.y * 120}px`,
                  }}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div className="flex items-center justify-between mb-1">
                    {getSkillIcon(skill)}
                    <div className="text-xs font-mono bg-black/50 px-1 rounded">
                      {skill.cost} SP
                    </div>
                  </div>
                  <div className="text-sm font-bold font-mono leading-tight">
                    {skill.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details Panel */}
          <div className="w-80 border-l border-yellow-400/30 bg-black/50 p-4">
            {selectedSkill ? (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  {getSkillIcon(selectedSkill)}
                  <h3 className="text-yellow-300 font-mono font-bold text-lg">
                    {selectedSkill.name}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-yellow-400 font-mono text-sm font-bold mb-2">Description</h4>
                    <p className="text-yellow-300 text-sm">
                      {selectedSkill.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-yellow-400 font-mono text-sm font-bold mb-2">Effect</h4>
                    <p className="text-yellow-300 text-sm">
                      {selectedSkill.effect.description}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">Cost:</span>
                    <span className="text-yellow-300 font-mono">{selectedSkill.cost} SP</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">Category:</span>
                    <span className={`font-mono capitalize ${getCategoryColor(selectedSkill.category).split(' ')[0]}`}>
                      {selectedSkill.category}
                    </span>
                  </div>

                  {selectedSkill.dependencies.length > 0 && (
                    <div>
                      <h4 className="text-yellow-400 font-mono text-sm font-bold mb-2">Requirements</h4>
                      <div className="space-y-1">
                        {selectedSkill.dependencies.map(depId => {
                          const dep = skillTree.nodes.find(s => s.id === depId);
                          return dep ? (
                            <div key={depId} className="flex items-center space-x-2 text-sm">
                              {dep.purchased ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Lock className="w-3 h-3 text-red-400" />
                              )}
                              <span className={dep.purchased ? 'text-green-300' : 'text-red-300'}>
                                {dep.name}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <div className="pt-4 border-t border-yellow-400/30">
                    {selectedSkill.purchased ? (
                      <div className="text-center text-green-400 font-mono">
                        ✓ Skill Acquired
                      </div>
                    ) : canPurchaseSkill(selectedSkill, skillTree.nodes, skillTree.skillPoints) ? (
                      <button
                        onClick={() => handlePurchaseSkill(selectedSkill.id)}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-mono font-bold py-2 px-4 rounded transition-colors"
                      >
                        Purchase Skill
                      </button>
                    ) : (
                      <div className="text-center text-gray-400 font-mono text-sm">
                        {skillTree.skillPoints < selectedSkill.cost 
                          ? 'Insufficient Skill Points' 
                          : 'Requirements Not Met'
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-yellow-400 mt-8">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-mono mb-2">Select a Skill</h3>
                <p className="text-sm">
                  Click on any skill node to view details and purchase options.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-yellow-400/30 bg-black/50">
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Purchased</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreePanel;