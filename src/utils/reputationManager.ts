import { ReputationState, ReputationEvent, ReputationRank, ReputationPenalty, RandomEvent, RandomEventEffect } from '../types/reputation';
import { CryptoWallet } from '../types/crypto';
import { HackingTool } from '../types/tools';
import { addTransaction } from './cryptoManager';

export const REPUTATION_RANKS: ReputationRank[] = [
  {
    id: 'script_kiddie',
    name: 'Script Kiddie',
    title: 'Script Kiddie',
    minLevel: 0,
    maxLevel: 15,
    color: 'text-gray-400',
    benefits: [],
    penalties: ['50% higher black market prices', 'Limited mission access']
  },
  {
    id: 'wannabe',
    name: 'Wannabe Hacker',
    title: 'Wannabe',
    minLevel: 16,
    maxLevel: 30,
    color: 'text-red-400',
    benefits: ['Basic mission access'],
    penalties: ['25% higher black market prices']
  },
  {
    id: 'novice',
    name: 'Novice Hacker',
    title: 'Novice',
    minLevel: 31,
    maxLevel: 50,
    color: 'text-yellow-400',
    benefits: ['Standard mission access', 'Normal market prices'],
    penalties: []
  },
  {
    id: 'skilled',
    name: 'Skilled Hacker',
    title: 'Skilled',
    minLevel: 51,
    maxLevel: 70,
    color: 'text-blue-400',
    benefits: ['Advanced missions', '10% market discount', 'Faster skill point gain'],
    penalties: []
  },
  {
    id: 'expert',
    name: 'Expert Hacker',
    title: 'Expert',
    minLevel: 71,
    maxLevel: 85,
    color: 'text-purple-400',
    benefits: ['Elite missions', '20% market discount', 'Exclusive tools', 'Reduced trace accumulation'],
    penalties: []
  },
  {
    id: 'elite',
    name: 'Elite Hacker',
    title: 'Elite',
    minLevel: 86,
    maxLevel: 100,
    color: 'text-green-400',
    benefits: ['Legendary missions', '30% market discount', 'All tools unlocked', 'Minimal trace risk'],
    penalties: []
  }
];

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'elite_invitation',
    type: 'elite_invitation',
    title: 'Elite Forum Invitation',
    description: 'A mysterious contact offers access to an exclusive hacker forum with high-paying contracts.',
    reputationRequirement: { min: 60, max: 100 },
    probability: 0.15,
    effects: [
      { type: 'reputation', value: 5, description: 'Reputation boost from elite recognition' },
      { type: 'mission_unlock', value: 1, description: 'Unlock exclusive high-value mission' }
    ]
  },
  {
    id: 'rival_attack',
    type: 'rival_attack',
    title: 'Rival Hacker Attack',
    description: 'A jealous rival has launched a counter-attack on your systems, increasing your trace level.',
    reputationRequirement: { min: 40, max: 100 },
    probability: 0.1,
    effects: [
      { type: 'trace', value: 25, description: 'Trace level increased by rival attack' },
      { type: 'reputation', value: -3, description: 'Reputation damaged by security breach' }
    ]
  },
  {
    id: 'market_discount',
    type: 'market_discount',
    title: 'Black Market Appreciation',
    description: 'Your reputation has earned you a special discount from underground vendors.',
    reputationRequirement: { min: 50, max: 100 },
    probability: 0.2,
    effects: [
      { type: 'market_modifier', value: -0.3, description: '30% discount on all items for 24 hours' }
    ]
  },
  {
    id: 'market_ban',
    type: 'market_ban',
    title: 'Market Suspicion',
    description: 'Your recent activities have made black market vendors suspicious. Prices are increased.',
    reputationRequirement: { min: 0, max: 30 },
    probability: 0.25,
    effects: [
      { type: 'market_modifier', value: 0.5, description: '50% price increase for 12 hours' },
      { type: 'reputation', value: -2, description: 'Reputation damaged by market distrust' }
    ]
  },
  {
    id: 'tool_offer',
    type: 'tool_offer',
    title: 'Rare Tool Opportunity',
    description: 'A contact offers you a rare hacking tool at a significant discount.',
    reputationRequirement: { min: 45, max: 100 },
    probability: 0.12,
    effects: [
      { type: 'coins', value: -500, description: 'Special tool purchase cost' },
      { type: 'reputation', value: 3, description: 'Reputation boost from rare acquisition' }
    ]
  }
];

export const createInitialReputationState = (): ReputationState => ({
  level: 25, // Start as Wannabe
  rank: REPUTATION_RANKS[1],
  title: 'Wannabe',
  events: [],
  penalties: [],
  lastEventTime: Date.now(),
  jailTimeEnd: null
});

export const updateReputation = (
  currentState: ReputationState,
  change: number,
  reason: string,
  severity: ReputationEvent['severity'] = 'moderate'
): ReputationState => {
  const newLevel = Math.max(0, Math.min(100, currentState.level + change));
  const newRank = getRankForLevel(newLevel);
  
  const event: ReputationEvent = {
    id: generateEventId(),
    type: change > 0 ? 'gain' : 'loss',
    amount: Math.abs(change),
    reason,
    timestamp: new Date(),
    severity
  };

  return {
    ...currentState,
    level: newLevel,
    rank: newRank,
    title: newRank.title,
    events: [event, ...currentState.events].slice(0, 20) // Keep last 20 events
  };
};

export const getRankForLevel = (level: number): ReputationRank => {
  return REPUTATION_RANKS.find(rank => level >= rank.minLevel && level <= rank.maxLevel) || REPUTATION_RANKS[0];
};

export const applyGameOverPenalties = (
  reputationState: ReputationState,
  wallet: CryptoWallet,
  tools: HackingTool[]
): {
  updatedReputation: ReputationState;
  updatedWallet: CryptoWallet;
  updatedTools: HackingTool[];
  penaltyMessage: string[];
} => {
  // Calculate penalties based on current reputation
  const coinLossPercentage = reputationState.level > 50 ? 0.15 : 0.25; // Higher rep = less loss
  const coinLoss = Math.floor(wallet.balance * coinLossPercentage);
  const reputationLoss = reputationState.level > 50 ? -15 : -25;
  const jailTimeHours = reputationState.level > 50 ? 2 : 4; // 2-4 hours jail time
  
  // Apply coin loss
  const updatedWallet = addTransaction(
    wallet,
    'spent',
    coinLoss,
    'Seized assets due to capture'
  );

  // Apply reputation loss
  const updatedReputation = updateReputation(
    reputationState,
    reputationLoss,
    'Captured by authorities',
    'critical'
  );

  // Set jail time
  updatedReputation.jailTimeEnd = Date.now() + (jailTimeHours * 60 * 60 * 1000);

  // Lock some tools temporarily (for lower reputation players)
  const updatedTools = tools.map(tool => {
    if (reputationState.level < 40 && Math.random() < 0.3) {
      return { ...tool, unlocked: false };
    }
    return tool;
  });

  const penaltyMessage = [
    '🚨 CAPTURED BY AUTHORITIES 🚨',
    '',
    `💰 Assets Seized: ${coinLoss} ɄCoins (${Math.round(coinLossPercentage * 100)}%)`,
    `📉 Reputation Lost: ${Math.abs(reputationLoss)} points`,
    `⏰ Jail Time: ${jailTimeHours} hours`,
    reputationState.level < 40 ? '🔒 Some tools temporarily locked' : '',
    '',
    'Your criminal activities have caught up with you.',
    'Use this time to plan your next moves carefully.'
  ].filter(Boolean);

  return {
    updatedReputation,
    updatedWallet,
    updatedTools,
    penaltyMessage
  };
};

export const checkJailTime = (reputationState: ReputationState): boolean => {
  if (!reputationState.jailTimeEnd) return false;
  return Date.now() < reputationState.jailTimeEnd;
};

export const getRemainingJailTime = (reputationState: ReputationState): number => {
  if (!reputationState.jailTimeEnd) return 0;
  return Math.max(0, reputationState.jailTimeEnd - Date.now());
};

export const formatJailTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const triggerRandomEvent = (
  reputationState: ReputationState,
  wallet: CryptoWallet
): {
  event: RandomEvent | null;
  updatedReputation: ReputationState;
  updatedWallet: CryptoWallet;
  message: string[];
} => {
  // Check if enough time has passed since last event (minimum 10 minutes)
  const timeSinceLastEvent = Date.now() - reputationState.lastEventTime;
  if (timeSinceLastEvent < 10 * 60 * 1000) {
    return {
      event: null,
      updatedReputation: reputationState,
      updatedWallet: wallet,
      message: []
    };
  }

  // Find eligible events based on reputation
  const eligibleEvents = RANDOM_EVENTS.filter(event => 
    reputationState.level >= event.reputationRequirement.min &&
    reputationState.level <= event.reputationRequirement.max
  );

  if (eligibleEvents.length === 0) {
    return {
      event: null,
      updatedReputation: reputationState,
      updatedWallet: wallet,
      message: []
    };
  }

  // Check if any event should trigger
  const triggeredEvent = eligibleEvents.find(event => Math.random() < event.probability);
  
  if (!triggeredEvent) {
    return {
      event: null,
      updatedReputation: { ...reputationState, lastEventTime: Date.now() },
      updatedWallet: wallet,
      message: []
    };
  }

  // Apply event effects
  let updatedReputation = { ...reputationState, lastEventTime: Date.now() };
  let updatedWallet = wallet;
  const message = [
    `🎲 RANDOM EVENT: ${triggeredEvent.title}`,
    '',
    triggeredEvent.description,
    '',
    'Effects:'
  ];

  triggeredEvent.effects.forEach(effect => {
    switch (effect.type) {
      case 'reputation':
        updatedReputation = updateReputation(
          updatedReputation,
          effect.value,
          triggeredEvent.title,
          Math.abs(effect.value) > 5 ? 'major' : 'moderate'
        );
        message.push(`${effect.value > 0 ? '📈' : '📉'} ${effect.description}`);
        break;
      case 'coins':
        if (effect.value !== 0) {
          updatedWallet = addTransaction(
            updatedWallet,
            effect.value > 0 ? 'earned' : 'spent',
            Math.abs(effect.value),
            triggeredEvent.title
          );
          message.push(`${effect.value > 0 ? '💰' : '💸'} ${effect.description}`);
        }
        break;
      default:
        message.push(`⚡ ${effect.description}`);
    }
  });

  return {
    event: triggeredEvent,
    updatedReputation,
    updatedWallet,
    message
  };
};

export const getMarketPriceModifier = (reputationState: ReputationState): number => {
  const rank = reputationState.rank;
  
  // Base modifier from reputation rank
  let modifier = 1.0;
  
  switch (rank.id) {
    case 'script_kiddie':
      modifier = 1.5; // 50% higher prices
      break;
    case 'wannabe':
      modifier = 1.25; // 25% higher prices
      break;
    case 'novice':
      modifier = 1.0; // Normal prices
      break;
    case 'skilled':
      modifier = 0.9; // 10% discount
      break;
    case 'expert':
      modifier = 0.8; // 20% discount
      break;
    case 'elite':
      modifier = 0.7; // 30% discount
      break;
  }

  // Apply temporary penalties from events
  reputationState.penalties.forEach(penalty => {
    if (penalty.type === 'price_increase' && (!penalty.expiresAt || penalty.expiresAt > new Date())) {
      modifier *= (1 + penalty.severity);
    }
  });

  return modifier;
};

export const getTraceSpeedModifier = (reputationState: ReputationState): number => {
  const rank = reputationState.rank;
  
  // Lower reputation = faster trace accumulation
  let modifier = 1.0;
  
  switch (rank.id) {
    case 'script_kiddie':
      modifier = 1.5; // 50% faster trace
      break;
    case 'wannabe':
      modifier = 1.25; // 25% faster trace
      break;
    case 'novice':
      modifier = 1.0; // Normal trace speed
      break;
    case 'skilled':
      modifier = 0.9; // 10% slower trace
      break;
    case 'expert':
      modifier = 0.8; // 20% slower trace
      break;
    case 'elite':
      modifier = 0.7; // 30% slower trace
      break;
  }

  return modifier;
};

export const getMissionAvailabilityModifier = (reputationState: ReputationState): number => {
  const rank = reputationState.rank;
  
  switch (rank.id) {
    case 'script_kiddie':
      return 0.3; // Only 30% of missions available
    case 'wannabe':
      return 0.5; // 50% of missions available
    case 'novice':
      return 0.7; // 70% of missions available
    case 'skilled':
      return 0.9; // 90% of missions available
    case 'expert':
    case 'elite':
      return 1.0; // All missions available
    default:
      return 0.5;
  }
};

const generateEventId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const getReputationSummary = (reputationState: ReputationState): string[] => {
  const rank = reputationState.rank;
  const nextRank = REPUTATION_RANKS.find(r => r.minLevel > reputationState.level);
  const progressToNext = nextRank ? 
    Math.round(((reputationState.level - rank.minLevel) / (nextRank.minLevel - rank.minLevel)) * 100) : 100;

  const summary = [
    '╔══════════════════════════════════════════════════════════════╗',
    '║                    REPUTATION STATUS                         ║',
    '╚══════════════════════════════════════════════════════════════╝',
    '',
    `Current Rank: ${rank.name} (${reputationState.level}/100)`,
    `Title: ${rank.title}`,
    nextRank ? `Progress to ${nextRank.name}: ${progressToNext}%` : 'Maximum rank achieved!',
    '',
    '🎯 Benefits:',
    ...rank.benefits.map(benefit => `  • ${benefit}`),
    ''
  ];

  if (rank.penalties.length > 0) {
    summary.push('⚠️  Penalties:');
    summary.push(...rank.penalties.map(penalty => `  • ${penalty}`));
    summary.push('');
  }

  if (reputationState.events.length > 0) {
    summary.push('📊 Recent Events:');
    reputationState.events.slice(0, 5).forEach(event => {
      const icon = event.type === 'gain' ? '📈' : '📉';
      summary.push(`  ${icon} ${event.reason} (${event.type === 'gain' ? '+' : '-'}${event.amount})`);
    });
  }

  return summary;
};