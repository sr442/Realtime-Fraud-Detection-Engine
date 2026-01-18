
import React from 'react';
import { SystemMetrics, Strategy } from '../types';
import { Activity, Zap, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  metrics: SystemMetrics;
  strategy?: Strategy;
}

const Header: React.FC<HeaderProps> = ({ metrics, strategy }) => {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-slate-200">System Status: <span className="text-emerald-500">Nominal</span></span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-400">Core: {strategy?.name || 'Loading...'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
             <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
             <span className="text-xs font-mono text-slate-400">SYNC: NODE-US-EAST-1</span>
          </div>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Sentinel v4.2.0</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
          SR
        </div>
      </div>
    </header>
  );
};

export default Header;
