import { InventoryItem, BlackMarketState, PlayerInventory } from '../types/inventory';

export const DEFAULT_MARKET_ITEMS: InventoryItem[] = [
  {
    id: 'zero_day_ssh',
    name: 'SSH Zero-Day Exploit',
    description: 'Unpatched vulnerability in SSH protocol. Guarantees access to any system.',
    type: 'exploit',
    price: 2500,
    owned: false,
    effect: {
      type: 'success_rate_boost',
      value: 1.0, // 100% success rate
      target: 'bruteforce',
      description: 'Guarantees bruteforce success on any target'
    }
  },
  {
    id: 'quantum_bruteforce',
    name: 'Quantum Brute-Force Module',
    description: 'Advanced quantum computing module that reduces brute-force time by 80%.',
    type: 'tool_upgrade',
    price: 1800,
    owned: false,
    effect: {
      type: 'cooldown_reduction',
      value: 0.8, // 80% reduction
      target: 'bruteforce',
      description: 'Reduces bruteforce cooldown by 80%'
    }
  },
  {
    id: 'stealth_cloak',
    name: 'Firewall Cloaking Device',
    description: 'Military-grade stealth technology that makes you nearly invisible to security systems.',
    type: 'gear',
    price: 3200,
    owned: false,
    effect: {
      type: 'stealth_boost',
      value: 0.95, // 95% stealth
      description: 'Reduces detection risk by 95% for all operations'
    }
  },
  {
    id: 'neural_scanner',
    name: 'Neural Network Scanner',
    description: 'AI-powered scanner that can detect vulnerabilities across vast network ranges.',
    type: 'gear',
    price: 2200,
    owned: false,
    effect: {
      type: 'scan_radius_increase',
      value: 5, // Scan radius of 5
      description: 'Increases scan radius to 5 nodes'
    }
  },
  {
    id: 'auto_exploit_kit',
    name: 'Automated Exploitation Kit',
    description: 'Self-executing malware that automatically exploits discovered vulnerabilities.',
    type: 'script',
    price: 4000,
    owned: false,
    effect: {
      type: 'auto_exploit',
      value: 1,
      description: 'Automatically attempts to exploit scanned low-vulnerability targets'
    }
  },
  {
    id: 'ddos_amplifier',
    name: 'DDoS Amplification Module',
    description: 'Botnet controller that increases DDoS attack effectiveness and duration.',
    type: 'tool_upgrade',
    price: 1500,
    owned: false,
    effect: {
      type: 'cooldown_reduction',
      value: 0.6, // 60% reduction
      target: 'ddos',
      description: 'Reduces DDoS cooldown by 60% and doubles server downtime'
    }
  },
  {
    id: 'injection_framework',
    name: 'Advanced Injection Framework',
    description: 'Sophisticated code injection toolkit with polymorphic payloads.',
    type: 'tool_upgrade',
    price: 2800,
    owned: false,
    effect: {
      type: 'success_rate_boost',
      value: 0.4, // 40% boost
      target: 'inject',
      description: 'Increases injection success rate by 40%'
    }
  },
  {
    id: 'bypass_suite',
    name: 'Ultimate Bypass Suite',
    description: 'Collection of advanced firewall bypass techniques and zero-day exploits.',
    type: 'tool_upgrade',
    price: 3500,
    owned: false,
    effect: {
      type: 'success_rate_boost',
      value: 0.3, // 30% boost
      target: 'bypass',
      description: 'Increases bypass success rate by 30% and reduces cooldown'
    }
  }
];

export const createInitialBlackMarket = (): BlackMarketState => ({
  items: [...DEFAULT_MARKET_ITEMS],
  isOpen: false
});

export const createInitialInventory = (): PlayerInventory => ({
  items: [],
  totalValue: 0
});

export const purchaseItem = (
  itemId: string,
  marketItems: InventoryItem[],
  playerInventory: PlayerInventory,
  playerBalance: number
): {
  success: boolean;
  updatedMarket: InventoryItem[];
  updatedInventory: PlayerInventory;
  message: string;
} => {
  const item = marketItems.find(i => i.id === itemId);
  
  if (!item) {
    return {
      success: false,
      updatedMarket: marketItems,
      updatedInventory: playerInventory,
      message: 'Item not found'
    };
  }
  
  if (item.owned) {
    return {
      success: false,
      updatedMarket: marketItems,
      updatedInventory: playerInventory,
      message: 'Item already owned'
    };
  }
  
  if (playerBalance < item.price) {
    return {
      success: false,
      updatedMarket: marketItems,
      updatedInventory: playerInventory,
      message: 'Insufficient funds'
    };
  }
  
  const purchasedItem: InventoryItem = {
    ...item,
    owned: true,
    purchasedAt: new Date()
  };
  
  const updatedMarket = marketItems.map(i => 
    i.id === itemId ? purchasedItem : i
  );
  
  const updatedInventory: PlayerInventory = {
    items: [...playerInventory.items, purchasedItem],
    totalValue: playerInventory.totalValue + item.price
  };
  
  return {
    success: true,
    updatedMarket,
    updatedInventory,
    message: `Successfully purchased ${item.name}`
  };
};

export const getItemsByType = (inventory: PlayerInventory, type: InventoryItem['type']): InventoryItem[] => {
  return inventory.items.filter(item => item.type === type);
};

export const hasItem = (inventory: PlayerInventory, itemId: string): boolean => {
  return inventory.items.some(item => item.id === itemId);
};

export const getItemEffects = (inventory: PlayerInventory): {
  cooldownReductions: Record<string, number>;
  successRateBoosts: Record<string, number>;
  scanRadiusBonus: number;
  stealthBonus: number;
  hasAutoExploit: boolean;
} => {
  const effects = {
    cooldownReductions: {} as Record<string, number>,
    successRateBoosts: {} as Record<string, number>,
    scanRadiusBonus: 0,
    stealthBonus: 0,
    hasAutoExploit: false
  };
  
  inventory.items.forEach(item => {
    const effect = item.effect;
    
    switch (effect.type) {
      case 'cooldown_reduction':
        if (effect.target) {
          effects.cooldownReductions[effect.target] = Math.max(
            effects.cooldownReductions[effect.target] || 0,
            effect.value
          );
        }
        break;
      case 'success_rate_boost':
        if (effect.target) {
          effects.successRateBoosts[effect.target] = Math.max(
            effects.successRateBoosts[effect.target] || 0,
            effect.value
          );
        }
        break;
      case 'scan_radius_increase':
        effects.scanRadiusBonus = Math.max(effects.scanRadiusBonus, effect.value);
        break;
      case 'stealth_boost':
        effects.stealthBonus = Math.max(effects.stealthBonus, effect.value);
        break;
      case 'auto_exploit':
        effects.hasAutoExploit = true;
        break;
    }
  });
  
  return effects;
};

export const formatItemType = (type: InventoryItem['type']): string => {
  switch (type) {
    case 'exploit': return 'Zero-Day Exploit';
    case 'tool_upgrade': return 'Tool Upgrade';
    case 'gear': return 'Equipment';
    case 'script': return 'Script';
    default: return 'Unknown';
  }
};

export const getItemTypeIcon = (type: InventoryItem['type']): string => {
  switch (type) {
    case 'exploit': return '🔓';
    case 'tool_upgrade': return '⚡';
    case 'gear': return '🛡️';
    case 'script': return '📜';
    default: return '❓';
  }
};