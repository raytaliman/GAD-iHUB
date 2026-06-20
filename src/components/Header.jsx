import { Calendar, LayoutGrid, Plus, CalendarRange } from 'lucide-react';
import { useState, useEffect } from 'react';

const PERIODS = ['This week', 'This month', 'This year'];

/**
 * Formats a Date object or date string into an ISO date string (YYYY-MM-DD) for HTML date inputs.
 * 
 * @private
 * @param {Date|string} d - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDateForInput(d) {
  if (!d) return '';
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Header component that provides page titles, descriptions, and global filter controls.
 * Includes period selection, custom date range picking, and dashboard customization toggles.
 */
export default function Header({
  period,
  onPeriodChange,
  subtitle,
  title,
  hideControls,
  showPeriodAndDatePicker,
  dateRange,
  onDateRangeChange,
  manageMode,
  onManageWidgetsClick,
}) {
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(
    dateRange?.from ? new Date(dateRange.from).getMonth() : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    dateRange?.from ? new Date(dateRange.from).getFullYear() : new Date().getFullYear()
  );

  useEffect(() => {
    if (dateRange?.from) {
      const d = new Date(dateRange.from);
      setSelectedMonth(d.getMonth());
      setSelectedYear(d.getFullYear());
    }
  }, [dateRange]);

  const heading = title ?? 'Customer Satisfaction Feedback Form';
  const subline = subtitle !== undefined ? subtitle : 'DOST Ilocos Region – Innovation Hub for GAD';

  const showFilter = !hideControls || showPeriodAndDatePicker;
  const periodOnly = showPeriodAndDatePicker && hideControls;

  const handleApplyMonthYear = () => {
    // Create UTC date boundaries to match backend expectations cleanly
    const fromDate = new Date(selectedYear, selectedMonth, 1);
    const toDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    // Format to yyyy-MM-dd string
    const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-01`;
    const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;

    if (onDateRangeChange) {
      onDateRangeChange({ from: fromStr, to: toStr });
      setShowDatePicker(false);
    }
  };

  const handleClearDateRange = () => {
    if (onDateRangeChange) {
      onDateRangeChange(null);
      setShowDatePicker(false);
    }
  };

  const getSelectedMonthYearLabel = () => {
    if (!dateRange || !dateRange.from) return 'Month & Year';
    return `${MONTHS[selectedMonth]} ${selectedYear}`;
  };

  const periodButton = (
    <div className="relative">
      <button
        onClick={() => setShowPeriodMenu(!showPeriodMenu)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:border-violet-300 hover:bg-violet-50/30 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7030a0]/20"
      >
        <Calendar size={18} className="text-[#7030a0]" />
        {period}
      </button>
      {showPeriodMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowPeriodMenu(false)} />
          <div className="absolute right-0 top-full mt-2 py-1.5 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 min-w-[180px] animate-scale-in">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  onPeriodChange(p);
                  setShowPeriodMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-violet-50/50 ${p === period ? 'text-[#7030a0] font-bold bg-violet-50/30' : 'text-slate-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // 2 years back, current year, 2 years forward

  const handleApplyMonthYearInline = (m, y) => {
    const fromDate = new Date(y, m, 1);
    const toDate = new Date(y, m + 1, 0);
    const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-01`;
    const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
    if (onDateRangeChange) {
      onDateRangeChange({ from: fromStr, to: toStr });
    }
  };

  const inlineDropdowns = onDateRangeChange && (
    <div className="flex items-center gap-2">
      <select
        value={selectedMonth}
        onChange={(e) => {
          const m = Number(e.target.value);
          setSelectedMonth(m);
          handleApplyMonthYearInline(m, selectedYear);
        }}
        className="text-sm font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 bg-white hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-[#7030a0]/20 transition-all cursor-pointer shadow-sm"
      >
        {MONTHS.map((m, idx) => (
          <option key={m} value={idx}>{m}</option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => {
          const y = Number(e.target.value);
          setSelectedYear(y);
          handleApplyMonthYearInline(selectedMonth, y);
        }}
        className="text-sm font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 bg-white hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-[#7030a0]/20 transition-all cursor-pointer shadow-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          {heading}
        </h1>
        {subline ? (
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 text-[#7030a0]/80">
            {subline}
          </p>
        ) : null}
      </div>

      {showFilter && (
        <div className="flex items-center gap-3 flex-wrap">
          {inlineDropdowns}
        </div>
      )}
    </header>
  );
}
