import React, { useState } from 'react';
import { PlayerInventory, InventoryItem } from '../types/inventory';
import { Package, Star, Filter, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/cryptoManager';
import { formatItemType, getItemTypeIcon } from '../utils/blackMarket';

interface InventoryPanelProps {
  inventory: PlayerInventory;
  isOpen: boolean;
  onClose: () => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory,
  isOpen,
  onClose
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | InventoryItem['type']>('all');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFilteredItems = () => {
    if (filterType === 'all') return inventory.items;
    return inventory.items.filter(item => item.type === filterType);
  };

  const getItemsByType = () => {
    const types: Record<InventoryItem['type'], InventoryItem[]> = {
      exploit: [],
      tool_upgrade: [],
      gear: [],
      script: []
    };
    
    inventory.items.forEach(item => {
      types[item.type].push(item);
    });
    
    return types;
  };

  if (!isOpen) return null;

  const filteredItems = getFilteredItems();
  const itemsByType = getItemsByType();

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-green-400 rounded-lg w-full max-w-5xl h-[80vh] mx-4 shadow-2xl shadow-green-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-green-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="w-6 h-6 text-green-400" />
            <div>
              <span className="text-green-300 font-mono text-xl font-bold">
                Inventory
              </span>
              <div className="text-green-400 text-sm">
                {inventory.items.length} items • Total Value: {formatCurrency(inventory.totalValue)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Item List */}
          <div className="flex-1 flex flex-col">
            {/* Filter Tabs */}
            <div className="flex border-b border-green-400/30 bg-black/50">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 font-mono text-sm transition-colors ${
                  filterType === 'all'
                    ? 'text-green-300 border-b-2 border-green-400'
                    : 'text-green-400 hover:text-green-300'
                }`}
              >
                All ({inventory.items.length})
              </button>
              {Object.entries(itemsByType).map(([type, items]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as InventoryItem['type'])}
                  className={`px-4 py-2 font-mono text-sm transition-colors ${
                    filterType === type
                      ? 'text-green-300 border-b-2 border-green-400'
                      : 'text-green-400 hover:text-green-300'
                  }`}
                >
                  {formatItemType(type as InventoryItem['type'])} ({items.length})
                </button>
              ))}
            </div>

            {/* Item Grid */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black">
              {filteredItems.length === 0 ? (
                <div className="text-center text-green-300 mt-8">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-mono mb-2">
                    {filterType === 'all' ? 'Empty Inventory' : `No ${formatItemType(filterType as InventoryItem['type'])}s`}
                  </h3>
                  <p className="text-green-400">
                    Visit the Dark Web Market to purchase items and tools.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`bg-green-900/20 border border-green-400/30 rounded-lg p-4 cursor-pointer hover:bg-green-900/30 transition-colors ${
                        selectedItem?.id === item.id ? 'ring-2 ring-green-400' : ''
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getItemTypeIcon(item.type)}</span>
                          <h4 className="text-green-300 font-mono font-bold text-sm">{item.name}</h4>
                        </div>
                        <div className="text-xs">
                          <span className="bg-green-600 text-white px-2 py-1 rounded font-mono">
                            {formatItemType(item.type)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-green-400 text-xs mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-yellow-400 font-mono">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="text-green-400">
                          {item.purchasedAt?.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Item Details Panel */}
          <div className="w-80 border-l border-green-400/30 bg-black/50 p-4">
            {selectedItem ? (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{getItemTypeIcon(selectedItem.type)}</span>
                  <h3 className="text-green-300 font-mono font-bold text-lg">
                    {selectedItem.name}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-green-400 font-mono text-sm font-bold mb-2">Description</h4>
                    <p className="text-green-300 text-sm">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-green-400 font-mono text-sm font-bold mb-2">Effect</h4>
                    <div className="bg-green-900/20 border border-green-400/30 rounded p-3">
                      <p className="text-green-300 text-sm">
                        {selectedItem.effect.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-400">Type:</span>
                      <div className="text-green-300 font-mono">
                        {formatItemType(selectedItem.type)}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-400">Value:</span>
                      <div className="text-yellow-400 font-mono">
                        {formatCurrency(selectedItem.price)}
                      </div>
                    </div>
                  </div>

                  {selectedItem.purchasedAt && (
                    <div className="pt-4 border-t border-green-400/30">
                      <div className="flex items-center space-x-2 text-sm text-green-400">
                        <Calendar className="w-4 h-4" />
                        <span>Purchased: {selectedItem.purchasedAt.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-green-400/30">
                    <div className="text-center text-green-400 font-mono text-sm">
                      ✓ Item Active
                    </div>
                    <div className="text-center text-green-300 text-xs mt-1">
                      Effects are automatically applied
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-green-400 mt-8">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-mono mb-2">Select an Item</h3>
                <p className="text-sm">
                  Click on any item to view its details and effects.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-green-400/30 bg-black/50">
          <div className="text-center text-green-400 text-sm font-mono">
            All owned items provide passive bonuses and effects during gameplay
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;