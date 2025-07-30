import { SkillNode, SkillTreeState, PlayerStats } from '../types/skills';

export const DEFAULT_SKILL_TREE: SkillNode[] = [
  // Scanning Branch
  {
    id: 'basic_scanning',
    name: 'Basic Network Scanning',
    description: 'Unlocks the ability to scan nearby network nodes',
    cost: 0,
    unlocked: true,
    purchased: true,
    dependencies: [],
    position: { x: 1, y: 2 },
    category: 'scanning',
    effect: {
      type: 'new_ability',
      description: 'Enables network scanning within 2 node radius'
    }
  },
  {
    id: 'advanced_scanning',
    name: 'Advanced Scanning',
    description: 'Increases scan radius and reveals more network details',
    cost: 3,
    unlocked: true,
    purchased: false,
    dependencies: ['basic_scanning'],
    position: { x: 2, y: 2 },
    category: 'scanning',
    effect: {
      type: 'passive_bonus',
      value: 3,
      description: 'Increases scan radius to 3 nodes'
    }
  },
  {
    id: 'deep_scan',
    name: 'Deep Network Analysis',
    description: 'Reveals vulnerability levels and security measures',
    cost: 5,
    unlocked: false,
    purchased: false,
    dependencies: ['advanced_scanning'],
    position: { x: 3, y: 2 },
    category: 'scanning',
    effect: {
      type: 'new_ability',
      description: 'Shows detailed security information for scanned nodes'
    }
  },

  // Attack Branch
  {
    id: 'basic_bruteforce',
    name: 'Basic Brute Force',
    description: 'Unlocks brute force attack capabilities',
    cost: 0,
    unlocked: true,
    purchased: true,
    dependencies: [],
    position: { x: 1, y: 1 },
    category: 'attack',
    effect: {
      type: 'new_ability',
      description: 'Enables brute force attacks on scanned targets'
    }
  },
  {
    id: 'faster_bruteforce',
    name: 'Optimized Brute Force',
    description: 'Reduces brute force attack time by 50%',
    cost: 4,
    unlocked: true,
    purchased: false,
    dependencies: ['basic_bruteforce'],
    position: { x: 2, y: 1 },
    category: 'attack',
    effect: {
      type: 'tool_upgrade',
      target: 'bruteforce',
      value: 0.5,
      description: 'Reduces brute force cooldown and execution time'
    }
  },
  {
    id: 'smart_bruteforce',
    name: 'Intelligent Dictionary',
    description: 'Improves brute force success rates significantly',
    cost: 6,
    unlocked: false,
    purchased: false,
    dependencies: ['faster_bruteforce'],
    position: { x: 3, y: 1 },
    category: 'attack',
    effect: {
      type: 'tool_upgrade',
      target: 'bruteforce',
      value: 1.5,
      description: 'Multiplies brute force success rates by 1.5x'
    }
  },

  // Stealth Branch
  {
    id: 'basic_stealth',
    name: 'Stealth Protocols',
    description: 'Reduces detection risk during attacks',
    cost: 2,
    unlocked: true,
    purchased: false,
    dependencies: [],
    position: { x: 1, y: 3 },
    category: 'stealth',
    effect: {
      type: 'passive_bonus',
      value: 0.8,
      description: 'Reduces chance of triggering security alerts'
    }
  },
  {
    id: 'advanced_bypass',
    name: 'Advanced Firewall Bypass',
    description: 'Unlocks enhanced bypass capabilities',
    cost: 5,
    unlocked: false,
    purchased: false,
    dependencies: ['basic_stealth'],
    position: { x: 2, y: 3 },
    category: 'stealth',
    effect: {
      type: 'tool_upgrade',
      target: 'bypass',
      value: 1.3,
      description: 'Improves bypass success rates and reduces cooldown'
    }
  },
  {
    id: 'ghost_mode',
    name: 'Ghost Protocol',
    description: 'Become nearly undetectable during operations',
    cost: 8,
    unlocked: false,
    purchased: false,
    dependencies: ['advanced_bypass'],
    position: { x: 3, y: 3 },
    category: 'stealth',
    effect: {
      type: 'passive_bonus',
      value: 0.1,
      description: 'Minimal detection risk for all operations'
    }
  },

  // Automation Branch
  {
    id: 'file_scanner',
    name: 'Automated File Scanner',
    description: 'Automatically identifies valuable files',
    cost: 3,
    unlocked: true,
    purchased: false,
    dependencies: [],
    position: { x: 1, y: 4 },
    category: 'automation',
    effect: {
      type: 'new_ability',
      description: 'Highlights sensitive files when browsing systems'
    }
  },
  {
    id: 'auto_downloader',
    name: 'Auto File Downloader',
    description: 'Automatically downloads sensitive files when bypassing systems',
    cost: 6,
    unlocked: false,
    purchased: false,
    dependencies: ['file_scanner'],
    position: { x: 2, y: 4 },
    category: 'automation',
    effect: {
      type: 'new_ability',
      description: 'Automatically grabs valuable files during bypass operations'
    }
  },
  {
    id: 'mass_exploitation',
    name: 'Mass Exploitation',
    description: 'Execute attacks on multiple targets simultaneously',
    cost: 10,
    unlocked: false,
    purchased: false,
    dependencies: ['auto_downloader'],
    position: { x: 3, y: 4 },
    category: 'automation',
    effect: {
      type: 'new_ability',
      description: 'Target multiple nodes with a single command'
    }
  }
];

export const getDefaultPlayerStats = (): PlayerStats => ({
  skillPoints: 0,
  totalPointsEarned: 0,
  hacksCompleted: 0,
  scanRadius: 2,
  autoDownloadEnabled: false,
  bruteforceSpeedMultiplier: 1.0
});

export const canPurchaseSkill = (skill: SkillNode, skillTree: SkillNode[], skillPoints: number): boolean => {
  // Check if we have enough skill points
  if (skillPoints < skill.cost) return false;
  
  // Check if skill is already purchased
  if (skill.purchased) return false;
  
  // Check if all dependencies are purchased
  return skill.dependencies.every(depId => {
    const dependency = skillTree.find(s => s.id === depId);
    return dependency && dependency.purchased;
  });
};

export const purchaseSkill = (skillId: string, skillTree: SkillNode[], skillPoints: number): {
  updatedTree: SkillNode[];
  remainingPoints: number;
  success: boolean;
} => {
  const skill = skillTree.find(s => s.id === skillId);
  
  if (!skill || !canPurchaseSkill(skill, skillTree, skillPoints)) {
    return {
      updatedTree: skillTree,
      remainingPoints: skillPoints,
      success: false
    };
  }
  
  const updatedTree = skillTree.map(s => {
    if (s.id === skillId) {
      return { ...s, purchased: true };
    }
    
    // Unlock skills that now have all dependencies met
    if (!s.unlocked && s.dependencies.every(depId => {
      const dep = skillTree.find(d => d.id === depId);
      return dep && (dep.purchased || depId === skillId);
    })) {
      return { ...s, unlocked: true };
    }
    
    return s;
  });
  
  return {
    updatedTree,
    remainingPoints: skillPoints - skill.cost,
    success: true
  };
};

export const calculatePlayerStats = (skillTree: SkillNode[]): Partial<PlayerStats> => {
  const stats: Partial<PlayerStats> = {};
  
  skillTree.forEach(skill => {
    if (!skill.purchased) return;
    
    switch (skill.id) {
      case 'advanced_scanning':
        stats.scanRadius = 3;
        break;
      case 'deep_scan':
        stats.scanRadius = Math.max(stats.scanRadius || 2, 4);
        break;
      case 'auto_downloader':
        stats.autoDownloadEnabled = true;
        break;
      case 'faster_bruteforce':
        stats.bruteforceSpeedMultiplier = 0.5;
        break;
    }
  });
  
  return stats;
};

export const awardSkillPoints = (currentPoints: number, hacksCompleted: number): number => {
  // Award 1 point for every successful hack, with bonus points for milestones
  let newPoints = currentPoints;
  
  // Base point for completing a hack
  newPoints += 1;
  
  // Bonus points for milestones
  if (hacksCompleted % 10 === 0) newPoints += 2; // Every 10 hacks
  if (hacksCompleted % 25 === 0) newPoints += 5; // Every 25 hacks
  
  return newPoints;
};

export const getSkillTreeStats = (skillTree: SkillNode[]) => {
  const purchased = skillTree.filter(s => s.purchased).length;
  const unlocked = skillTree.filter(s => s.unlocked && !s.purchased).length;
  const locked = skillTree.filter(s => !s.unlocked).length;
  
  return { purchased, unlocked, locked, total: skillTree.length };
};