import React, { useState } from 'react';
import { InventoryItem, BlackMarketState, PlayerInventory } from '../types/inventory';
import { CryptoWallet } from '../types/crypto';
import { Globe, ShoppingCart, Package, Star, Lock, CheckCircle, Coins } from 'lucide-react';
import { formatCurrency } from '../utils/cryptoManager';
import { formatItemType, getItemTypeIcon } from '../utils/blackMarket';

interface DarkWebPanelProps {
  blackMarket: BlackMarketState;
  playerInventory: PlayerInventory;
  cryptoWallet: CryptoWallet;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseItem: (itemId: string) => void;
}

const DarkWebPanel: React.FC<DarkWebPanelProps> = ({
  blackMarket,
  playerInventory,
  cryptoWallet,
  isOpen,
  onClose,
  onPurchaseItem
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePurchase = (itemId: string) => {
    onPurchaseItem(itemId);
    setSelectedItem(null);
  };

  const canAfford = (item: InventoryItem) => cryptoWallet.balance >= item.price;

  if (!isOpen) return null;

  const availableItems = blackMarket.items.filter(item => !item.owned);
  const ownedItems = blackMarket.items.filter(item => item.owned);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-red-400 rounded-lg w-full max-w-6xl h-[90vh] mx-4 shadow-2xl shadow-red-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-red-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Globe className="w-6 h-6 text-red-400" />
            <div>
              <span className="text-red-300 font-mono text-xl font-bold">
                🕸️ Dark Web
              </span>
              <div className="text-red-400 text-sm">
                Underground Marketplace • Untraceable Transactions
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-mono text-lg font-bold">
                {formatCurrency(cryptoWallet.balance)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-300 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-red-400/30 bg-black/50">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-6 py-3 font-mono text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'market'
                    ? 'text-red-300 border-b-2 border-red-400'
                    : 'text-red-400 hover:text-red-300'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Black Market ({availableItems.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-3 font-mono text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'inventory'
                    ? 'text-red-300 border-b-2 border-red-400'
                    : 'text-red-400 hover:text-red-300'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Items ({ownedItems.length})</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-black">
              {activeTab === 'market' ? (
                <div>
                  {availableItems.length === 0 ? (
                    <div className="text-center text-red-300 mt-8">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-mono mb-2">No Items Available</h3>
                      <p className="text-red-400">All items have been purchased.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {availableItems.map(item => (
                        <div
                          key={item.id}
                          className={`bg-red-900/20 border border-red-400/30 rounded-lg p-4 cursor-pointer hover:bg-red-900/30 transition-colors ${
                            selectedItem?.id === item.id ? 'ring-2 ring-red-400' : ''
                          } ${!canAfford(item) ? 'opacity-60' : ''}`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getItemTypeIcon(item.type)}</span>
                              <h4 className="text-red-300 font-mono font-bold text-sm">{item.name}</h4>
                            </div>
                            <div className="text-xs">
                              <span className="bg-red-600 text-white px-2 py-1 rounded font-mono">
                                {formatItemType(item.type)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-red-400 text-xs mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className={`font-mono font-bold ${canAfford(item) ? 'text-yellow-400' : 'text-red-500'}`}>
                              {formatCurrency(item.price)}
                            </div>
                            {!canAfford(item) && (
                              <span className="text-red-500 text-xs">Insufficient Funds</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {ownedItems.length === 0 ? (
                    <div className="text-center text-red-300 mt-8">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-mono mb-2">No Items Owned</h3>
                      <p className="text-red-400">Purchase items from the Black Market to see them here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {ownedItems.map(item => (
                        <div
                          key={item.id}
                          className={`bg-green-900/20 border border-green-400/30 rounded-lg p-4 cursor-pointer hover:bg-green-900/30 transition-colors ${
                            selectedItem?.id === item.id ? 'ring-2 ring-green-400' : ''
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-lg">{getItemTypeIcon(item.type)}</span>
                              <h4 className="text-green-300 font-mono font-bold text-sm">{item.name}</h4>
                            </div>
                            <div className="text-xs">
                              <span className="bg-green-600 text-white px-2 py-1 rounded font-mono">
                                OWNED
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-green-400 text-xs mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="text-green-400 text-xs">
                            Purchased: {item.purchasedAt?.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Item Details Panel */}
          <div className="w-80 border-l border-red-400/30 bg-black/50 p-4">
            {selectedItem ? (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{getItemTypeIcon(selectedItem.type)}</span>
                  <h3 className="text-red-300 font-mono font-bold text-lg">
                    {selectedItem.name}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-red-400 font-mono text-sm font-bold mb-2">Description</h4>
                    <p className="text-red-300 text-sm">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-red-400 font-mono text-sm font-bold mb-2">Effect</h4>
                    <div className="bg-red-900/20 border border-red-400/30 rounded p-3">
                      <p className="text-red-300 text-sm">
                        {selectedItem.effect.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-400">Type:</span>
                      <div className="text-red-300 font-mono">
                        {formatItemType(selectedItem.type)}
                      </div>
                    </div>
                    <div>
                      <span className="text-red-400">Price:</span>
                      <div className="text-yellow-400 font-mono font-bold">
                        {formatCurrency(selectedItem.price)}
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-4 border-t border-red-400/30">
                    {selectedItem.owned ? (
                      <div className="text-center text-green-400 font-mono">
                        ✓ Item Owned
                      </div>
                    ) : canAfford(selectedItem) ? (
                      <button
                        onClick={() => handlePurchase(selectedItem.id)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-mono font-bold py-2 px-4 rounded transition-colors"
                      >
                        Purchase Item
                      </button>
                    ) : (
                      <div className="text-center text-red-400 font-mono text-sm">
                        Insufficient Funds
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-400 mt-8">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-mono mb-2">Select an Item</h3>
                <p className="text-sm">
                  Click on any item to view details and purchase options.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-red-400/30 bg-black/50">
          <div className="text-center text-red-400 text-sm font-mono">
            🔒 All transactions are encrypted and untraceable • Items provide passive bonuses
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkWebPanel;