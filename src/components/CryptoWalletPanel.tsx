import React from 'react';
import { CryptoWallet, CryptoMarket } from '../types/crypto';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatUSD, getTransactionIcon, getTransactionColor } from '../utils/cryptoManager';

interface CryptoWalletPanelProps {
  wallet: CryptoWallet;
  market: CryptoMarket;
  isOpen: boolean;
  onClose: () => void;
}

const CryptoWalletPanel: React.FC<CryptoWalletPanelProps> = ({ 
  wallet, 
  market, 
  isOpen, 
  onClose 
}) => {
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const usdValue = wallet.balance * market.currentRate;
  const trend = getMarketTrend();

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-yellow-400 rounded-lg w-full max-w-4xl h-[80vh] mx-4 shadow-2xl shadow-yellow-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-yellow-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-mono text-lg font-bold">
              ɄCoin Wallet
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-400 hover:text-yellow-300 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Balance & Market Info */}
          <div className="w-80 border-r border-yellow-400/30 bg-black/50 p-4">
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

            {/* Market Rate */}
            <div className="mb-6">
              <h3 className="text-yellow-400 font-mono text-sm font-bold mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Market Rate
              </h3>
              <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-300 font-mono text-lg font-bold">
                    1Ʉ = {formatUSD(market.currentRate)}
                  </span>
                  <div className={`flex items-center space-x-1 text-sm ${
                    trend.direction === 'up' ? 'text-green-400' : 
                    trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {trend.direction === 'up' && <ArrowUpRight className="w-3 h-3" />}
                    {trend.direction === 'down' && <ArrowDownRight className="w-3 h-3" />}
                    <span>{trend.percentage.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="text-yellow-400 text-xs flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Updated: {formatTime(market.lastUpdate)}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
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
          </div>

          {/* Transaction History */}
          <div className="flex-1 p-4">
            <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4">
              Recent Transactions
            </h3>
            
            <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-black" style={{ height: 'calc(100% - 3rem)' }}>
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-yellow-400/30 bg-black/50">
          <div className="text-center text-yellow-400 text-sm font-mono">
            ɄCoin - The Underground Currency • Market updates every minute
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoWalletPanel;