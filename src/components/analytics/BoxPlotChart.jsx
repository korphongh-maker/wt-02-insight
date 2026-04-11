import { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, ErrorBar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

// Custom box plot using ComposedChart with custom shapes
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
    const padding = (maxVal - minVal) * 0.15 || 1;
    return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
  }, [data, targets]);

  // Transform data for stacked bar to represent box plot
  const chartData = data.map(d => ({
    label: d.label,
    // base (invisible) = min
    base: d.min,
    // lower whisker to Q1
    whiskerLow: d.q1 - d.min,
    // Q1 to median
    q1ToMedian: d.median - d.q1,
    // median to Q3
    medianToQ3: d.q3 - d.median,
    // Q3 to max
    whiskerHigh: d.max - d.q3,
    median: d.median,
    mean: d.mean,
    min: d.min,
    max: d.max,
    q1: d.q1,
    q3: d.q3,
    count: d.count,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const d = payload[0]?.payload;
      if (!d) return null;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-1">{d.label}</p>
          <div className="space-y-0.5 text-muted-foreground">
            <p>จำนวน: <span className="text-foreground font-medium">{d.count}</span></p>
            <p>สูงสุด: <span className="text-foreground font-medium">{d.max?.toFixed(2)} {unit}</span></p>
            <p>Q3: <span className="text-foreground font-medium">{d.q3?.toFixed(2)} {unit}</span></p>
            <p>มัธยฐาน: <span className="text-foreground font-medium">{d.median?.toFixed(2)} {unit}</span></p>
            <p>เฉลี่ย: <span className="text-foreground font-medium">{d.mean?.toFixed(2)} {unit}</span></p>
            <p>Q1: <span className="text-foreground font-medium">{d.q1?.toFixed(2)} {unit}</span></p>
            <p>ต่ำสุด: <span className="text-foreground font-medium">{d.min?.toFixed(2)} {unit}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis domain={yDomain} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Invisible base */}
        <Bar dataKey="base" stackId="box" fill="transparent" />
        
        {/* Whisker low */}
        <Bar dataKey="whiskerLow" stackId="box" fill="hsl(var(--muted-foreground))" opacity={0.3} barSize={2} />
        
        {/* Q1 to Median */}
        <Bar dataKey="q1ToMedian" stackId="box" fill="hsl(var(--primary))" opacity={0.7} barSize={30} radius={[0, 0, 0, 0]} />
        
        {/* Median to Q3 */}
        <Bar dataKey="medianToQ3" stackId="box" fill="hsl(var(--primary))" opacity={0.45} barSize={30} radius={[0, 0, 0, 0]} />
        
        {/* Whisker high */}
        <Bar dataKey="whiskerHigh" stackId="box" fill="hsl(var(--muted-foreground))" opacity={0.3} barSize={2} />

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
      </ComposedChart>
    </ResponsiveContainer>
  );
}