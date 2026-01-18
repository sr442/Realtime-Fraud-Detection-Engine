import React, { useState } from 'react';
import { LogEntry, LogSeverity } from '../types';
import { Terminal, Search, Filter, Trash2, Download, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface LogsViewProps {
  logs: LogEntry[];
  onClear: () => void;
}

const LogsView: React.FC<LogsViewProps> = ({ logs, onClear }) => {
  const [filter, setFilter] = useState<LogSeverity | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.severity === filter;
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                         log.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityStyles = (severity: LogSeverity) => {
    switch (severity) {
      case LogSeverity.INFO: return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Info };
      case LogSeverity.WARN: return { text: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertCircle };
      case LogSeverity.ERROR: return { text: 'text-rose-400', bg: 'bg-rose-500/10', icon: XCircle };
      case LogSeverity.CRITICAL: return { text: 'text-rose-600', bg: 'bg-rose-600/20', icon: CheckCircle2 };
      default: return { text: 'text-slate-400', bg: 'bg-slate-500/10', icon: Info };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Log Header & Controls */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="font-black text-slate-100 uppercase tracking-widest text-sm italic">System Observability Hub</h2>
          <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono uppercase tracking-widest">{logs.length} Total Events</span>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end min-w-[300px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search traces..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value={LogSeverity.INFO}>INFO ONLY</option>
            <option value={LogSeverity.WARN}>WARNINGS</option>
            <option value={LogSeverity.ERROR}>ERRORS</option>
          </select>

          <button 
            onClick={onClear}
            className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-xl transition-all"
            title="Clear Stream"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Log Container */}
      <div className="flex-1 overflow-y-auto font-mono p-4 space-y-1 bg-slate-950/50">
        {filteredLogs.map((log) => {
          const style = getSeverityStyles(log.severity);
          const Icon = style.icon;
          return (
            <div key={log.id} className="group flex items-start gap-4 px-3 py-1.5 hover:bg-slate-800/30 rounded-lg transition-colors border border-transparent hover:border-slate-800/50">
              <span className="text-[10px] text-slate-600 w-24 shrink-0 font-bold">
                {/* Fixed fractionalSecondDigits type error by casting options to any */}
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as any)}
              </span>
              <div className={`flex items-center gap-2 w-24 shrink-0 px-2 py-0.5 rounded ${style.bg} ${style.text} text-[9px] font-black uppercase tracking-tighter`}>
                <Icon className="w-2.5 h-2.5" />
                {log.severity}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-300 leading-relaxed break-words font-medium">
                  {log.message}
                </span>
                {log.metadata && (
                  <div className="mt-1 text-[9px] text-slate-500 italic opacity-0 group-hover:opacity-100 transition-opacity">
                    TraceID: {log.id} | Context: {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredLogs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 py-20">
            <Terminal className="w-12 h-12" />
            <p className="text-xs font-black uppercase tracking-widest">No matching traces found</p>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
             Ingestion Hub Active
          </div>
          <div className="w-px h-3 bg-slate-800"></div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             Async Storage Syncing
          </div>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
          <Download className="w-3 h-3" />
          Export JSON Artifact
        </button>
      </div>
    </div>
  );
};

export default LogsView;