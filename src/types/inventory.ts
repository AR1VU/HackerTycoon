export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'exploit' | 'tool_upgrade' | 'gear' | 'script';
  price: number;
  owned: boolean;
  purchasedAt?: Date;
  effect: ItemEffect;
}

export interface ItemEffect {
  type: 'cooldown_reduction' | 'success_rate_boost' | 'scan_radius_increase' | 'stealth_boost' | 'auto_exploit';
  value: number;
  target?: string; // Tool ID for specific upgrades
  description: string;
}

export interface BlackMarketState {
  items: InventoryItem[];
  isOpen: boolean;
}

export interface PlayerInventory {
  items: InventoryItem[];
  totalValue: number;
}