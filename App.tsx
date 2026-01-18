
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, RiskAnalysis, Decision, SystemMetrics, Strategy, LogEntry, LogSeverity } from './types';
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
import LogsView from './components/LogsView';
import { Cpu, LayoutDashboard, ShieldCheck, Activity, Terminal, Waves, ActivitySquare, ScrollText, UserCheck } from 'lucide-react';

const engine = new FraudEngine();

const STRATEGIES: Strategy[] = [
  { name: "Balanced-Ensemble-v1", version: "1.2.0", mlWeight: 0.6, ruleWeight: 0.4, description: "Standard risk balancing." },
  { name: "Strict-Geo-Fencing", version: "2.0.1", mlWeight: 0.3, ruleWeight: 0.7, description: "Aggressive impossible travel detection." },
  { name: "High-Confidence-ML", version: "3.5.0", mlWeight: 0.85, ruleWeight: 0.15, description: "Heavy reliance on neural patterns." },
  { name: "Retail-Aggressive", version: "1.0.4", mlWeight: 0.5, ruleWeight: 0.5, description: "Tuned for seasonal spending spikes." }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'architecture' | 'logs' | 'review'>('dashboard');
  const [stream, setStream] = useState<{tx: Transaction, analysis: RiskAnalysis}[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<{time: string, latency: number, id: string}[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
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

  const addLog = useCallback((message: string, severity: LogSeverity = LogSeverity.INFO, type: string = 'SYSTEM', metadata?: any) => {
    setLogs(prev => {
      const newLog: LogEntry = {
        id: `trace_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        message,
        severity,
        type,
        metadata
      };
      return [newLog, ...prev].slice(0, 200);
    });
  }, []);

  const handleNewTransaction = useCallback(async (tx: Transaction) => {
    const currentStrategy = STRATEGIES[strategyIndex];
    const analysis = await engine.analyze(tx, currentStrategy);
    
    if (analysis.isFallback) {
      addLog(`ML Engine timeout for trace ${tx.id}. Rule-based safety fallback engaged.`, LogSeverity.ERROR, 'FALLBACK');
    }

    if (analysis.decision === Decision.BLOCK) {
      addLog(`BLOCK: High risk detected on ${tx.id} (Score: ${analysis.score}).`, LogSeverity.WARN, 'DECISION');
    } else if (analysis.decision === Decision.MANUAL_REVIEW) {
      addLog(`HELD: Trace ${tx.id} requires human intelligence override.`, LogSeverity.WARN, 'DECISION');
      setReviewQueue(prev => [{ tx, analysis }, ...prev]);
    } else {
      addLog(`APPROVED: ${tx.id} processed in ${analysis.processingTimeMs.toFixed(2)}ms.`, LogSeverity.INFO, 'DECISION');
    }

    setStream(prev => {
      const next = [{ tx, analysis }, ...prev];
      return next.slice(0, SYSTEM_CONFIG.MAX_STREAM_SIZE);
    });

    setLatencyHistory(prev => {
      const next = [...prev, { 
        time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), 
        latency: parseFloat(analysis.processingTimeMs.toFixed(2)),
        id: tx.id 
      }];
      return next.slice(-80);
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
    if (latencyBuffer.current.length > 100) latencyBuffer.current.shift();
  }, [strategyIndex, addLog]);

  const handleManualAction = (id: string, action: Decision) => {
    addLog(`OVERRIDE: Analyst set ${id} to ${action}`, LogSeverity.INFO, 'HUMAN_OVERRIDE');
    
    // Clear from review queue
    setReviewQueue(prev => prev.filter(item => item.tx.id !== id));
    
    // Update master stream
    setStream(prev => prev.map(item => 
      item.tx.id === id ? { ...item, analysis: { ...item.analysis, decision: action } } : item
    ));

    // Update selection to show result
    if (selectedItem?.tx.id === id) {
      setSelectedItem(prev => prev ? { ...prev, analysis: { ...prev.analysis, decision: action } } : null);
    }
  };

  const handleChartSelection = (id: string) => {
    const item = stream.find(s => s.tx.id === id) || reviewQueue.find(s => s.tx.id === id);
    if (item) setSelectedItem(item);
  };

  useEffect(() => {
    const simulator = new StreamSimulator(handleNewTransaction);
    simulator.start(2000); // Slower for easier tracking during demo

    const metricsInterval = setInterval(() => {
      const latencies = [...latencyBuffer.current].sort((a, b) => a - b);
      const avgLat = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
      const p99Lat = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;
      
      setMetrics(prev => ({
        ...prev,
        throughput: txCounter.current / 2,
        avgLatency: avgLat,
        p99Latency: p99Lat,
        fraudRate: stream.length ? stream.filter(s => s.analysis.decision !== Decision.APPROVE).length / stream.length : 0,
        modelDrift: 0.012 + (Math.random() * 0.002 - 0.001)
      }));
      txCounter.current = 0;
    }, 2000);

    return () => {
      simulator.stop();
      clearInterval(metricsInterval);
    };
  }, [handleNewTransaction, stream.length]);

  const slaBudgetUsed = Math.min((metrics.p99Latency / SYSTEM_CONFIG.LATENCY_BUDGET_MS) * 100, 100);
  const slaStatus = metrics.p99Latency > SYSTEM_CONFIG.LATENCY_BUDGET_MS ? 'CRITICAL' : metrics.p99Latency > 80 ? 'WARNING' : 'OPTIMAL';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 lg:w-64 border-r border-slate-800 flex flex-col py-6 px-4 gap-8 bg-slate-900/50 z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="hidden lg:block text-2xl font-black tracking-tighter text-white uppercase italic">Sentinel</h1>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block font-black uppercase tracking-tight text-sm">Dashboard</span>
          </button>
          
          <button onClick={() => setActiveTab('review')} className={`relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'review' ? 'bg-amber-600/15 text-amber-400 border border-amber-500/20 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <UserCheck className="w-5 h-5" />
            <span className="hidden lg:block font-black uppercase tracking-tight text-sm">Review Center</span>
            {reviewQueue.length > 0 && (
              <span className="absolute top-2 right-2 lg:right-4 w-5 h-5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-slate-950">
                {reviewQueue.length}
              </span>
            )}
          </button>

          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'logs' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <ScrollText className="w-5 h-5" />
            <span className="hidden lg:block font-black uppercase tracking-tight text-sm">Observability</span>
          </button>
          
          <button onClick={() => setActiveTab('architecture')} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'architecture' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Cpu className="w-5 h-5" />
            <span className="hidden lg:block font-black uppercase tracking-tight text-sm">Architecture</span>
          </button>
        </div>

        <div className="mt-auto hidden lg:block p-5 rounded-2xl bg-slate-800/20 border border-slate-700/50">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Active Strategy</p>
          <p className="text-xs font-black text-indigo-400 uppercase truncate">{STRATEGIES[strategyIndex].name}</p>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        <Header metrics={metrics} strategy={STRATEGIES[strategyIndex]} />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {activeTab === 'dashboard' ? (
            <>
              <MetricsOverview metrics={metrics} />
              
              <div className="h-[340px] bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col backdrop-blur-xl shadow-2xl relative overflow-hidden group border-t-2 border-t-indigo-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ActivitySquare className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest italic">Latency Engine SLA Monitor</h2>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className={`text-5xl font-mono font-black tracking-tighter ${slaStatus === 'CRITICAL' ? 'text-rose-400' : slaStatus === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {metrics.p99Latency.toFixed(2)}<span className="text-base font-bold opacity-40 ml-1">ms</span>
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                        slaStatus === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
                        slaStatus === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      } uppercase`}>
                        {slaStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 relative z-10 mt-2">
                  <LatencyChart data={latencyHistory} onSelect={handleChartSelection} />
                </div>
              </div>

              <div className="flex gap-6 min-h-[500px]">
                <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
                    <div className="flex items-center gap-3">
                      <Waves className="w-4 h-4 text-amber-500 animate-pulse" />
                      <h2 className="font-black text-slate-200 uppercase text-xs tracking-widest italic">Live Data Plane</h2>
                    </div>
                  </div>
                  <TransactionList stream={stream} onSelect={setSelectedItem} selectedId={selectedItem?.tx.id} />
                </div>

                <div className="flex-1 relative">
                  <ExplainabilityView selectedItem={selectedItem} metrics={metrics} />
                  {selectedItem?.analysis.decision === Decision.MANUAL_REVIEW && (
                    <ReviewQueueOverlay item={selectedItem} onAction={handleManualAction} />
                  )}
                </div>
              </div>
            </>
          ) : activeTab === 'review' ? (
            <div className="flex gap-6 h-full">
              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                 <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-amber-400" />
                      <h2 className="font-black text-slate-100 uppercase tracking-widest text-sm italic">Manual Intervention Queue</h2>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase px-3 py-1 bg-slate-950 rounded border border-slate-800">
                      {reviewQueue.length} Pending Actions
                    </span>
                 </div>
                 <TransactionList stream={reviewQueue} onSelect={setSelectedItem} selectedId={selectedItem?.tx.id} />
              </div>
              <div className="flex-1 relative">
                <ExplainabilityView selectedItem={selectedItem} metrics={metrics} />
                {selectedItem?.analysis.decision === Decision.MANUAL_REVIEW && (
                  <ReviewQueueOverlay item={selectedItem} onAction={handleManualAction} />
                )}
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <LogsView logs={logs} onClear={() => setLogs([])} />
          ) : (
            <ArchitectureView />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
