
import React, { useState, useEffect } from 'react';
import { FinancialHealth, Transaction, AdvisoryType } from '../types';
import { getWealthAdvisoryBrief } from '../services/geminiService';
import { TrendingUp, Wallet, ArrowUpRight, Sparkles, PieChart, Landmark, Percent, ReceiptText } from 'lucide-react';

interface AdvisoryHubProps {
  health: FinancialHealth;
  recentTransactions: Transaction[];
}

const AdvisoryHub: React.FC<AdvisoryHubProps> = ({ health, recentTransactions }) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getWealthAdvisoryBrief(health, recentTransactions).then(res => {
      setBrief(res);
      setLoading(false);
    });
  }, [health.yieldAtRisk]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Level Wealth Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Landmark className="w-16 h-16 text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Yield at Risk</p>
          <h3 className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">
            ${health.yieldAtRisk.toLocaleString()}<span className="text-sm opacity-40 ml-1">/yr</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Potential earnings lost due to <span className="text-emerald-500 font-bold italic">idle capital</span> in non-interest accounts.
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-amber-400" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Savings Efficiency</p>
          <h3 className="text-4xl font-black text-amber-400 font-mono tracking-tighter">
            {health.savingsRate}%
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Client is currently outpacing their peer group by <span className="text-amber-500 font-bold italic">+4.2%</span> in net-worth growth.
          </p>
        </div>

        <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PieChart className="w-16 h-16 text-indigo-400" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Tax Exposure Index</p>
          <h3 className="text-4xl font-black text-indigo-400 font-mono tracking-tighter">
            {health.leverageRatio.toFixed(2)}
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Risk rating of <span className="text-indigo-400 font-bold italic">OPTIMAL</span> based on current deduction-to-spend ratio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic AI Brief */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col relative shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Private Wealth Strategic Brief</h2>
           </div>

           <div className="flex-1 bg-slate-950/80 rounded-2xl p-6 border border-slate-800/50 min-h-[300px]">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                  <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                    {brief}
                  </p>
                </div>
              )}
           </div>
           
           <button className="mt-6 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all group active:scale-95 shadow-lg shadow-emerald-500/20">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Send to Wealth Manager
           </button>
        </div>

        {/* Advisory Signals List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-3">
              <ReceiptText className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest italic">Capital Optimization Signals</h2>
           </div>
           <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
              {health.signals.map((signal, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 flex gap-4 hover:border-amber-500/30 transition-all cursor-pointer group">
                  <div className={`p-3 rounded-xl shrink-0 h-fit ${
                    signal.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {signal.type === AdvisoryType.IDLE_CASH ? <Landmark className="w-5 h-5" /> : 
                     signal.type === AdvisoryType.SUBSCRIPTION_BLOAT ? <Percent className="w-5 h-5" /> :
                     <Wallet className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{signal.type.replace('_', ' ')}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                        signal.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {signal.severity} IMPACT
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">{signal.description}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">ESTIMATED GAIN: <span className="text-emerald-400">+${signal.potentialImpact.toLocaleString()}</span></p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryHub;
