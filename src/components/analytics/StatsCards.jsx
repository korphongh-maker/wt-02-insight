import { Database, CalendarDays, Activity, Users } from 'lucide-react';

export default function StatsCards({ data, chartCount }) {
  const uniqueDates = new Set(data.map(r => r._day)).size;
  const uniqueInspectors = new Set(
    data.map(r => r['ผู้ตรวจเช็ค']).filter(Boolean)
  ).size;

  const stats = [
    { label: 'จำนวนข้อมูล', value: data.length, icon: Database, color: 'text-blue-500 bg-blue-50' },
    { label: 'จำนวนวันที่ตรวจ', value: uniqueDates, icon: CalendarDays, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'จำนวนกราฟ', value: chartCount, icon: Activity, color: 'text-purple-500 bg-purple-50' },
    { label: 'ผู้ตรวจ', value: uniqueInspectors, icon: Users, color: 'text-amber-500 bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}