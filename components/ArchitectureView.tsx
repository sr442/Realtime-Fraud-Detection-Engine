
import React from 'react';
import { Database, Zap, Cpu, Server, ShieldCheck, Share2, AlertTriangle } from 'lucide-react';

const ArchitectureView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto pr-2">
      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Sentinel System Architecture</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A production-ready design built for high-throughput, sub-100ms latency, and graceful degradation during service outages.
          </p>
        </div>

        {/* The Pipeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-4 relative">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 z-10">
               <Zap className="w-8 h-8 text-white" />
             </div>
             <div>
               <h3 className="font-bold text-slate-200">Data Ingestion</h3>
               <p className="text-xs text-slate-500 mt-2">Kafka-like streaming layer handling high-velocity events with retry logic.</p>
             </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-4 relative">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 z-10">
               <Database className="w-8 h-8 text-indigo-400" />
             </div>
             <div>
               <h3 className="font-bold text-slate-200">Redis Enrichment</h3>
               <p className="text-xs text-slate-500 mt-2">In-memory feature store for user history, device context, and geo-patterns.</p>
             </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-4 relative">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 z-10">
               <Cpu className="w-8 h-8 text-emerald-400" />
             </div>
             <div>
               <h3 className="font-bold text-slate-200">Dual Scoring Brain</h3>
               <p className="text-xs text-slate-500 mt-2">Hybrid evaluation using static Rules Engine + ML (XGBoost) Inference.</p>
             </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center gap-4 relative">
             <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10">
               <ShieldCheck className="w-8 h-8 text-white" />
             </div>
             <div>
               <h3 className="font-bold text-slate-200">Decision Gateway</h3>
               <p className="text-xs text-slate-500 mt-2">Final threshold check for Approve/Block/Review based on ensemble scores.</p>
             </div>
          </div>

          {/* Connectors (Visible on desktop) */}
          <div className="hidden md:block absolute top-8 left-1/8 w-3/4 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-emerald-500/0 z-0"></div>
        </div>

        {/* Technical Deep Dive */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="flex items-center gap-2 font-bold text-white mb-4">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Failure Handling Strategy
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="p-1 bg-amber-500/10 rounded"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Service Fallback</p>
                  <p className="text-xs text-slate-500">If ML inference exceeds 50ms, system automatically falls back to deterministic rules to ensure availability.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="p-1 bg-sky-500/10 rounded"><Server className="w-4 h-4 text-sky-500" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Redis Cache Hit</p>
                  <p className="text-xs text-slate-500">99.9% read cache hit rate. If Redis is unavailable, engine uses session context for best-effort scoring.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h4 className="font-bold text-white mb-4">Latency Budget (Goal: 100ms)</h4>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs font-mono mb-1">
                   <span className="text-slate-400">Ingestion & Decoding</span>
                   <span className="text-emerald-400">12ms</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full"><div className="w-[12%] h-full bg-emerald-500 rounded-full"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-xs font-mono mb-1">
                   <span className="text-slate-400">Redis Feature Lookup</span>
                   <span className="text-emerald-400">18ms</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full"><div className="w-[18%] h-full bg-emerald-500 rounded-full"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-xs font-mono mb-1">
                   <span className="text-slate-400">ML Inference (XGBoost)</span>
                   <span className="text-indigo-400">45ms</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full"><div className="w-[45%] h-full bg-indigo-500 rounded-full"></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-xs font-mono mb-1">
                   <span className="text-slate-400">Rule Engine & Ensemble</span>
                   <span className="text-emerald-400">5ms</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full"><div className="w-[5%] h-full bg-emerald-500 rounded-full"></div></div>
               </div>
               <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs font-bold font-mono">
                    <span className="text-white uppercase tracking-wider">Total P99 Latency</span>
                    <span className="text-indigo-400">80ms</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;
