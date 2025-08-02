import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onReset }) => {
  return (
    <button
      onClick={onReset}
      className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full shadow-lg transition-colors z-30"
      title="Reset Game"
    >
      <RotateCcw className="w-5 h-5" />
    </button>
  );
};

export default ResetButton;