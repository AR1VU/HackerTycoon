export interface CryptoWallet {
  balance: number;
  transactions: CryptoTransaction[];
}

export interface CryptoTransaction {
  id: string;
  type: 'earned' | 'spent' | 'market_gain' | 'market_loss';
  amount: number;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

export interface CryptoMarket {
  currentRate: number; // USD per ɄCoin
  lastUpdate: Date;
  history: MarketDataPoint[];
}

export interface MarketDataPoint {
  timestamp: Date;
  rate: number;
}

export interface CryptoState {
  wallet: CryptoWallet;
  market: CryptoMarket;
}