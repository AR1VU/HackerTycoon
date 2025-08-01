export interface Mission {
  id: string;
  name: string;
  description: string;
  reward: number; // ɄCoin reward
  skillPointReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  timeLimit: number; // in minutes
  requirements: MissionRequirement[];
  status: 'available' | 'active' | 'completed' | 'failed' | 'expired';
  acceptedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

export interface MissionRequirement {
  type: 'hack_vulnerability' | 'exfiltrate_file' | 'use_tool' | 'hack_count' | 'earn_crypto';
  target?: string; // vulnerability level, tool name, etc.
  count?: number;
  description: string;
  completed: boolean;
}

export interface MissionProgress {
  missionId: string;
  requirements: { [requirementIndex: number]: boolean };
  completed: boolean;
}

export interface MissionState {
  availableMissions: Mission[];
  activeMissions: Mission[];
  completedMissions: Mission[];
  missionProgress: { [missionId: string]: MissionProgress };
}