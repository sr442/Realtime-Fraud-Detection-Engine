
import React from 'react';
import { SystemMetrics } from '../types';
import { Clock, TrendingUp, ShieldAlert, Cpu, Activity } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: SystemMetrics;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'Avg Latency',
      value: `${metrics.avgLatency.toFixed(2)}ms`,
      sub: 'Network Response',
      icon: Clock,
      color: metrics.avgLatency < 80 ? 'text-emerald-400' : 'text-amber-400',
      bg: 'bg-emerald-500/10',
      border: metrics.avgLatency < 80 ? 'border-emerald-500/20' : 'border-amber-500/20'
    },
    {
      label: 'Throughput',
      value: `${metrics.throughput.toFixed(2)}`,
      sub: 'Events / Sec',
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      label: 'Fraud Signals',
      value: `${(metrics.fraudRate * 100).toFixed(1)}%`,
      sub: 'Positive Match',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    {
      label: 'Model Health',
      value: 'Synced',
      sub: `Drift: ${metrics.modelDrift.toFixed(5)}`,
      icon: Cpu,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className={`p-4 rounded-2xl bg-slate-900/40 border ${card.border} flex items-center gap-4 hover:bg-slate-900/60 transition-all shadow-lg`}>
          <div className={`p-3 rounded-xl ${card.bg}`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em]">{card.label}</p>
              <Activity className={`w-2.5 h-2.5 ${card.color} opacity-30 animate-pulse`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black tracking-tight font-mono ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;
