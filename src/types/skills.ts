export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  purchased: boolean;
  dependencies: string[]; // IDs of required skills
  position: { x: number; y: number }; // For visual layout
  category: 'scanning' | 'attack' | 'stealth' | 'automation';
  effect: SkillEffect;
}

export interface SkillEffect {
  type: 'tool_upgrade' | 'new_ability' | 'passive_bonus';
  target?: string; // Tool ID for upgrades
  value?: number | string;
  description: string;
}

export interface SkillTreeState {
  nodes: SkillNode[];
  skillPoints: number;
  totalPointsEarned: number;
}

export interface PlayerStats {
  skillPoints: number;
  totalPointsEarned: number;
  hacksCompleted: number;
  scanRadius: number;
  autoDownloadEnabled: boolean;
  bruteforceSpeedMultiplier: number;
}
</SkillEffect>

export interface SkillTreeState {
  nodes: SkillNode[];
  skillPoints: number;
  totalPointsEarned: number;
}

export interface PlayerStats {
  skillPoints: number;
  totalPointsEarned: number;
  hacksCompleted: number;
  scanRadius: number;
  autoDownloadEnabled: boolean;
  bruteforceSpeedMultiplier: number;
}