import React from 'react';
import Terminal from './components/Terminal';

function App() {
  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Main terminal container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl h-[80vh] min-h-[600px] bg-black/90 backdrop-blur-sm border border-green-400/30 rounded-lg shadow-2xl shadow-green-500/10">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-xl"></div>
          
          {/* Terminal content */}
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Terminal />
          </div>
        </div>
      </div>
      
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export default App;