import { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';

// Custom shape that draws the full box plot using SVG
function BoxShape(props) {
  const { x, y, width, height, payload, yAxis } = props;
  if (!payload || !yAxis) return null;

  const { min, q1, median, q3, max, isSingle } = payload;
  const { scale } = yAxis;
  if (!scale) return null;

  const toY = val => scale(val);

  if (isSingle) {
    const lineY = toY(median);
    return (
      <line
        x1={x}
        y1={lineY}
        x2={x + width}
        y2={lineY}
        stroke="hsl(var(--primary))"
        strokeWidth={3}
        strokeLinecap="round"
      />
    );
  }

  const yMin = toY(min);
  const yQ1 = toY(q1);
  const yMedian = toY(median);
  const yQ3 = toY(q3);
  const yMax = toY(max);
  const cx = x + width / 2;
  const whiskerW = width * 0.3;
  const primaryColor = 'hsl(217, 91%, 50%)';
  const mutedColor = 'hsl(220, 10%, 46%)';

  return (
    <g>
      {/* Lower whisker line */}
      <line x1={cx} y1={yMin} x2={cx} y2={yQ1} stroke={mutedColor} strokeWidth={1.5} />
      {/* Upper whisker line */}
      <line x1={cx} y1={yQ3} x2={cx} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
      {/* Min cap */}
      <line x1={cx - whiskerW} y1={yMin} x2={cx + whiskerW} y2={yMin} stroke={mutedColor} strokeWidth={1.5} />
      {/* Max cap */}
      <line x1={cx - whiskerW} y1={yMax} x2={cx + whiskerW} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
      {/* IQR box */}
      <rect
        x={x + width * 0.1}
        y={yQ3}
        width={width * 0.8}
        height={Math.max(1, yQ1 - yQ3)}
        fill={primaryColor}
        fillOpacity={0.35}
        stroke={primaryColor}
        strokeWidth={1.5}
      />
      {/* Median line */}
      <line
        x1={x + width * 0.1}
        y1={yMedian}
        x2={x + width * 0.9}
        y2={yMedian}
        stroke={primaryColor}
        strokeWidth={2.5}
      />
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

  // chartData just needs a dummy value so Bar renders per entry
  const chartData = data.map(d => ({
    label: d.label,
    _dummy: 0,
    isSingle: d.min === d.max,
    min: d.min, q1: d.q1, median: d.median,
    q3: d.q3, max: d.max, mean: d.mean, count: d.count,
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />

        <Bar dataKey="_dummy" shape={<BoxShape />} legendType="none" isAnimationActive={false} />

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