import React from 'react';
import { TraceState } from '../types/trace';
import { getTraceStatus, formatTraceLevel } from '../utils/traceManager';
import { Shield, ShieldAlert, ShieldX, Wifi, WifiOff } from 'lucide-react';

interface TraceIndicatorProps {
  traceState: TraceState;
}

const TraceIndicator: React.FC<TraceIndicatorProps> = ({ traceState }) => {
  const { status, color, severity } = getTraceStatus(traceState.level);
  
  const getGlitchEffect = () => {
    if (severity === 'critical') return 'animate-pulse';
    if (severity === 'danger') return 'animate-bounce';
    return '';
  };

  const getIcon = () => {
    switch (severity) {
      case 'critical': return <ShieldX className="w-5 h-5" />;
      case 'danger': return <ShieldAlert className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
      severity === 'critical' ? 'bg-red-900/30 border-red-400' :
      severity === 'danger' ? 'bg-red-900/20 border-red-400/60' :
      severity === 'caution' ? 'bg-yellow-900/20 border-yellow-400/60' :
      'bg-green-900/20 border-green-400/60'
    } ${getGlitchEffect()}`}>
      {/* Trace Level */}
      <div className="flex items-center space-x-2">
        <div className={color}>
          {getIcon()}
        </div>
        <div>
          <div className={`font-mono text-sm font-bold ${color}`}>
            TRACE: {formatTraceLevel(traceState.level)}
          </div>
          <div className={`text-xs ${color}`}>
            {status}
          </div>
        </div>
      </div>

      {/* Trace Bar */}
      <div className="flex-1 max-w-32">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              severity === 'critical' ? 'bg-red-500' :
              severity === 'danger' ? 'bg-red-400' :
              severity === 'caution' ? 'bg-yellow-400' :
              'bg-green-400'
            }`}
            style={{ width: `${traceState.level}%` }}
          />
        </div>
      </div>

      {/* Proxy Status */}
      <div className="flex items-center space-x-1">
        {traceState.isProxyActive ? (
          <Wifi className="w-4 h-4 text-blue-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-500" />
        )}
        <span className={`text-xs font-mono ${
          traceState.isProxyActive ? 'text-blue-400' : 'text-gray-500'
        }`}>
          {traceState.isProxyActive ? 'PROXY' : 'DIRECT'}
        </span>
      </div>
    </div>
  );
};

export default TraceIndicator;