import { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts';

// Custom shape receives x, y, width, height + all bar data via props
// But we need to draw using actual data values, so we use a custom shape
// that accesses the chart's yAxis scale through the background approach.
// Instead, we pass the full domain info and compute positions manually.

function BoxShape(props) {
  const { x, width, value, background, min, q1, median, q3, max, isSingle, yDomain, chartHeight } = props;
  
  if (min === undefined || !background) return null;

  // Compute pixel y from value using domain + chart height
  const domainMin = yDomain[0];
  const domainMax = yDomain[1];
  const totalH = background.height;
  const topY = background.y;

  const toY = (val) => topY + totalH - ((val - domainMin) / (domainMax - domainMin)) * totalH;

  const primaryColor = 'hsl(217, 91%, 50%)';
  const mutedColor = 'hsl(220, 10%, 46%)';
  const cx = x + width / 2;
  const boxW = width * 0.7;
  const whiskerW = width * 0.3;

  if (isSingle) {
    const lineY = toY(median);
    return (
      <line
        x1={cx - boxW / 2} y1={lineY}
        x2={cx + boxW / 2} y2={lineY}
        stroke={primaryColor} strokeWidth={3} strokeLinecap="round"
      />
    );
  }

  const yMin = toY(min);
  const yQ1 = toY(q1);
  const yMedian = toY(median);
  const yQ3 = toY(q3);
  const yMax = toY(max);

  return (
    <g>
      <line x1={cx} y1={yMin} x2={cx} y2={yQ1} stroke={mutedColor} strokeWidth={1.5} />
      <line x1={cx} y1={yQ3} x2={cx} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
      <line x1={cx - whiskerW} y1={yMin} x2={cx + whiskerW} y2={yMin} stroke={mutedColor} strokeWidth={1.5} />
      <line x1={cx - whiskerW} y1={yMax} x2={cx + whiskerW} y2={yMax} stroke={mutedColor} strokeWidth={1.5} />
      <rect
        x={cx - boxW / 2} y={yQ3}
        width={boxW} height={Math.max(1, yQ1 - yQ3)}
        fill={primaryColor} fillOpacity={0.3}
        stroke={primaryColor} strokeWidth={1.5}
      />
      <line
        x1={cx - boxW / 2} y1={yMedian}
        x2={cx + boxW / 2} y2={yMedian}
        stroke={primaryColor} strokeWidth={2.5}
      />
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
    // dummy value in middle of range so bar registers for tooltip
    _dummy: (d.min + d.max) / 2,
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

        <Bar
          dataKey="_dummy"
          isAnimationActive={false}
          shape={(props) => (
            <BoxShape
              {...props}
              min={props.min}
              q1={props.q1}
              median={props.median}
              q3={props.q3}
              max={props.max}
              isSingle={props.isSingle}
              yDomain={yDomain}
            />
          )}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill="transparent" />
          ))}
        </Bar>

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