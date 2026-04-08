import { Calendar, LayoutGrid, Plus, CalendarRange } from 'lucide-react';
import { useState, useEffect } from 'react';

const PERIODS = ['This week', 'This month', 'Last 3 months', 'This year'];

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

/**
 * Header component that provides page titles, descriptions, and global filter controls.
 * Includes period selection, custom date range picking, and dashboard customization toggles.
 * 
 * @param {Object} props
 * @param {string} props.period - The current active time period (e.g., 'This month').
 * @param {Function} props.onPeriodChange - Callback when a new period is selected.
 * @param {string} [props.subtitle] - Optional sub-headline text.
 * @param {string} [props.title] - Main page title; defaults to standard app title.
 * @param {boolean} [props.hideControls] - Whether to hide dashboard-specific controls.
 * @param {boolean} [props.showPeriodAndDatePicker] - Explicitly show filters even if other controls are hidden.
 * @param {Object} [props.dateRange] - Current custom date range {from, to}.
 * @param {Function} [props.onDateRangeChange] - Callback to update the custom date range.
 * @param {boolean} [props.manageMode] - Whether the dashboard is in "Manage Widgets" mode.
 * @param {Function} [props.onManageWidgetsClick] - Callback to toggle manage mode.
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
  const [fromInput, setFromInput] = useState(dateRange?.from ? formatDateForInput(dateRange.from) : '');
  const [toInput, setToInput] = useState(dateRange?.to ? formatDateForInput(dateRange.to) : '');

  useEffect(() => {
    setFromInput(dateRange?.from ? formatDateForInput(dateRange.from) : '');
    setToInput(dateRange?.to ? formatDateForInput(dateRange.to) : '');
  }, [dateRange]);

  const heading = title ?? 'Customer Satisfaction Feedback Form';
  const subline = subtitle !== undefined ? subtitle : 'DOST Ilocos Region – Innovation Hub for GAD';

  const showFilter = !hideControls || showPeriodAndDatePicker;
  const periodOnly = showPeriodAndDatePicker && hideControls;

  const handleApplyDateRange = () => {
    if (fromInput && toInput && onDateRangeChange) {
      onDateRangeChange({ from: fromInput, to: toInput });
      setShowDatePicker(false);
    }
  };

  const handleClearDateRange = () => {
    if (onDateRangeChange) {
      onDateRangeChange(null);
      setFromInput('');
      setToInput('');
      setShowDatePicker(false);
    }
  };

  const periodButton = (
    <div className="relative">
      <button
        onClick={() => setShowPeriodMenu(!showPeriodMenu)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-card"
      >
        <Calendar size={18} />
        {period}
      </button>
      {showPeriodMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowPeriodMenu(false)} />
          <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 min-w-[180px]">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  onPeriodChange(p);
                  setShowPeriodMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${p === period ? 'text-primary font-medium' : 'text-slate-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const datePickerButton = onDateRangeChange && (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-card"
      >
        <CalendarRange size={18} />
        Date range
      </button>
      {showDatePicker && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)} />
          <div className="absolute right-0 top-full mt-1 p-4 bg-white rounded-xl border border-slate-200 shadow-lg z-20 min-w-[240px]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApplyDateRange}
                  disabled={!fromInput || !toInput}
                  className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:pointer-events-none"
                >
                  Apply
                </button>
                {dateRange && (
                  <button
                    type="button"
                    onClick={handleClearDateRange}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ color: '#1e293b', fontSize: '1.5rem' }}>
          {heading}
        </h1>
        {subline ? (
          <p className="text-slate-500 text-sm mt-0.5" style={{ color: '#64748b', marginTop: 2 }}>
            {subline}
          </p>
        ) : null}
      </div>

      {showFilter && (
        <div className="flex items-center gap-3 flex-wrap">
          {periodButton}
          {datePickerButton}
          {!periodOnly && (
            <>
              <button
                type="button"
                onClick={() => onManageWidgetsClick?.()}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  manageMode ? 'border-primary bg-primary text-white hover:bg-primary-dark' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid size={18} />
                {manageMode ? 'Done' : 'Manage widgets'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shadow-card">
                <Plus size={18} />
                Add new widget
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
