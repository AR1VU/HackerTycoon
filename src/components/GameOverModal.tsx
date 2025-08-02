import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onReset: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onReset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
      <div className="bg-black border-4 border-red-500 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/50 animate-pulse">
        {/* Glitch Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 rounded-lg blur-xl animate-pulse"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
            <h1 className="text-3xl font-mono font-bold text-red-500 mb-2 animate-pulse">
              TRACE COMPLETE
            </h1>
            <div className="text-red-400 font-mono text-lg">
              LOCATION COMPROMISED
            </div>
          </div>

          {/* Message */}
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="text-red-300 font-mono text-sm space-y-2">
              <div>⚠️  SYSTEM ALERT: Unauthorized access detected</div>
              <div>🚨 Law enforcement agencies have been notified</div>
              <div>📍 Your location has been triangulated</div>
              <div>🔒 All network access has been terminated</div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-6">
            <div className="text-red-400 font-mono text-sm">
              Your hacking activities have been traced back to your location.
            </div>
            <div className="text-red-300 font-mono text-xs mt-2">
              Use proxy networks and delete server logs to avoid detection next time.
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-mono font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>START NEW OPERATION</span>
          </button>

          <div className="text-center text-red-400 text-xs mt-3 font-mono">
            All progress will be reset
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;