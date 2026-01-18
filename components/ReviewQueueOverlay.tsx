
import React from 'react';
import { Transaction, RiskAnalysis, Decision } from '../types';
import { ShieldCheck, ShieldX, UserCheck, AlertCircle } from 'lucide-react';

interface ReviewQueueOverlayProps {
  item: { tx: Transaction, analysis: RiskAnalysis };
  onAction: (id: string, action: Decision) => void;
}

const ReviewQueueOverlay: React.FC<ReviewQueueOverlayProps> = ({ item, onAction }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-indigo-500/10">
        <div className="p-4 bg-indigo-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <UserCheck className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Human Intervention</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          This transaction sits in a <span className="text-amber-400 font-bold italic">grey area</span>. 
          The ML confidence is low, and rule violations are inconclusive.
        </p>

        <div className="space-y-3 mb-8 text-left">
           <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">Ambiguity Signal</p>
                <p className="text-xs text-slate-300">New merchant signature + atypical time window.</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onAction(item.tx.id, Decision.BLOCK)}
            className="flex items-center justify-center gap-2 p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            <ShieldX className="w-4 h-4" />
            Block
          </button>
          <button 
            onClick={() => onAction(item.tx.id, Decision.APPROVE)}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            Approve
          </button>
        </div>

        <button 
          onClick={() => onAction(item.tx.id, Decision.APPROVE)} // Just dismiss for demo
          className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
        >
          Skip / Delegate
        </button>
      </div>
    </div>
  );
};

export default ReviewQueueOverlay;
