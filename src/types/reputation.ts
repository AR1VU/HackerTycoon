export interface ReputationState {
  level: number; // 0-100
  rank: ReputationRank;
  title: string;
  events: ReputationEvent[];
  penalties: ReputationPenalty[];
  lastEventTime: number;
  jailTimeEnd: number | null; // Timestamp when jail time ends
}

export interface ReputationEvent {
  id: string;
  type: 'gain' | 'loss';
  amount: number;
  reason: string;
  timestamp: Date;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface ReputationPenalty {
  id: string;
  type: 'price_increase' | 'trace_speed' | 'mission_reduction' | 'tool_lock';
  severity: number; // Multiplier for penalty effect
  expiresAt: Date | null; // null for permanent penalties
  description: string;
}

export interface ReputationRank {
  id: string;
  name: string;
  title: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  benefits: string[];
  penalties: string[];
}

export interface RandomEvent {
  id: string;
  type: 'elite_invitation' | 'rival_attack' | 'market_discount' | 'market_ban' | 'tool_offer';
  title: string;
  description: string;
  reputationRequirement: { min: number; max: number };
  probability: number; // 0-1
  effects: RandomEventEffect[];
}

export interface RandomEventEffect {
  type: 'reputation' | 'trace' | 'coins' | 'mission_unlock' | 'market_modifier';
  value: number;
  description: string;
}