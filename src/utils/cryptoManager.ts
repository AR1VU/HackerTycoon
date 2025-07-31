import { CryptoWallet, CryptoTransaction, CryptoMarket, MarketDataPoint } from '../types/crypto';

const INITIAL_BALANCE = 500;
const BASE_RATE = 12.50; // Base USD per ɄCoin
const MARKET_UPDATE_INTERVAL = 60000; // 1 minute

export const createInitialWallet = (): CryptoWallet => ({
  balance: INITIAL_BALANCE,
  transactions: [
    {
      id: generateTransactionId(),
      type: 'earned',
      amount: INITIAL_BALANCE,
      description: 'Initial wallet setup',
      timestamp: new Date(),
      balanceAfter: INITIAL_BALANCE
    }
  ]
});

export const createInitialMarket = (): CryptoMarket => ({
  currentRate: BASE_RATE,
  lastUpdate: new Date(),
  history: [
    {
      timestamp: new Date(),
      rate: BASE_RATE
    }
  ]
});

export const generateTransactionId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const addTransaction = (
  wallet: CryptoWallet,
  type: CryptoTransaction['type'],
  amount: number,
  description: string
): CryptoWallet => {
  const newBalance = wallet.balance + (type === 'spent' ? -amount : amount);
  
  const transaction: CryptoTransaction = {
    id: generateTransactionId(),
    type,
    amount: Math.abs(amount),
    description,
    timestamp: new Date(),
    balanceAfter: newBalance
  };

  return {
    balance: newBalance,
    transactions: [transaction, ...wallet.transactions].slice(0, 50) // Keep last 50 transactions
  };
};

export const updateMarketRate = (market: CryptoMarket): CryptoMarket => {
  // Generate realistic market fluctuation (-5% to +5%)
  const fluctuation = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
  const newRate = Math.max(1, market.currentRate * (1 + fluctuation));
  
  const dataPoint: MarketDataPoint = {
    timestamp: new Date(),
    rate: newRate
  };

  return {
    currentRate: newRate,
    lastUpdate: new Date(),
    history: [dataPoint, ...market.history].slice(0, 100) // Keep last 100 data points
  };
};

export const calculateHackReward = (vulnerability: 'Low' | 'Medium' | 'High', toolUsed: string): number => {
  const baseRewards = {
    'Low': 50,
    'Medium': 100,
    'High': 200
  };

  const toolMultipliers: Record<string, number> = {
    'bruteforce': 1.0,
    'ddos': 0.8,
    'inject': 1.5,
    'bypass': 1.2
  };

  const baseReward = baseRewards[vulnerability];
  const multiplier = toolMultipliers[toolUsed] || 1.0;
  const randomBonus = Math.random() * 0.5 + 0.75; // 0.75x to 1.25x

  return Math.floor(baseReward * multiplier * randomBonus);
};

export const formatCurrency = (amount: number): string => {
  return `Ʉ${amount.toLocaleString()}`;
};

export const formatUSD = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const getTransactionIcon = (type: CryptoTransaction['type']): string => {
  switch (type) {
    case 'earned': return '💰';
    case 'spent': return '💸';
    case 'market_gain': return '📈';
    case 'market_loss': return '📉';
    default: return '💱';
  }
};

export const getTransactionColor = (type: CryptoTransaction['type']): string => {
  switch (type) {
    case 'earned': return 'text-green-400';
    case 'spent': return 'text-red-400';
    case 'market_gain': return 'text-blue-400';
    case 'market_loss': return 'text-orange-400';
    default: return 'text-gray-400';
  }
};

export const startMarketUpdates = (
  onUpdate: (market: CryptoMarket) => void,
  initialMarket: CryptoMarket
): () => void => {
  let currentMarket = initialMarket;
  
  const interval = setInterval(() => {
    currentMarket = updateMarketRate(currentMarket);
    onUpdate(currentMarket);
  }, MARKET_UPDATE_INTERVAL);

  return () => clearInterval(interval);
};