import { useMemo } from 'react';
import {
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Customized
} from 'recharts';

// Custom shape receives x, y, width, height + all bar data via props
// But we need to draw using actual data values, so we use a custom shape
// that accesses the chart's yAxis scale through the background approach.
// Instead, we pass the full domain info and compute positions manually.

function AllBoxes({ xAxisMap, yAxisMap, data, yDomain }) {
  const xAxis = xAxisMap && xAxisMap[0];
  const yAxis = yAxisMap && yAxisMap[0];
  if (!xAxis || !yAxis) return null;

  const primaryColor = 'hsl(217, 91%, 50%)';
  const mutedColor = 'hsl(220, 10%, 46%)';

  const bandWidth = xAxis.bandSize || (xAxis.width / (data.length || 1));

  return (
    <g>
      {data.map((d, i) => {
        const cx = xAxis.x + xAxis.bandSize * i + xAxis.bandSize / 2 + (xAxis.padding?.left || 0);
        const toY = (val) => yAxis.y + yAxis.height - ((val - yAxis.niceTicks?.[0] ?? yDomain[0]) / ((yAxis.niceTicks?.slice(-1)[0] ?? yDomain[1]) - (yAxis.niceTicks?.[0] ?? yDomain[0]))) * yAxis.height;

        // Use scale function directly
        const scaleY = yAxis.scale;
        if (!scaleY) return null;

        const boxW = bandWidth * 0.5;
        const whiskerW = bandWidth * 0.25;

        if (d.isSingle) {
          const lineY = scaleY(d.median);
          return (
            <line key={i} x1={cx - boxW / 2} y1={lineY} x2={cx + boxW / 2} y2={lineY}
              stroke={primaryColor} strokeWidth={3} strokeLinecap="round" />
          );
        }

        const yMin = scaleY(d.min);
        const yQ1 = scaleY(d.q1);
        const yMedian = scaleY(d.median);
        const yQ3 = scaleY(d.q3);
        const yMax = scaleY(d.max);

        return (
          <g key={i}>
            <line x1={cx} y1={yMin} x2={cx} y2={yQ1} stroke={mutedColor} strokeWidth={1.5} />
            <line x1={cx} y1={yQ3} x2={cx} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
            <line x1={cx - whiskerW} y1={yMin} x2={cx + whiskerW} y2={yMin} stroke={mutedColor} strokeWidth={1.5} />
            <line x1={cx - whiskerW} y1={yMax} x2={cx + whiskerW} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
            <rect x={cx - boxW / 2} y={yQ3} width={boxW} height={Math.max(1, yQ1 - yQ3)}
              fill={primaryColor} fillOpacity={0.3} stroke={primaryColor} strokeWidth={1.5} />
            <line x1={cx - boxW / 2} y1={yMedian} x2={cx + boxW / 2} y2={yMedian}
              stroke={primaryColor} strokeWidth={2.5} />
          </g>
        );
      })}
    </g>
  );
}


export default function BoxPlotChart({ data, targets = [], unit = '', yDomain: yDomainProp }) {

  const yDomain = useMemo(() => {
    if (yDomainProp) return yDomainProp;
    const allVals = [...(data || []).flatMap(d => [d.min, d.max]), ...targets];
    if (allVals.length === 0) return [0, 1];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || Math.abs(maxVal) * 0.1 || 1;
    const padding = range * 0.3;
    return [
      parseFloat((minVal - padding).toFixed(6)),
      parseFloat((maxVal + padding).toFixed(6)),
    ];
  }, [data, targets, yDomainProp]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        ไม่มีข้อมูล
      </div>
    );
  }

  const chartData = data.map(d => ({
    label: d.label,
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
        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={50} padding={{ left: 40, right: 40 }} />
        <YAxis domain={yDomain} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={45} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />

        <Customized component={(props) => <AllBoxes {...props} data={chartData} yDomain={yDomain} />} />

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