import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoxPlotChart from './BoxPlotChart';
import LineChartWithTargets from './LineChartWithTargets';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function ChartPair({ title, boxPlotData, lineData, targets, unit }) {
  const yDomain = useMemo(() => {
    const allVals = [
      ...boxPlotData.flatMap(d => [d.min, d.max]),
      ...lineData.map(d => d.value),
      ...(targets || []),
    ].filter(v => v != null && !isNaN(v));
    if (allVals.length === 0) return ['auto', 'auto'];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || Math.abs(maxVal) * 0.1 || 1;
    const padding = range * 0.2;
    return [
      parseFloat((minVal - padding).toFixed(6)),
      parseFloat((maxVal + padding).toFixed(6)),
    ];
  }, [boxPlotData, lineData, targets]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-3 leading-tight">{title}</h3>
      <Tabs defaultValue="boxplot" className="w-full">
        <TabsList className="mb-3 h-8">
          <TabsTrigger value="boxplot" className="text-xs gap-1.5 h-7 px-3">
            <BarChart3 className="w-3.5 h-3.5" />
            Box Plot
          </TabsTrigger>
          <TabsTrigger value="line" className="text-xs gap-1.5 h-7 px-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Line Chart
          </TabsTrigger>
        </TabsList>
        <TabsContent value="boxplot">
          <BoxPlotChart data={boxPlotData} targets={targets} unit={unit} yDomain={yDomain} />
        </TabsContent>
        <TabsContent value="line">
          <LineChartWithTargets data={lineData} targets={targets} unit={unit} yDomain={yDomain} />
        </TabsContent>
      </Tabs>
    </div>
  );
}