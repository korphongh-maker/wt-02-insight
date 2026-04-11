import moment from 'moment';

// Parse raw data from the Excel sheets
export function parseSheetData(rows, dateKey) {
  return rows
    .filter(row => row[dateKey])
    .map(row => ({
      ...row,
      _date: moment(row[dateKey]),
      _day: moment(row[dateKey]).format('YYYY-MM-DD'),
      _month: moment(row[dateKey]).format('YYYY-MM'),
      _year: moment(row[dateKey]).format('YYYY'),
    }));
}

// Filter data by granularity and selected period
export function filterData(data, granularity, selectedYear, selectedMonth) {
  return data.filter(row => {
    if (granularity === 'day') {
      return row._year === selectedYear && row._month === `${selectedYear}-${selectedMonth}`;
    } else if (granularity === 'month') {
      return row._year === selectedYear;
    }
    return true; // year view shows all
  });
}

// Group data for box plot
export function groupDataForBoxPlot(data, dataKey, granularity) {
  const groups = {};
  const keyOrder = {};
  data.forEach(row => {
    const val = parseFloat(row[dataKey]);
    if (isNaN(val)) return;
    let key;
    let sortKey;
    if (granularity === 'day') {
      key = moment(row._day).format('DD/MM');
      sortKey = row._day;
    } else if (granularity === 'month') {
      key = moment(row._month + '-01').format('MMM YY');
      sortKey = row._month;
    } else {
      key = row._year;
      sortKey = row._year;
    }
    if (!groups[key]) { groups[key] = []; keyOrder[key] = sortKey; }
    groups[key].push(val);
  });

  const sorted = Object.keys(groups).sort((a, b) => keyOrder[a].localeCompare(keyOrder[b]));
  return sorted.map(label => {
    const values = [...groups[label]].sort((a, b) => a - b);
    const n = values.length;
    const q1 = percentile(values, 25);
    const median = percentile(values, 50);
    const q3 = percentile(values, 75);
    const min = values[0];
    const max = values[n - 1];
    const mean = values.reduce((s, v) => s + v, 0) / n;
    return { label, min, q1, median, q3, max, mean, count: n };
  });
}

// Group data for line chart
export function groupDataForLine(data, dataKey, granularity) {
  if (granularity === 'month' || granularity === 'year') {
    // Group by month and average
    const groups = {};
    const keyOrder = {};
    data.forEach(row => {
      const val = parseFloat(row[dataKey]);
      if (isNaN(val)) return;
      const key = row._month; // always group by month
      const label = moment(row._month + '-01').format('MMM YY');
      if (!groups[key]) { groups[key] = { label, values: [], sortKey: key }; }
      groups[key].values.push(val);
    });
    return Object.values(groups)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(g => ({
        label: g.label,
        value: g.values.reduce((s, v) => s + v, 0) / g.values.length,
        date: moment(g.sortKey + '-01').valueOf(),
      }));
  }
  // day view: each record as a point
  const result = data
    .map(row => {
      const val = parseFloat(row[dataKey]);
      if (isNaN(val)) return null;
      return {
        label: moment(row._day).format('DD/MM'),
        value: val,
        date: row._date?.valueOf() || 0,
      };
    })
    .filter(Boolean);
  return result.sort((a, b) => a.date - b.date);
}

function dateKeyFromRow(row) {
  return row['วันที่ตรวจ'] ? 'วันที่ตรวจ' : 'วันที่ตรวจ';
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (idx - lower) * (sorted[upper] - sorted[lower]);
}

// Get available years from data
export function getAvailableYears(data) {
  const years = [...new Set(data.map(r => r._year).filter(Boolean))];
  return years.sort();
}

// Get available months
export function getAvailableMonths() {
  return [
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];
}