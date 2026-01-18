
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
    <div className="h-48 w-full mt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          onClick={handleClick}
          cursor="pointer"
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
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
            fontSize={10} 
            tickFormatter={(value) => `${value}ms`}
            domain={[0, 150]}
            tickCount={6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
            itemStyle={{ color: '#818cf8' }}
            cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
          />
          
          {/* SLA Threshold Line */}
          <ReferenceLine 
            y={SYSTEM_CONFIG.LATENCY_BUDGET_MS} 
            stroke="#f43f5e" 
            strokeDasharray="5 5"
            strokeWidth={1}
          >
            <Label 
              value="SLA LIMIT (100ms)" 
              position="insideTopRight" 
              fill="#f43f5e" 
              fontSize={9} 
              fontWeight="bold"
              className="uppercase tracking-widest"
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
              r: 6, 
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
