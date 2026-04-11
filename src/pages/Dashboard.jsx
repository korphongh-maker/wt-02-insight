import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import FilterBar from '../components/analytics/FilterBar';
import ChartPair from '../components/analytics/ChartPair';
import DataTableView from '../components/analytics/DataTableView';
import StatsCards from '../components/analytics/StatsCards';
import { SHIFTLY_CHARTS, DAILY_CHARTS } from '../lib/chartConfig';
import { parseSheetData, filterData, groupDataForBoxPlot, groupDataForLine, getAvailableYears } from '../lib/dataUtils';
import { SHIFTLY_RAW, DAILY_RAW, mapShiftly, mapDaily } from '../lib/rawData';

// Parse data once at module level
const shiftlyParsed = parseSheetData(SHIFTLY_RAW.map(mapShiftly), 'วันที่ตรวจ');
const dailyParsed = parseSheetData(DAILY_RAW.map(mapDaily), 'วันที่ตรวจ');

export default function Dashboard() {
  const [selectedTable, setSelectedTable] = useState('shiftly');
  const [granularity, setGranularity] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('02');

  const currentData = selectedTable === 'shiftly' ? shiftlyParsed : dailyParsed;
  const currentCharts = selectedTable === 'shiftly' ? SHIFTLY_CHARTS : DAILY_CHARTS;

  const availableYears = useMemo(() => {
    const years = getAvailableYears(currentData);
    return years.length > 0 ? years : ['2026'];
  }, [currentData]);

  const filteredData = useMemo(() => {
    return filterData(currentData, granularity, selectedYear, selectedMonth);
  }, [currentData, granularity, selectedYear, selectedMonth]);

  const chartDataPairs = useMemo(() => {
    return currentCharts.map(chart => ({
      ...chart,
      boxPlotData: groupDataForBoxPlot(filteredData, chart.dataKey, granularity),
      lineData: groupDataForLine(filteredData, chart.dataKey, granularity),
    }));
  }, [filteredData, currentCharts, granularity]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-foreground leading-tight">Checksheet WT-02 Analytics</h1>
            <p className="text-xs text-muted-foreground">วิเคราะห์ข้อมูลตรวจเช็คเครื่องจักร</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-5 space-y-5">
        <FilterBar
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          granularity={granularity}
          onGranularityChange={setGranularity}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableYears={availableYears}
        />

        <StatsCards data={filteredData} chartCount={currentCharts.length} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartDataPairs.map(chart => (
            <ChartPair
              key={chart.id}
              title={chart.title}
              boxPlotData={chart.boxPlotData}
              lineData={chart.lineData}
              targets={chart.targets}
              unit={chart.unit}
            />
          ))}
        </div>

        <DataTableView 
          data={filteredData}
          charts={currentCharts}
          dateKey="วันที่ตรวจ"
        />
      </main>
    </div>
  );
}