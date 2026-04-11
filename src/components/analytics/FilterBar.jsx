import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableMonths } from "../../lib/dataUtils";
import { BarChart3, Calendar, Filter } from "lucide-react";

export default function FilterBar({ 
  selectedTable, onTableChange,
  granularity, onGranularityChange,
  selectedYear, onYearChange,
  selectedMonth, onMonthChange,
  availableYears 
}) {
  const months = getAvailableMonths();

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">ตัวกรองข้อมูล</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ตาราง</label>
          <Select value={selectedTable} onValueChange={onTableChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shiftly">ทุกกะ</SelectItem>
              <SelectItem value="daily">ทุกวัน</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">มุมมอง</label>
          <Select value={granularity} onValueChange={onGranularityChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">รายวัน</SelectItem>
              <SelectItem value="month">รายเดือน</SelectItem>
              <SelectItem value="year">รายปี</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ปี</label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(granularity === 'day') && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">เดือน</label>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}