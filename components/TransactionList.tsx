
import React from 'react';
import { Transaction, RiskAnalysis, Decision } from '../types';
import { MapPin, Smartphone, CreditCard, ChevronRight } from 'lucide-react';

interface TransactionListProps {
  stream: { tx: Transaction, analysis: RiskAnalysis }[];
  onSelect: (item: { tx: Transaction, analysis: RiskAnalysis }) => void;
  selectedId?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ stream, onSelect, selectedId }) => {
  const getDecisionColor = (d: Decision) => {
    switch (d) {
      case Decision.APPROVE: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case Decision.BLOCK: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case Decision.MANUAL_REVIEW: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-slate-900 z-10">
          <tr className="text-left text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <th className="px-6 py-3 border-b border-slate-800">Time</th>
            <th className="px-6 py-3 border-b border-slate-800">Transaction</th>
            <th className="px-6 py-3 border-b border-slate-800">Merchant</th>
            <th className="px-6 py-3 border-b border-slate-800">Location</th>
            <th className="px-6 py-3 border-b border-slate-800">Score</th>
            <th className="px-6 py-3 border-b border-slate-800 text-right">Decision</th>
          </tr>
        </thead>
        <tbody>
          {stream.map(({ tx, analysis }) => (
            <tr 
              key={tx.id}
              onClick={() => onSelect({ tx, analysis })}
              className={`group cursor-pointer border-b border-slate-800/50 hover:bg-slate-800/30 transition-all ${selectedId === tx.id ? 'bg-indigo-600/10 border-indigo-600/40' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-xs font-mono text-slate-400">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200">${tx.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{tx.id}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-300 font-medium">{tx.merchant}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-400">{tx.location.city}, {tx.location.country}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${analysis.score > 70 ? 'bg-rose-500' : analysis.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold font-mono ${analysis.score > 70 ? 'text-rose-400' : analysis.score > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {analysis.score}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getDecisionColor(analysis.decision)}`}>
                    {analysis.decision.replace('_', ' ')}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors ${selectedId === tx.id ? 'text-indigo-400' : ''}`} />
                </div>
              </td>
            </tr>
          ))}
          {stream.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                Waiting for incoming transaction stream...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
