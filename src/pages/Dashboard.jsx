import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KPICards from '../components/KPICards';
import ChartSubmissionsOverTime from '../components/ChartSubmissionsOverTime';
import ChartVisitorsOverTime from '../components/ChartVisitorsOverTime';
import ChartSexDistribution from '../components/ChartSexDistribution';
import LatestSubmissions from '../components/LatestSubmissions';
import SortableWidget from '../components/SortableWidget';
import TopVisitors from '../components/TopVisitors';
import {
  fetchFeedback,
  fetchAllRegistrations,
  computeKPIs,
  satisfactionOverTime,
  groupByTime,
  satisfactionDistribution,
  formatLatest,
  basicInfoBySex,
  basicInfoByChildSex,
} from '../lib/data';

const WIDGET_SPAN = {
  kpis: 4,
  chartTime: 2,
  visitorsTime: 2,
  byPart: 1,
  latest: 2,
  topVisitors: 1,
};

/**
 * The Dashboard page component that displays the main analytics overview.
 * Handles data fetching, KPI calculation, and manages the sortable widget grid.
 * 
 * @param {Object} props
 * @param {string} props.period - The current active time period for data filtering.
 * @param {Function} props.onPeriodChange - Callback to change the active period.
 * @param {Object} props.dateRange - Custom date range object {from, to} for filtering.
 * @param {boolean} [props.manageMode=false] - Whether the dashboard is in widget customization mode.
 * @param {string[]} [props.widgetOrder=[]] - Current ordered array of widget IDs.
 * @param {Function} props.onWidgetOrderChange - Callback when the widget order is updated via drag-and-drop.
 */
export default function Dashboard({ period, onPeriodChange, dateRange, manageMode = false, widgetOrder = [], onWidgetOrderChange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [regs, setRegs] = useState([]);

  const filterRegsByPeriod = (records, p, range) => {
    if (range && range.from && range.to) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(range.to);
      to.setHours(23, 59, 59, 999);
      return records.filter((r) => {
        const d = new Date(r.created_at);
        return d >= from && d <= to;
      });
    }
    if (p === 'All') return records;
    
    const now = new Date();
    let from = new Date(now);
    if (p === 'This week') {
      from.setDate(now.getDate() - 7);
    } else if (p === 'This month') {
      from.setMonth(now.getMonth() - 1);
    } else if (p === 'Last 3 months') {
      from.setMonth(now.getMonth() - 3);
    } else if (p === 'This year') {
      from.setFullYear(now.getFullYear() - 1);
    } else {
      from.setMonth(now.getMonth() - 1);
    }
    return records.filter((r) => new Date(r.created_at) >= from);
  };

  /**
   * Fetches feedback data on mount or when filters change.
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchFeedback('All', null),
      fetchAllRegistrations()
    ])
      .then(([feedbackData, regsData]) => {
        if (!cancelled) {
          setList(feedbackData);
          setRegs(regsData);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load feedback');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  /**
   * Polls for new feedback data every 10 seconds.
   */
  useEffect(() => {
    const id = setInterval(() => {
      Promise.all([
        fetchFeedback('All', null),
        fetchAllRegistrations()
      ])
        .then(([feedbackData, regsData]) => {
          setList(feedbackData);
          setRegs(regsData);
        })
        .catch(() => { });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-6 text-rose-800 shadow-sm animate-scale-in">
        <p className="font-bold text-sm uppercase tracking-wider mb-1.5">Could not load dashboard data</p>
        <p className="text-xs text-rose-700 leading-relaxed mb-3">{error}</p>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          Please check that your supabase or local server endpoints are configured properly in the .env file.
        </p>
      </div>
    );
  }

  const getPeriodBoundaries = (p, range) => {
    let start, end;
    if (range && range.from && range.to) {
      start = new Date(range.from);
      end = new Date(range.to);
    } else {
      const now = new Date();
      end = new Date(now);
      start = new Date(now);
      if (p === 'This week') {
        start.setDate(now.getDate() - 7);
      } else if (p === 'This month') {
        start.setMonth(now.getMonth() - 1);
      } else if (p === 'Last 3 months') {
        start.setMonth(now.getMonth() - 3);
      } else if (p === 'This year') {
        start.setFullYear(now.getFullYear() - 1);
      } else {
        start.setMonth(now.getMonth() - 1);
      }
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getPrevPeriodBoundaries = (start, end) => {
    const durationMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    return { start: prevStart, end: prevEnd };
  };

  const { start: currentStart, end: currentEnd } = getPeriodBoundaries(period, dateRange);
  const { start: prevStart, end: prevEnd } = getPrevPeriodBoundaries(currentStart, currentEnd);

  const currentList = list.filter(r => {
    const d = new Date(r.created_at);
    return d >= currentStart && d <= currentEnd;
  });
  const prevList = list.filter(r => {
    const d = new Date(r.created_at);
    return d >= prevStart && d <= prevEnd;
  });

  const computePeriodKPIs = (current, prev) => {
    const scoreMap = (item) => {
      const MAP = { 'Very Satisfied': 5, Satisfied: 4, Neutral: 3, Dissatisfied: 2, 'Very Dissatisfied': 1 };
      return MAP[item.overall_satisfaction];
    };

    const getMetrics = (items) => {
      const total = items.length;
      const scores = items.map(scoreMap).filter(s => s != null);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const pos = items.filter(r => r.overall_satisfaction === 'Very Satisfied' || r.overall_satisfaction === 'Satisfied').length;
      const posRate = total ? pos / total : null;
      const sug = items.filter(r => r.comments && String(r.comments).trim().length > 0).length;
      return { total, avg, posRate, sug };
    };

    const curMetrics = getMetrics(current);
    const prevMetrics = getMetrics(prev);

    const pctChange = (c, p) => {
      if (p == null || c == null || p === 0) return null;
      return ((c - p) / p) * 100;
    };

    return {
      total: curMetrics.total,
      avgSatisfaction: curMetrics.avg,
      positiveRate: curMetrics.posRate,
      withSuggestions: curMetrics.sug,
      
      totalTrend: pctChange(curMetrics.total, prevMetrics.total),
      satisfactionTrend: curMetrics.avg != null && prevMetrics.avg != null ? pctChange((curMetrics.avg / 5) * 100, (prevMetrics.avg / 5) * 100) : null,
      positiveTrend: curMetrics.posRate != null && prevMetrics.posRate != null ? pctChange(curMetrics.posRate * 100, prevMetrics.posRate * 100) : null,
      suggestionsTrend: pctChange(curMetrics.sug, prevMetrics.sug),
    };
  };

  const getCompletedDates = (records, p, range) => {
    let start, end;
    if (range && range.from && range.to) {
      start = new Date(range.from);
      end = new Date(range.to);
    } else {
      const now = new Date();
      end = new Date(now);
      start = new Date(now);
      if (p === 'This week') {
        start.setDate(now.getDate() - 7);
      } else if (p === 'This month') {
        start.setMonth(now.getMonth() - 1);
      } else if (p === 'Last 3 months') {
        start.setMonth(now.getMonth() - 3);
      } else if (p === 'This year') {
        start.setFullYear(now.getFullYear() - 1);
      } else {
        start.setMonth(now.getMonth() - 1);
      }
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    const countsByDate = {};
    records.forEach((r) => {
      const d = new Date(r.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      countsByDate[key] = (countsByDate[key] || 0) + 1;
    });

    const result = [];
    let current = new Date(start);
    let iter = 0;
    while (current <= end && iter < 400) {
      iter++;
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const key = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        result.push({
          label: current.toLocaleDateString('en-US', { day: 'numeric' }),
          count: countsByDate[key] || 0
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  const getCompletedSatisfaction = (records, p, range) => {
    let start, end;
    if (range && range.from && range.to) {
      start = new Date(range.from);
      end = new Date(range.to);
    } else {
      const now = new Date();
      end = new Date(now);
      start = new Date(now);
      if (p === 'This week') {
        start.setDate(now.getDate() - 7);
      } else if (p === 'This month') {
        start.setMonth(now.getMonth() - 1);
      } else if (p === 'Last 3 months') {
        start.setMonth(now.getMonth() - 3);
      } else if (p === 'This year') {
        start.setFullYear(now.getFullYear() - 1);
      } else {
        start.setMonth(now.getMonth() - 1);
      }
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    const SATISFACTION_SCORE_MAP = {
      'Very Satisfied': 5,
      Satisfied: 4,
      Neutral: 3,
      Dissatisfied: 2,
      'Very Dissatisfied': 1,
    };

    const scoresByDate = {};
    records.forEach((r) => {
      const score = SATISFACTION_SCORE_MAP[r.overall_satisfaction];
      if (score == null) return;
      const d = new Date(r.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!scoresByDate[key]) scoresByDate[key] = { sum: 0, n: 0 };
      scoresByDate[key].sum += score;
      scoresByDate[key].n += 1;
    });

    const result = [];
    let current = new Date(start);
    let iter = 0;
    while (current <= end && iter < 400) {
      iter++;
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const key = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const val = scoresByDate[key] ? scoresByDate[key].sum / scoresByDate[key].n : 0;
        result.push({
          label: current.toLocaleDateString('en-US', { day: 'numeric' }),
          value: val
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  const getTrendLabel = (p, range) => {
    if (range && range.from) {
      return 'vs previous month';
    }
    if (p === 'This week') return 'vs previous week';
    if (p === 'This month') return 'vs previous month';
    if (p === 'Last 3 months') return 'vs last 3 months';
    if (p === 'This year') return 'vs previous year';
    return 'vs previous period';
  };

  const filteredRegs = filterRegsByPeriod(regs, period, dateRange);
  const kpis = computePeriodKPIs(currentList, prevList);
  const visitorTimeData = getCompletedDates(filteredRegs, period, dateRange);
  const timeData = getCompletedSatisfaction(currentList, period, dateRange);
  const satisfactionDist = satisfactionDistribution(currentList);
  const latest = (formatLatest(currentList) || []).slice(0, 4);
  const parentSex = basicInfoBySex(currentList);
  const childSex = basicInfoByChildSex(currentList);
  const sexDistribution = [
    { name: 'Parent (M)', value: parentSex.find(x => x.name === 'Male')?.value || 0 },
    { name: 'Parent (F)', value: parentSex.find(x => x.name === 'Female')?.value || 0 },
    { name: 'Child (M)', value: childSex.find(x => x.name === 'Male')?.value || 0 },
    { name: 'Child (F)', value: childSex.find(x => x.name === 'Female')?.value || 0 },
  ];
  const trendLabelVal = getTrendLabel(period, dateRange);

  /**
   * Handles the end of a drag-and-drop interaction to reorder widgets.
   * @param {Object} event - The dnd-kit drag end event.
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const order = [...(widgetOrder.length ? widgetOrder : Object.keys(WIDGET_SPAN))];
    const from = order.indexOf(active.id);
    const to = order.indexOf(over.id);
    if (from === -1 || to === -1) return;
    const [removed] = order.splice(from, 1);
    order.splice(to, 0, removed);
    onWidgetOrderChange?.(order);
  };

  const allOrder = widgetOrder.length ? widgetOrder : Object.keys(WIDGET_SPAN);
  const order = allOrder.filter((id) => id !== 'chartPart2' && id !== 'chartPart3');

  const widgetContent = {
    kpis: <KPICards data={loading ? null : kpis} trendLabel={trendLabelVal} />,
    chartTime: <ChartSubmissionsOverTime data={timeData} period={period} />,
    visitorsTime: <ChartVisitorsOverTime data={visitorTimeData} />,
    byPart: <ChartSexDistribution data={sexDistribution} />,
    latest: <LatestSubmissions rows={latest} />,
    topVisitors: <TopVisitors registrations={filteredRegs} />,
  };

  const grid = (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-6 gap-y-4">
      {order.map((id) => (
        <SortableWidget
          key={id}
          id={id}
          span={WIDGET_SPAN[id] ?? 1}
          manageMode={manageMode}
        >
          {widgetContent[id] ?? null}
        </SortableWidget>
      ))}
    </div>
  );

  if (manageMode) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <p className="text-slate-500 text-sm mb-4">Drag the handle on each widget to reorder. Click &quot;Done&quot; when finished.</p>
          {grid}
        </SortableContext>
      </DndContext>
    );
  }

  return grid;
}
