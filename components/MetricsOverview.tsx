
import React from 'react';
import { SystemMetrics } from '../types';
import { BarChart, Bar, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Clock, ShieldAlert, Cpu } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: SystemMetrics;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'Avg Latency',
      value: `${metrics.avgLatency.toFixed(1)}ms`,
      sub: 'In-Memory Processing',
      icon: Clock,
      color: metrics.avgLatency < 100 ? 'text-emerald-400' : 'text-amber-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Throughput',
      value: `${metrics.throughput.toFixed(1)}`,
      sub: 'Transactions / Sec',
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      label: 'Fraud Flag Rate',
      value: `${(metrics.fraudRate * 100).toFixed(1)}%`,
      sub: 'ML Signal Ratio',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    },
    {
      label: 'Model Health',
      value: 'Stable',
      sub: `Drift: ${metrics.modelDrift.toFixed(3)}`,
      icon: Cpu,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors cursor-default">
          <div className={`p-3 rounded-xl ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold tracking-tight ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;
