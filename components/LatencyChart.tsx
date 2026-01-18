
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { SYSTEM_CONFIG } from '../constants';

interface LatencyData {
  time: string;
  latency: number;
  id: string;
}

interface LatencyChartProps {
  data: LatencyData[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const LatencyChart: React.FC<LatencyChartProps> = ({ data, selectedId, onSelect }) => {
  const handleClick = (nextState: any) => {
    if (nextState && nextState.activePayload && nextState.activePayload.length > 0 && onSelect) {
      onSelect(nextState.activePayload[0].payload.id);
    }
  };

  return (
    <div className="h-full w-full min-h-[160px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          onClick={handleClick}
          cursor="crosshair"
          margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            hide 
          />
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            fontFamily="JetBrains Mono"
            tickFormatter={(value) => `${value}ms`}
            domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax / 10) * 10)]}
            tickCount={6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
            cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            labelStyle={{ color: '#94a3b8', display: 'none' }}
          />
          
          <ReferenceLine 
            y={SYSTEM_CONFIG.LATENCY_BUDGET_MS} 
            stroke="#f43f5e" 
            strokeDasharray="4 4"
            strokeWidth={2}
          >
            <Label 
              value="CRITICAL SLA (100ms)" 
              position="top" 
              fill="#f43f5e" 
              fontSize={8} 
              fontWeight="900"
              className="uppercase tracking-[0.2em]"
              offset={5}
            />
          </ReferenceLine>

          <Area 
            type="monotone" 
            dataKey="latency" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorLat)"
            isAnimationActive={false}
            activeDot={{ 
              r: 5, 
              fill: '#6366f1', 
              stroke: '#fff', 
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatencyChart;
