import React, { useState } from 'react';
import { CryptoWallet, CryptoMarket } from '../types/crypto';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { formatCurrency, formatUSD, getTransactionIcon, getTransactionColor } from '../utils/cryptoManager';

interface WalletPageProps {
  wallet: CryptoWallet;
  market: CryptoMarket;
}

const WalletPage: React.FC<WalletPageProps> = ({ wallet, market }) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'market'>('wallet');

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMarketTrend = (): { direction: 'up' | 'down' | 'neutral'; percentage: number } => {
    if (market.history.length < 2) return { direction: 'neutral', percentage: 0 };
    
    const current = market.history[0].rate;
    const previous = market.history[1].rate;
    const change = ((current - previous) / previous) * 100;
    
    return {
      direction: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'neutral',
      percentage: Math.abs(change)
    };
  };

  const usdValue = wallet.balance * market.currentRate;
  const trend = getMarketTrend();

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-yellow-400/30 rounded-lg shadow-2xl shadow-yellow-500/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-yellow-400/30 bg-black/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Wallet className="w-6 h-6 text-yellow-400" />
          <div>
            <span className="text-yellow-300 font-mono text-xl font-bold">
              ɄCoin Wallet & Market
            </span>
            <div className="text-yellow-400 text-sm">
              Balance: {formatCurrency(wallet.balance)} • Rate: {formatUSD(market.currentRate)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-yellow-400/30 bg-black/50">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 font-mono text-sm transition-colors flex items-center space-x-2 ${
                activeTab === 'wallet'
                  ? 'text-yellow-300 border-b-2 border-yellow-400'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-6 py-3 font-mono text-sm transition-colors flex items-center space-x-2 ${
                activeTab === 'market'
                  ? 'text-yellow-300 border-b-2 border-yellow-400'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Market</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-black">
            {activeTab === 'wallet' ? (
              <div>
                <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4">
                  Transaction History
                </h3>
                
                <div className="space-y-2">
                  {wallet.transactions.length === 0 ? (
                    <div className="text-center text-yellow-300 mt-8">
                      <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-mono mb-2">No Transactions Yet</h4>
                      <p className="text-yellow-400">
                        Complete hacks to earn ɄCoins!
                      </p>
                    </div>
                  ) : (
                    wallet.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-yellow-900/10 border border-yellow-400/20 rounded-lg p-3 hover:bg-yellow-900/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                            <div>
                              <div className="text-yellow-300 font-mono text-sm font-bold">
                                {transaction.description}
                              </div>
                              <div className="text-yellow-400 text-xs">
                                {formatTime(transaction.timestamp)} • ID: {transaction.id}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono font-bold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'spent' ? '-' : '+'}
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-yellow-400 text-xs">
                              Balance: {formatCurrency(transaction.balanceAfter)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4">
                  ɄCoin Market Data
                </h3>
                
                {/* Current Rate */}
                <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-300 font-mono text-2xl font-bold">
                      1Ʉ = {formatUSD(market.currentRate)}
                    </span>
                    <div className={`flex items-center space-x-1 text-lg ${
                      trend.direction === 'up' ? 'text-green-400' : 
                      trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {trend.direction === 'up' && <ArrowUpRight className="w-5 h-5" />}
                      {trend.direction === 'down' && <ArrowDownRight className="w-5 h-5" />}
                      <span>{trend.percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Last updated: {formatTime(market.lastUpdate)}
                  </div>
                </div>

                {/* Market History */}
                <div>
                  <h4 className="text-yellow-400 font-mono text-md font-bold mb-3">Recent Price History</h4>
                  <div className="space-y-2">
                    {market.history.slice(0, 10).map((dataPoint, index) => (
                      <div
                        key={index}
                        className="bg-yellow-900/10 border border-yellow-400/20 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="text-yellow-300 font-mono">
                          {formatUSD(dataPoint.rate)}
                        </div>
                        <div className="text-yellow-400 text-sm">
                          {formatTime(dataPoint.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-yellow-400/30 bg-black/50 p-4">
          {/* Balance */}
          <div className="mb-6">
            <h3 className="text-yellow-400 font-mono text-sm font-bold mb-2">Current Balance</h3>
            <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-300 font-mono mb-1">
                {formatCurrency(wallet.balance)}
              </div>
              <div className="text-yellow-400 text-sm">
                ≈ {formatUSD(usdValue)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-yellow-400 font-mono text-sm font-bold mb-2">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-300">Total Transactions:</span>
                <span className="text-yellow-400 font-mono">{wallet.transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-300">Total Earned:</span>
                <span className="text-green-400 font-mono">
                  {formatCurrency(
                    wallet.transactions
                      .filter(t => t.type === 'earned')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-300">Total Spent:</span>
                <span className="text-red-400 font-mono">
                  {formatCurrency(
                    wallet.transactions
                      .filter(t => t.type === 'spent')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Market Info */}
          <div>
            <h3 className="text-yellow-400 font-mono text-sm font-bold mb-2">Market Info</h3>
            <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-3">
              <div className="text-yellow-300 text-sm space-y-1">
                <div>💰 Earn ɄCoins by hacking targets</div>
                <div>📈 Market updates every minute</div>
                <div>🛒 Spend coins in the Dark Web</div>
                <div>🔒 All transactions are anonymous</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;