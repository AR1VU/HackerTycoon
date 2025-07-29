import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onReset }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = () => {
    onReset();
    setShowConfirmation(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className="fixed top-4 right-4 bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg shadow-lg transition-colors z-40 flex items-center space-x-2"
        title="Reset Game"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="font-mono text-sm">Reset</span>
      </button>

      {showConfirmation && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-black border-2 border-red-400 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl shadow-red-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-red-400 font-mono text-xl font-bold">Reset Game</h2>
            </div>
            
            <div className="text-red-300 font-mono mb-6">
              <p className="mb-2">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All network progress and hack history</li>
                <li>Downloaded files</li>
                <li>Tool cooldowns and usage data</li>
                <li>All saved game data</li>
              </ul>
              <p className="mt-3 text-yellow-400">This action cannot be undone!</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-mono font-bold py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold py-2 px-4 rounded transition-colors"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetButton;