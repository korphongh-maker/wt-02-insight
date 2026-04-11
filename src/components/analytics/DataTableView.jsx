import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import moment from 'moment';

export default function DataTableView({ data, charts, dateKey }) {
  const [sortKey, setSortKey] = useState(dateKey);
  const [sortDir, setSortDir] = useState('desc');

  const columns = useMemo(() => {
    const cols = [
      { key: dateKey, label: 'วันที่ตรวจ', type: 'date' },
    ];
    charts.forEach(c => {
      cols.push({ key: c.dataKey, label: c.title, type: 'number' });
    });
    return cols;
  }, [charts, dateKey]);

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const col = columns.find(c => c.key === sortKey);
      if (col?.type === 'date') {
        return sortDir === 'asc' 
          ? moment(aVal).valueOf() - moment(bVal).valueOf()
          : moment(bVal).valueOf() - moment(aVal).valueOf();
      }
      if (col?.type === 'number') {
        return sortDir === 'asc'
          ? (parseFloat(aVal) || 0) - (parseFloat(bVal) || 0)
          : (parseFloat(bVal) || 0) - (parseFloat(aVal) || 0);
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [data, sortKey, sortDir, columns]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-primary" /> 
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          ตารางข้อมูล ({sortedData.length} รายการ)
        </h3>
      </div>
      <ScrollArea className="max-h-[500px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead 
                    key={col.key}
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-xs whitespace-nowrap select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[200px]">{col.label}</span>
                      <SortIcon colKey={col.key} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                    {columns.map(col => (
                      <TableCell key={col.key} className="text-xs whitespace-nowrap">
                        {col.type === 'date' 
                          ? moment(row[col.key]).format('DD/MM/YYYY HH:mm')
                          : row[col.key] != null 
                            ? typeof row[col.key] === 'number' ? row[col.key].toFixed(2) : row[col.key]
                            : '-'
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}