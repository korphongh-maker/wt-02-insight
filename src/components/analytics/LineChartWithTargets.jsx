import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Dot
} from 'recharts';

export default function LineChartWithTargets({ data, targets = [], unit = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        ไม่มีข้อมูล
      </div>
    );
  }

  const yDomain = useMemo(() => {
    const allVals = [...data.map(d => d.value), ...targets];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const padding = (maxVal - minVal) * 0.15 || 1;
    return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
  }, [data, targets]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const d = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-1">{d.payload.label}</p>
          <p className="text-muted-foreground">
            ค่า: <span className="text-foreground font-medium">{d.value?.toFixed(2)} {unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 10 }} 
          stroke="hsl(var(--muted-foreground))"
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis domain={yDomain} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip content={<CustomTooltip />} />
        
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 3, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        />

        {targets.map((t, i) => (
          <ReferenceLine
            key={i}
            y={t}
            stroke={i === 0 ? '#ef4444' : '#f59e0b'}
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: `${t} ${unit}`,
              position: 'right',
              fontSize: 10,
              fill: i === 0 ? '#ef4444' : '#f59e0b',
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}