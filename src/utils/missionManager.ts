import { Mission, MissionRequirement, MissionState, MissionProgress } from '../types/missions';
import { NetworkNode } from '../types/network';
import { DownloadedFile } from '../types/filesystem';

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'first_hack',
    name: 'First Blood',
    description: 'Complete your first successful hack on any network node.',
    reward: 200,
    skillPointReward: 2,
    difficulty: 'Easy',
    timeLimit: 30,
    requirements: [
      {
        type: 'hack_count',
        count: 1,
        description: 'Successfully hack 1 network node',
        completed: false
      }
    ],
    status: 'available'
  },
  {
    id: 'high_value_target',
    name: 'High Value Target',
    description: 'Infiltrate a high-security network node and prove your skills.',
    reward: 500,
    skillPointReward: 3,
    difficulty: 'Medium',
    timeLimit: 45,
    requirements: [
      {
        type: 'hack_vulnerability',
        target: 'High',
        description: 'Successfully hack a High vulnerability node',
        completed: false
      }
    ],
    status: 'available'
  },
  {
    id: 'data_exfiltration',
    name: 'Corporate Espionage',
    description: 'Steal sensitive corporate data by downloading files from compromised systems.',
    reward: 750,
    skillPointReward: 4,
    difficulty: 'Medium',
    timeLimit: 60,
    requirements: [
      {
        type: 'exfiltrate_file',
        count: 3,
        description: 'Download 3 files from compromised systems',
        completed: false
      }
    ],
    status: 'available'
  },
  {
    id: 'stealth_master',
    name: 'Ghost in the Machine',
    description: 'Use advanced bypass techniques to infiltrate systems undetected.',
    reward: 1000,
    skillPointReward: 5,
    difficulty: 'Hard',
    timeLimit: 90,
    requirements: [
      {
        type: 'use_tool',
        target: 'bypass',
        count: 5,
        description: 'Successfully use bypass tool 5 times',
        completed: false
      }
    ],
    status: 'available'
  },
  {
    id: 'crypto_heist',
    name: 'Digital Bank Robbery',
    description: 'Accumulate a significant amount of ɄCoin through successful operations.',
    reward: 2000,
    skillPointReward: 8,
    difficulty: 'Hard',
    timeLimit: 120,
    requirements: [
      {
        type: 'earn_crypto',
        count: 1500,
        description: 'Earn 1500 ɄCoin from hacking activities',
        completed: false
      }
    ],
    status: 'available'
  },
  {
    id: 'network_domination',
    name: 'Network Overlord',
    description: 'Demonstrate complete network mastery by compromising multiple systems.',
    reward: 3000,
    skillPointReward: 10,
    difficulty: 'Expert',
    timeLimit: 180,
    requirements: [
      {
        type: 'hack_count',
        count: 15,
        description: 'Successfully hack 15 network nodes',
        completed: false
      },
      {
        type: 'hack_vulnerability',
        target: 'High',
        count: 5,
        description: 'Hack 5 High vulnerability nodes',
        completed: false
      }
    ],
    status: 'available'
  },
  {
    id: 'tool_specialist',
    name: 'Arsenal Master',
    description: 'Prove your expertise with all available hacking tools.',
    reward: 1500,
    skillPointReward: 6,
    difficulty: 'Hard',
    timeLimit: 150,
    requirements: [
      {
        type: 'use_tool',
        target: 'bruteforce',
        count: 3,
        description: 'Use bruteforce tool 3 times successfully',
        completed: false
      },
      {
        type: 'use_tool',
        target: 'ddos',
        count: 2,
        description: 'Use DDoS tool 2 times successfully',
        completed: false
      },
      {
        type: 'use_tool',
        target: 'inject',
        count: 2,
        description: 'Use injection tool 2 times successfully',
        completed: false
      },
      {
        type: 'use_tool',
        target: 'bypass',
        count: 3,
        description: 'Use bypass tool 3 times successfully',
        completed: false
      }
    ],
    status: 'available'
  }
];

export const createInitialMissionState = (): MissionState => ({
  availableMissions: [...DEFAULT_MISSIONS],
  activeMissions: [],
  completedMissions: [],
  missionProgress: {}
});

export const acceptMission = (missionId: string, missionState: MissionState): MissionState => {
  const mission = missionState.availableMissions.find(m => m.id === missionId);
  if (!mission) {
    return missionState;
  }

  const now = new Date();
  const acceptedMission: Mission = {
    ...mission,
    status: 'active',
    acceptedAt: now,
    expiresAt: new Date(now.getTime() + mission.timeLimit * 60 * 1000)
  };

  const progress: MissionProgress = {
    missionId,
    requirements: {},
    completed: false
  };

  return {
    ...missionState,
    availableMissions: missionState.availableMissions.filter(m => m.id !== missionId),
    activeMissions: [...missionState.activeMissions, acceptedMission],
    missionProgress: {
      ...missionState.missionProgress,
      [missionId]: progress
    }
  };
};

export const updateMissionProgress = (
  missionState: MissionState,
  eventType: 'hack_success' | 'file_download' | 'tool_use' | 'crypto_earn',
  eventData: {
    vulnerability?: 'Low' | 'Medium' | 'High';
    toolId?: string;
    fileName?: string;
    amount?: number;
  }
): MissionState => {
  const updatedActiveMissions = [...missionState.activeMissions];
  const updatedProgress = { ...missionState.missionProgress };
  const updatedCompletedMissions = [...missionState.completedMissions];
  let activeMissionsChanged = false;

  missionState.activeMissions.forEach((mission, missionIndex) => {
    const progress = updatedProgress[mission.id];
    if (!progress || progress.completed) return;

    let missionUpdated = false;

    mission.requirements.forEach((requirement, reqIndex) => {
      if (progress.requirements[reqIndex]) return; // Already completed

      let requirementMet = false;

      switch (requirement.type) {
        case 'hack_count':
          if (eventType === 'hack_success') {
            requirementMet = true;
          }
          break;

        case 'hack_vulnerability':
          if (eventType === 'hack_success' && eventData.vulnerability === requirement.target) {
            requirementMet = true;
          }
          break;

        case 'exfiltrate_file':
          if (eventType === 'file_download') {
            requirementMet = true;
          }
          break;

        case 'use_tool':
          if (eventType === 'tool_use' && eventData.toolId === requirement.target) {
            requirementMet = true;
          }
          break;

        case 'earn_crypto':
          if (eventType === 'crypto_earn' && eventData.amount && eventData.amount >= (requirement.count || 0)) {
            requirementMet = true;
          }
          break;
      }

      if (requirementMet) {
        progress.requirements[reqIndex] = true;
        missionUpdated = true;
      }
    });

    if (missionUpdated) {
      // Check if all requirements are completed
      const allCompleted = mission.requirements.every((_, index) => progress.requirements[index]);
      
      if (allCompleted) {
        progress.completed = true;
        const completedMission: Mission = {
          ...mission,
          status: 'completed',
          completedAt: new Date()
        };
        
        updatedCompletedMissions.push(completedMission);
        updatedActiveMissions.splice(missionIndex, 1);
        activeMissionsChanged = true;
      }
    }
  });

  return {
    ...missionState,
    activeMissions: activeMissionsChanged ? updatedActiveMissions.filter(Boolean) : missionState.activeMissions,
    completedMissions: updatedCompletedMissions,
    missionProgress: updatedProgress
  };
};

export const completeMission = (missionId: string, missionState: MissionState): {
  success: boolean;
  updatedMissionState: MissionState;
  mission: Mission | null;
} => {
  const mission = missionState.activeMissions.find(m => m.id === missionId);
  if (!mission) {
    return {
      success: false,
      updatedMissionState: missionState,
      mission: null
    };
  }
  
  const progress = missionState.missionProgress[missionId];
  const allRequirementsMet = progress && mission.requirements.every((_, index) => progress.requirements[index]);
  
  if (!allRequirementsMet) {
    return {
      success: false,
      updatedMissionState: missionState,
      mission
    };
  }
  
  const completedMission: Mission = {
    ...mission,
    status: 'completed',
    completedAt: new Date()
  };
  
  const updatedMissionState: MissionState = {
    ...missionState,
    activeMissions: missionState.activeMissions.filter(m => m.id !== missionId),
    completedMissions: [...missionState.completedMissions, completedMission]
  };
  
  return {
    success: true,
    updatedMissionState,
    mission: completedMission
  };
};

export const checkExpiredMissions = (missionState: MissionState): MissionState => {
  const now = new Date();
  const updatedActiveMissions: Mission[] = [];
  const updatedAvailableMissions = [...missionState.availableMissions];

  missionState.activeMissions.forEach(mission => {
    if (mission.expiresAt && now > mission.expiresAt) {
      // Mission expired, return to available
      const expiredMission: Mission = {
        ...mission,
        status: 'available',
        acceptedAt: undefined,
        expiresAt: undefined
      };
      updatedAvailableMissions.push(expiredMission);
    } else {
      updatedActiveMissions.push(mission);
    }
  });

  return {
    ...missionState,
    availableMissions: updatedAvailableMissions,
    activeMissions: updatedActiveMissions
  };
};

export const getMissionById = (missionId: string, missionState: MissionState): Mission | null => {
  return [...missionState.availableMissions, ...missionState.activeMissions, ...missionState.completedMissions]
    .find(m => m.id === missionId) || null;
};

export const formatTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const remaining = expiresAt.getTime() - now.getTime();
  
  if (remaining <= 0) return 'EXPIRED';
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

export const getDifficultyColor = (difficulty: Mission['difficulty']): string => {
  switch (difficulty) {
    case 'Easy': return 'text-green-400';
    case 'Medium': return 'text-yellow-400';
    case 'Hard': return 'text-red-400';
    case 'Expert': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

export const getMissionStats = (missionState: MissionState) => {
  return {
    available: missionState.availableMissions.length,
    active: missionState.activeMissions.length,
    completed: missionState.completedMissions.length,
    totalRewardsEarned: missionState.completedMissions.reduce((sum, m) => sum + m.reward, 0),
    totalSkillPointsEarned: missionState.completedMissions.reduce((sum, m) => sum + m.skillPointReward, 0)
  };
};