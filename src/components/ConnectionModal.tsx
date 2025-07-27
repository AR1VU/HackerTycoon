import React from 'react';
import { NetworkNode } from '../types/network';

interface ConnectionModalProps {
  node: NetworkNode | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ node, isOpen, onClose }) => {
  if (!isOpen || !node) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-green-400 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl shadow-green-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-green-400 font-mono text-xl font-bold">Connection Established</h2>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Connection Info */}
        <div className="space-y-3 text-green-300 font-mono">
          <div className="flex justify-between">
            <span>Target IP:</span>
            <span className="text-green-400">{node.ip}</span>
          </div>
          <div className="flex justify-between">
            <span>Vulnerability:</span>
            <span className={`
              ${node.vulnerability === 'Low' ? 'text-green-400' : ''}
              ${node.vulnerability === 'Medium' ? 'text-yellow-400' : ''}
              ${node.vulnerability === 'High' ? 'text-red-400' : ''}
            `}>
              {node.vulnerability}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-cyan-400">{node.status}</span>
          </div>
        </div>
        
        {/* Connection Animation */}
        <div className="my-6">
          <div className="text-green-400 text-center mb-2">
            <div className="animate-pulse">● CONNECTED ●</div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold py-2 px-4 rounded transition-colors"
          >
            Continue Hacking
          </button>
          <div className="text-center text-green-300 text-sm">
            Connection will remain active in background
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;