
import React, { useState, useEffect } from 'react';
import { Transaction, RiskAnalysis, SystemMetrics, Decision } from '../types';
import { getFraudExplanation, getSystemInsights } from '../services/geminiService';
import { BrainCircuit, Info, Sparkles, Activity, FileText, ShieldCheck, ShieldAlert, Shield, Timer, ChevronRight } from 'lucide-react';

interface ExplainabilityViewProps {
  selectedItem: { tx: Transaction, analysis: RiskAnalysis } | null;
  metrics: SystemMetrics;
}

const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ selectedItem, metrics }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [systemInsight, setSystemInsight] = useState<string>("Analyzing current stream patterns...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setLoading(true);
      setExplanation(null);
      getFraudExplanation(selectedItem.tx, selectedItem.analysis).then(res => {
        setExplanation(res);
        setLoading(false);
      });
    }
  }, [selectedItem]);

  useEffect(() => {
    getSystemInsights(metrics).then(setSystemInsight);
  }, [metrics.fraudRate, metrics.avgLatency]);

  const getVerdictIcon = (decision: Decision) => {
    switch(decision) {
      case Decision.APPROVE: return <ShieldCheck className="w-8 h-8 text-emerald-500" />;
      case Decision.BLOCK: return <ShieldAlert className="w-8 h-8 text-rose-500" />;
      case Decision.MANUAL_REVIEW: return <Shield className="w-8 h-8 text-amber-500" />;
    }
  };

  const getVerdictColor = (decision: Decision) => {
    switch(decision) {
      case Decision.APPROVE: return 'border-emerald-500/30 bg-emerald-500/5';
      case Decision.BLOCK: return 'border-rose-500/30 bg-rose-500/5';
      case Decision.MANUAL_REVIEW: return 'border-amber-500/30 bg-amber-500/5';
    }
  };

  // Simulated internal timing breakdown for the selected transaction
  const getPipelineSteps = (total: number) => [
    { name: 'Ingest', time: total * 0.15 },
    { name: 'Enrich', time: total * 0.20 },
    { name: 'Score', time: total * 0.55 },
    { name: 'Sync', time: total * 0.10 },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <h2 className="font-bold flex items-center gap-2 text-indigo-400 tracking-tight">
            <BrainCircuit className="w-5 h-5" />
            Decision Intelligence
          </h2>
          {selectedItem?.analysis.isFallback && (
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-[10px] font-black uppercase tracking-widest">
              ML Fallback Mode
            </span>
          )}
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {selectedItem ? (
            <div className="space-y-6">
              {/* High Impact Verdict Card */}
              <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 transition-all shadow-inner ${getVerdictColor(selectedItem.analysis.decision)}`}>
                <div className="p-4 bg-slate-950/80 rounded-2xl shadow-lg">
                  {getVerdictIcon(selectedItem.analysis.decision)}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] mb-1">Final Verdict</p>
                  <h3 className={`text-3xl font-black uppercase tracking-tighter ${
                    selectedItem.analysis.decision === Decision.APPROVE ? 'text-emerald-400' : 
                    selectedItem.analysis.decision === Decision.BLOCK ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {selectedItem.analysis.decision.replace('_', ' ')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] font-mono text-slate-400">{selectedItem.analysis.processingTimeMs.toFixed(2)}ms Processing</span>
                  </div>
                </div>
              </div>

              {/* Sub-100ms Pipeline Visualization */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Processing Timeline
                </h3>
                <div className="flex items-center justify-between gap-1 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  {getPipelineSteps(selectedItem.analysis.processingTimeMs).map((step, idx, arr) => (
                    <React.Fragment key={step.name}>
                      <div className="flex flex-col items-center gap-1 group flex-1">
                        <div className="text-[9px] font-mono text-slate-500 uppercase group-hover:text-indigo-400 transition-colors">{step.name}</div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '100%' }} />
                        </div>
                        <div className="text-[9px] font-mono text-slate-600 font-bold">{step.time.toFixed(1)}ms</div>
                      </div>
                      {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-800 mt-4" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* AI Explainability Narrative */}
              <div className="space-y-3">
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                   <FileText className="w-3 h-3" /> Neural Reasoner Output
                 </h3>
                 <div className="p-5 bg-slate-950/90 border border-slate-800/80 rounded-2xl relative shadow-lg">
                   <Sparkles className="absolute top-4 right-4 w-4 h-4 text-indigo-500/40" />
                   {loading ? (
                     <div className="flex flex-col gap-3 animate-pulse">
                       <div className="h-3 w-full bg-slate-800 rounded"></div>
                       <div className="h-3 w-5/6 bg-slate-800 rounded"></div>
                       <div className="h-3 w-3/4 bg-slate-800 rounded"></div>
                     </div>
                   ) : (
                     <p className="text-sm text-slate-300 leading-relaxed font-medium">
                       {explanation}
                     </p>
                   )}
                 </div>
              </div>

              {/* Technical Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Rules Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-200">{selectedItem.analysis.ruleOutput}</span>
                    <span className="text-xs text-slate-600 font-bold">/100</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-slate-500 transition-all duration-700" style={{ width: `${selectedItem.analysis.ruleOutput}%` }} />
                  </div>
                </div>
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-indigo-500/80 font-black uppercase tracking-wider">ML Logic</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-400">{selectedItem.analysis.isFallback ? '--' : selectedItem.analysis.mlOutput}</span>
                    <span className="text-xs text-indigo-900 font-bold">/100</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${selectedItem.analysis.mlOutput}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-6 bg-slate-800/50 rounded-full border border-slate-700/50 animate-pulse">
                <Sparkles className="w-12 h-12 text-indigo-400/40" />
              </div>
              <div>
                <h3 className="text-slate-200 font-black mb-1 uppercase tracking-[0.2em] text-sm">System Ready</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[220px]">
                  Engine is live and monitoring {metrics.throughput.toFixed(1)} tx/sec. Select an event to inspect its neural fingerprint.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-sm border-l-4 border-l-indigo-500 shadow-lg">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-indigo-400" />
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Health</h2>
        </div>
        <div className="flex-1 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50 flex items-start">
          <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
            "{systemInsight}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityView;
