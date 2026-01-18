
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, RiskAnalysis, Decision, SystemMetrics, Strategy } from './types';
import { FraudEngine } from './services/fraudEngine';
import { StreamSimulator } from './services/streamSimulator';
import { SYSTEM_CONFIG } from './constants';
import Header from './components/Header';
import MetricsOverview from './components/MetricsOverview';
import TransactionList from './components/TransactionList';
import ArchitectureView from './components/ArchitectureView';
import ExplainabilityView from './components/ExplainabilityView';
import LatencyChart from './components/LatencyChart';
import ReviewQueueOverlay from './components/ReviewQueueOverlay';
import { AlertTriangle, Cpu, LayoutDashboard, ShieldCheck, Activity, Terminal, Gauge, Zap } from 'lucide-react';

const engine = new FraudEngine();

const STRATEGIES: Strategy[] = [
  { name: "Balanced-Ensemble-v1", version: "1.2.0", mlWeight: 0.6, ruleWeight: 0.4, description: "Standard risk balancing." },
  { name: "Strict-Geo-Fencing", version: "2.0.1", mlWeight: 0.3, ruleWeight: 0.7, description: "Aggressive impossible travel detection." },
  { name: "High-Confidence-ML", version: "3.5.0", mlWeight: 0.85, ruleWeight: 0.15, description: "Heavy reliance on neural patterns." },
  { name: "Retail-Aggressive", version: "1.0.4", mlWeight: 0.5, ruleWeight: 0.5, description: "Tuned for seasonal spending spikes." }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'architecture'>('dashboard');
  const [stream, setStream] = useState<{tx: Transaction, analysis: RiskAnalysis}[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<{time: string, latency: number, id: string}[]>([]);
  const [strategyIndex, setStrategyIndex] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [reviewQueue, setReviewQueue] = useState<{tx: Transaction, analysis: RiskAnalysis}[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    throughput: 0,
    avgLatency: 0,
    p99Latency: 0,
    fraudRate: 0,
    modelDrift: 0.012
  });
  const [selectedItem, setSelectedItem] = useState<{tx: Transaction, analysis: RiskAnalysis} | null>(null);
  
  const txCounter = useRef(0);
  const latencyBuffer = useRef<number[]>([]);

  const handleNewTransaction = useCallback(async (tx: Transaction) => {
    const currentStrategy = STRATEGIES[strategyIndex];
    const analysis = await engine.analyze(tx, currentStrategy);
    
    setStream(prev => {
      const next = [{ tx, analysis }, ...prev];
      return next.slice(0, SYSTEM_CONFIG.MAX_STREAM_SIZE);
    });

    if (analysis.decision === Decision.MANUAL_REVIEW) {
      setReviewQueue(prev => [...prev, { tx, analysis }]);
    }

    setLatencyHistory(prev => {
      const next = [...prev, { 
        time: new Date().toLocaleTimeString(), 
        latency: parseFloat(analysis.processingTimeMs.toFixed(2)),
        id: tx.id 
      }];
      return next.slice(-40);
    });

    txCounter.current += 1;
    setTotalProcessed(prev => {
      const next = prev + 1;
      if (next % 100 === 0) {
        setStrategyIndex(idx => (idx + 1) % STRATEGIES.length);
      }
      return next;
    });

    latencyBuffer.current.push(analysis.processingTimeMs);
    if (latencyBuffer.current.length > 50) latencyBuffer.current.shift();
  }, [strategyIndex]);

  const handleManualAction = (id: string, action: Decision) => {
    setReviewQueue(prev => prev.filter(item => item.tx.id !== id));
    setStream(prev => prev.map(item => 
      item.tx.id === id ? { ...item, analysis: { ...item.analysis, decision: action } } : item
    ));
    if (selectedItem?.tx.id === id) {
      setSelectedItem(prev => prev ? { ...prev, analysis: { ...prev.analysis, decision: action } } : null);
    }
  };

  const handleChartSelection = (id: string) => {
    const item = stream.find(s => s.tx.id === id);
    if (item) setSelectedItem(item);
  };

  useEffect(() => {
    const simulator = new StreamSimulator(handleNewTransaction);
    simulator.start(1500);

    const metricsInterval = setInterval(() => {
      const latencies = [...latencyBuffer.current].sort((a, b) => a - b);
      const avgLat = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
      const p99Lat = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;
      
      setMetrics(prev => ({
        ...prev,
        throughput: txCounter.current / 5,
        avgLatency: avgLat,
        p99Latency: p99Lat,
        fraudRate: stream.length ? stream.filter(s => s.analysis.decision !== Decision.APPROVE).length / stream.length : 0
      }));
      txCounter.current = 0;
    }, 5000);

    return () => {
      simulator.stop();
      clearInterval(metricsInterval);
    };
  }, [handleNewTransaction, stream.length]);

  const slaBudgetUsed = Math.min((metrics.p99Latency / SYSTEM_CONFIG.LATENCY_BUDGET_MS) * 100, 100);
  const slaStatus = metrics.p99Latency > SYSTEM_CONFIG.LATENCY_BUDGET_MS ? 'CRITICAL' : metrics.p99Latency > 80 ? 'WARNING' : 'OPTIMAL';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans">
      <nav className="w-20 lg:w-64 border-r border-slate-800 flex flex-col items-center lg:items-stretch py-6 px-4 gap-8 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="hidden lg:block text-xl font-black tracking-tight text-white uppercase italic">Sentinel</h1>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('architecture')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === 'architecture' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Cpu className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Architecture</span>
          </button>
        </div>

        <div className="mt-auto hidden lg:block p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Script</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-400">{STRATEGIES[strategyIndex].name}</p>
            <p className="text-[9px] text-slate-500 leading-tight">{STRATEGIES[strategyIndex].description}</p>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(totalProcessed % 100)}%` }} />
          </div>
          <p className="mt-1 text-[8px] text-slate-600 font-bold uppercase">Rotation in {100 - (totalProcessed % 100)} TX</p>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        <Header metrics={metrics} strategy={STRATEGIES[strategyIndex]} />
        
        <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
          {activeTab === 'dashboard' ? (
            <>
              <MetricsOverview metrics={metrics} />
              
              <div className="flex-1 min-h-0 flex gap-6">
                <div className="flex-[3] min-w-0 flex flex-col gap-6">
                  {/* Transaction Feed */}
                  <div className="flex-[2] min-h-0 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                      <h2 className="font-bold flex items-center gap-2 text-slate-100 tracking-tight">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Live Ingestion Feed
                      </h2>
                      <div className="flex items-center gap-3">
                         {reviewQueue.length > 0 && (
                           <span className="animate-pulse bg-rose-500/20 text-rose-500 text-[9px] font-black px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest">
                             {reviewQueue.length} Pending Review
                           </span>
                         )}
                         <span className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">Streaming</span>
                      </div>
                    </div>
                    <TransactionList 
                      stream={stream} 
                      onSelect={setSelectedItem} 
                      selectedId={selectedItem?.tx.id} 
                    />
                  </div>

                  {/* P99 Latency Monitor (Improved) */}
                  <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Gauge className="w-24 h-24 text-indigo-400" />
                    </div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-indigo-400" />
                          <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest">P99 Latency Engine</h2>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-mono font-black ${slaStatus === 'CRITICAL' ? 'text-rose-400' : slaStatus === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {metrics.p99Latency.toFixed(2)}ms
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            slaStatus === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                            slaStatus === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {slaStatus}
                          </span>
                        </div>
                      </div>

                      <div className="w-48">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                          <span>SLA Budget Used</span>
                          <span className={slaBudgetUsed > 90 ? 'text-rose-400' : 'text-slate-300'}>{slaBudgetUsed.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                          <div 
                            className={`h-full transition-all duration-500 ease-out ${
                              slaBudgetUsed > 90 ? 'bg-rose-500' : slaBudgetUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${slaBudgetUsed}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] text-slate-600 font-bold">0ms</span>
                          <div className="flex items-center gap-1">
                            <Zap className="w-2 h-2 text-rose-500" />
                            <span className="text-[9px] text-rose-500/70 font-bold">100ms SLA</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0">
                      <LatencyChart data={latencyHistory} onSelect={handleChartSelection} />
                    </div>
                  </div>
                </div>

                <div className="flex-[2] min-w-0 flex flex-col gap-6 relative">
                  <ExplainabilityView selectedItem={selectedItem} metrics={metrics} />
                  {selectedItem?.analysis.decision === Decision.MANUAL_REVIEW && (
                    <ReviewQueueOverlay 
                      item={selectedItem} 
                      onAction={handleManualAction} 
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <ArchitectureView />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
