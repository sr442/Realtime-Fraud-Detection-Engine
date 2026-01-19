
import React from 'react';
import { Transaction, RiskAnalysis, Decision } from '../types';
import { ShieldCheck, ShieldX, UserCheck, AlertCircle, Fingerprint } from 'lucide-react';

interface ReviewQueueOverlayProps {
  item: { tx: Transaction, analysis: RiskAnalysis };
  onAction: (id: string, action: Decision) => void;
}

const ReviewQueueOverlay: React.FC<ReviewQueueOverlayProps> = ({ item, onAction }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-indigo-500/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500"></div>
        
        <div className="p-4 bg-indigo-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <UserCheck className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Human Intervention</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          The engine has flagged this event for <span className="text-amber-400 font-bold italic">Deep Review</span>. 
          Neural confidence is below SLA thresholds.
        </p>

        <div className="space-y-3 mb-8 text-left">
           <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ambiguity Signal</p>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed mt-1">
                    {item.analysis.ambiguitySignal || "Uncategorized neural pattern anomaly detected in ingestion stream."}
                  </p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-800/50">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Fingerprint className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase">Pattern Match</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-indigo-400">42% Confidence</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[42%] animate-pulse"></div>
                </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onAction(item.tx.id, Decision.BLOCK)}
            className="flex items-center justify-center gap-2 p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95 group"
          >
            <ShieldX className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Block
          </button>
          <button 
            onClick={() => onAction(item.tx.id, Decision.APPROVE)}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group"
          >
            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Approve
          </button>
        </div>

        <button 
          onClick={() => onAction(item.tx.id, Decision.APPROVE)}
          className="mt-6 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] hover:text-slate-400 transition-colors"
        >
          Delegate to Level 2
        </button>
      </div>
    </div>
  );
};

export default ReviewQueueOverlay;
