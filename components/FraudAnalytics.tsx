
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, RiskAnalysis, Decision, FraudAnalyticsSummary } from '../types';
import { getSecurityPostureAdvice } from '../services/geminiService';
import { ShieldCheck, ShieldAlert, Globe, BarChart3, Lock, Shield, Info, Zap, Loader2, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FraudAnalyticsProps {
  stream: { tx: Transaction, analysis: RiskAnalysis }[];
}

const FraudAnalytics: React.FC<FraudAnalyticsProps> = ({ stream }) => {
  const [summary, setSummary] = useState<FraudAnalyticsSummary | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Memoize calculation to prevent unnecessary re-renders
  const calculatedSummary = useMemo(() => {
    if (!stream.length) return null;

    const blocked = stream.filter(s => s.analysis.decision === Decision.BLOCK);
    const totalProtected = blocked.reduce((acc, curr) => acc + curr.tx.amount, 0);
    
    const vectorMap: Record<string, number> = {};
    blocked.forEach(s => {
      s.analysis.flags.forEach(f => {
        vectorMap[f] = (vectorMap[f] || 0) + 1;
      });
    });
    
    const topVectors = Object.entries(vectorMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const geoMap: Record<string, { city: string, country: string, attempts: number }> = {};
    blocked.forEach(s => {
      const key = `${s.tx.location.city}-${s.tx.location.country}`;
      if (!geoMap[key]) {
        geoMap[key] = { city: s.tx.location.city, country: s.tx.location.country, attempts: 0 };
      }
      geoMap[key].attempts += 1;
    });

    const heatmap = Object.values(geoMap).sort((a, b) => b.attempts - a.attempts).slice(0, 4);
    const vulnerabilityIndex = Math.min(Math.round((blocked.length / Math.max(stream.length, 1)) * 300), 100);

    return {
      totalValueProtected: totalProtected,
      vulnerabilityIndex,
      topAttackVectors: topVectors,
      geographicHeatmap: heatmap
    };
  }, [stream]);

  useEffect(() => {
    if (calculatedSummary) {
      setSummary(calculatedSummary);
      setLoadingAdvice(true);
      getSecurityPostureAdvice(calculatedSummary).then(res => {
        setAdvice(res);
        setLoadingAdvice(false);
      });
    }
  }, [calculatedSummary]);

  if (!stream.length || !summary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
        <div className="p-8 bg-slate-950 rounded-full border border-slate-800 animate-pulse">
          <Search className="w-16 h-16 text-indigo-500/20" />
        </div>
        <div className="max-w-md">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Analyzing Ingestion Stream</h2>
          <p className="text-slate-500 text-sm leading-relaxed italic">
            Fraud Analytics require a baseline of processed events to generate a security profile. Please wait for the engine to synchronize...
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
           <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Profiling in progress</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Executive Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-20 h-20 text-rose-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Assets Protected</p>
          <h3 className="text-4xl font-black text-rose-400 font-mono tracking-tighter">
            ${summary.totalValueProtected.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Total capital saved by <span className="text-rose-500 font-bold italic">real-time intervention</span> this period.
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Lock className="w-20 h-20 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Vulnerability Index</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-amber-400 font-mono tracking-tighter">
              {summary.vulnerabilityIndex}
            </h3>
            <span className="text-xs font-bold text-slate-500">/ 100</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
             <div 
               className="h-full bg-amber-500 transition-all duration-1000" 
               style={{ width: `${summary.vulnerabilityIndex}%` }}
             />
          </div>
        </div>

        <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Globe className="w-20 h-20 text-indigo-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Exposure Density</p>
          <h3 className="text-4xl font-black text-indigo-400 font-mono tracking-tighter">
            {summary.geographicHeatmap.length}
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Distinct high-risk jurisdictions currently targeting client assets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Vector Analysis */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl relative min-h-[450px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500/10 rounded-xl">
              <BarChart3 className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Threat Vector Analysis</h2>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            {summary.topAttackVectors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.topAttackVectors} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="type" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                    width={120}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {summary.topAttackVectors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#fbbf24'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center italic text-slate-600 text-xs">
                No active attack vectors detected in current stream window.
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-slate-950 rounded-2xl border border-slate-800/50 flex gap-3">
             <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
               {summary.topAttackVectors.length > 0 
                 ? `Primary risk is currently attributed to ${summary.topAttackVectors[0]?.type}. Recommend proactive surveillance.`
                 : "Environmental noise is within standard parameters. No critical vector identified."}
             </p>
          </div>
        </div>

        {/* AI Security Advice */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col relative shadow-2xl min-h-[450px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-indigo-500"></div>
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Guardian Security Posture Advice</h2>
           </div>

           <div className="flex-1 bg-slate-950/80 rounded-2xl p-6 border border-slate-800/50 overflow-y-auto">
              {loadingAdvice ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                  <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-line italic">
                    {advice || "Generating security posture analysis based on latest ingestion metadata..."}
                  </p>
                </div>
              )}
           </div>
           
           <button className="mt-6 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all group active:scale-95 shadow-lg shadow-indigo-500/20">
              <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Implement Hardened Controls
           </button>
        </div>
      </div>

      {/* Origin Map Summary */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl">
         <div className="flex items-center gap-3 mb-6">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest italic">Attempt Origins Summary</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.geographicHeatmap.length > 0 ? summary.geographicHeatmap.map((geo, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{geo.country}</p>
                  <p className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{geo.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black font-mono text-rose-500 tracking-tighter">{geo.attempts}</p>
                  <p className="text-[8px] text-slate-600 font-black uppercase">Attempts</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] italic">
                Awaiting first geolocated threat signal...
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default FraudAnalytics;
