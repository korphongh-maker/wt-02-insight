import { useMemo } from 'react';
import {
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Customized
} from 'recharts';

function BoxPlotLayer({ xAxisMap, yAxisMap, data }) {
  const xAxis = xAxisMap && xAxisMap[0];
  const yAxis = yAxisMap && yAxisMap[0];
  if (!xAxis || !yAxis) return null;

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
  const bandwidth = xScale.bandwidth ? xScale.bandwidth() : 20;

  const primaryColor = 'hsl(217, 91%, 50%)';
  const mutedColor = 'hsl(220, 10%, 46%)';

  return (
    <g>
      {data.map((d, i) => {
        const cx = xScale(d.label) + bandwidth / 2;
        const boxW = bandwidth * 0.6;
        const whiskerW = bandwidth * 0.25;

        if (d.isSingle) {
          const lineY = yScale(d.median);
          return (
            <line
              key={i}
              x1={cx - boxW / 2}
              y1={lineY}
              x2={cx + boxW / 2}
              y2={lineY}
              stroke={primaryColor}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        }

        const yMin = yScale(d.min);
        const yQ1 = yScale(d.q1);
        const yMedian = yScale(d.median);
        const yQ3 = yScale(d.q3);
        const yMax = yScale(d.max);

        return (
          <g key={i}>
            {/* Lower whisker */}
            <line x1={cx} y1={yMin} x2={cx} y2={yQ1} stroke={mutedColor} strokeWidth={1.5} />
            {/* Upper whisker */}
            <line x1={cx} y1={yQ3} x2={cx} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
            {/* Min cap */}
            <line x1={cx - whiskerW} y1={yMin} x2={cx + whiskerW} y2={yMin} stroke={mutedColor} strokeWidth={1.5} />
            {/* Max cap */}
            <line x1={cx - whiskerW} y1={yMax} x2={cx + whiskerW} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
            {/* IQR box */}
            <rect
              x={cx - boxW / 2}
              y={yQ3}
              width={boxW}
              height={Math.max(1, yQ1 - yQ3)}
              fill={primaryColor}
              fillOpacity={0.3}
              stroke={primaryColor}
              strokeWidth={1.5}
            />
            {/* Median line */}
            <line
              x1={cx - boxW / 2}
              y1={yMedian}
              x2={cx + boxW / 2}
              y2={yMedian}
              stroke={primaryColor}
              strokeWidth={2.5}
            />
          </g>
        );
      })}
    </g>
  );
}

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
    const padding = range * 0.3;
    return [
      parseFloat((minVal - padding).toFixed(6)),
      parseFloat((maxVal + padding).toFixed(6)),
    ];
  }, [data, targets]);

  const chartData = data.map(d => ({
    label: d.label,
    isSingle: d.min === d.max,
    min: d.min, q1: d.q1, median: d.median,
    q3: d.q3, max: d.max, mean: d.mean, count: d.count,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    // Find the matching data point by label
    const label = payload[0]?.payload?.label;
    const d = chartData.find(r => r.label === label);
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />

        <Customized component={(props) => <BoxPlotLayer {...props} data={chartData} />} />

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