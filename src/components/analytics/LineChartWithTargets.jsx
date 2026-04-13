import { useMemo } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';

export default function LineChartWithTargets({ data, targets = [], unit = '', yDomain: yDomainProp, xLabels }) {

  // Anchor data to xLabels from boxPlot so X-axis positions are identical
  const alignedData = useMemo(() => {
    if (!xLabels || xLabels.length === 0) return data;
    const byLabel = {};
    (data || []).forEach(d => { byLabel[d.label] = d; });
    return xLabels.map(label => byLabel[label] || { label, value: null });
  }, [data, xLabels]);

  const yDomain = useMemo(() => {
    if (yDomainProp) return yDomainProp;
    const allVals = [...(alignedData || []).map(d => d.value).filter(v => v != null), ...targets];
    if (allVals.length === 0) return [0, 1];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const padding = (maxVal - minVal) * 0.15 || 1;
    return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
  }, [alignedData, targets, yDomainProp]);

  if (!alignedData || alignedData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        ไม่มีข้อมูล
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const d = payload[0];
      const count = d.payload.count || 1;
      const valueLabel = count > 1 ? 'เฉลี่ย' : 'ค่า';
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-1">{d.payload.label}</p>
          <p className="text-muted-foreground">
            {valueLabel}: <span className="text-foreground font-medium">{d.value?.toFixed(2)} {unit}</span>
          </p>
          <p className="text-muted-foreground">
            จำนวน: <span className="text-foreground font-medium">{count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={alignedData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 10 }} 
          stroke="hsl(var(--muted-foreground))"
          angle={-30}
          textAnchor="end"
          height={50}
          padding={{ left: 40, right: 40 }}
        />
        <YAxis domain={yDomain} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={45} />
        <Tooltip content={<CustomTooltip />} />
        
        <Bar dataKey="value" fill="transparent" isAnimationActive={false} barSize={0} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 3, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          connectNulls={false}
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}