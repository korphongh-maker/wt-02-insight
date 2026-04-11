import { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';

export default function BoxPlotChart({ data, targets = [], unit = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        ไม่มีข้อมูล
      </div>
    );
  }

  const yDomain = useMemo(() => {
    const allVals = [...data.flatMap(d => [d.min, d.max]), ...targets];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || Math.abs(maxVal) * 0.1 || 1;
    const padding = range * 0.15;
    return [
      parseFloat((minVal - padding).toFixed(4)),
      parseFloat((maxVal + padding).toFixed(4)),
    ];
  }, [data, targets]);

  const chartData = data.map(d => ({
    label: d.label,
    base: d.min,
    whiskerLow: Math.max(0, d.q1 - d.min),
    q1ToMedian: Math.max(0, d.median - d.q1),
    medianToQ3: Math.max(0, d.q3 - d.median),
    whiskerHigh: Math.max(0, d.max - d.q3),
    median: d.median,
    mean: d.mean,
    min: d.min,
    max: d.max,
    q1: d.q1,
    q3: d.q3,
    count: d.count,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    const fmt = v => (typeof v === 'number' ? parseFloat(v.toFixed(4)).toString() : '-');
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold mb-1">{d.label}</p>
        <div className="space-y-0.5 text-muted-foreground">
          <p>จำนวน: <span className="text-foreground font-medium">{d.count}</span></p>
          <p>สูงสุด: <span className="text-foreground font-medium">{fmt(d.max)} {unit}</span></p>
          <p>Q3: <span className="text-foreground font-medium">{fmt(d.q3)} {unit}</span></p>
          <p>มัธยฐาน: <span className="text-foreground font-medium">{fmt(d.median)} {unit}</span></p>
          <p>เฉลี่ย: <span className="text-foreground font-medium">{fmt(d.mean)} {unit}</span></p>
          <p>Q1: <span className="text-foreground font-medium">{fmt(d.q1)} {unit}</span></p>
          <p>ต่ำสุด: <span className="text-foreground font-medium">{fmt(d.min)} {unit}</span></p>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis domain={yDomain} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip content={<CustomTooltip />} />

        <Bar dataKey="base" stackId="box" fill="transparent" legendType="none" />
        <Bar dataKey="whiskerLow" stackId="box" fill="hsl(var(--muted-foreground))" opacity={0.35} legendType="none" />
        <Bar dataKey="q1ToMedian" stackId="box" fill="hsl(var(--primary))" opacity={0.7} legendType="none" />
        <Bar dataKey="medianToQ3" stackId="box" fill="hsl(var(--primary))" opacity={0.45} legendType="none" />
        <Bar dataKey="whiskerHigh" stackId="box" fill="hsl(var(--muted-foreground))" opacity={0.35} legendType="none" />

        {targets.map((t, i) => (
          <ReferenceLine
            key={i}
            y={t}
            stroke={i === 0 ? '#ef4444' : '#f59e0b'}
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: `${t} ${unit}`, position: 'right', fontSize: 10, fill: i === 0 ? '#ef4444' : '#f59e0b' }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}