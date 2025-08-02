import React from 'react';
import { Terminal, Target, Wallet, Globe, Home } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'darkweb', label: 'Dark Web', icon: Globe },
  ];

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-green-400/30 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Home className="w-6 h-6 text-green-400" />
          <span className="text-green-300 font-mono text-xl font-bold">
            Hacker Tycoon
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                  isActive
                    ? 'bg-green-600 text-black font-bold'
                    : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;