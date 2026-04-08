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
import ChartTopOffices from '../components/ChartTopOffices';
import LatestSubmissions from '../components/LatestSubmissions';
import ChartSexDistribution from '../components/ChartSexDistribution';
import SortableWidget from '../components/SortableWidget';
import {
  fetchFeedback,
  computeKPIs,
  satisfactionOverTime,
  satisfactionDistribution,
  formatLatest,
  basicInfoBySex,
  basicInfoByChildSex,
  basicInfoByOffice,
} from '../lib/data';

const WIDGET_SPAN = {
  kpis: 3,
  chartTime: 2,
  chartDonut: 1,
  latest: 2,
  byPart: 1,
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

  /**
   * Fetches feedback data on mount or when filters change.
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFeedback(period, dateRange)
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load feedback');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [period, dateRange]);

  /**
   * Polls for new feedback data every 10 seconds.
   */
  useEffect(() => {
    const id = setInterval(() => {
      fetchFeedback(period, dateRange)
        .then((data) => setList(data))
        .catch(() => { });
    }, 10000);
    return () => clearInterval(id);
  }, [period, dateRange]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (error) {
    return (
      <div
        className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700"
        style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: 24,
          borderRadius: 16,
        }}
      >
        <p style={{ fontWeight: 600 }}>Could not load data</p>
        <p style={{ marginTop: 4 }}>{error}</p>
        <p style={{ marginTop: 8 }}>
          Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env and the table exists.
        </p>
      </div>
    );
  }

  // Derived data for display
  const kpis = computeKPIs(list);
  const timeData = satisfactionOverTime(list, period);
  const satisfactionDist = satisfactionDistribution(list);
  const latest = (formatLatest(list) || []).slice(0, 4);
  const parentSex = basicInfoBySex(list);
  const childSex = basicInfoByChildSex(list);
  const sexDistribution = [
    { name: 'Parent (M)', value: parentSex.find(x => x.name === 'Male')?.value || 0 },
    { name: 'Parent (F)', value: parentSex.find(x => x.name === 'Female')?.value || 0 },
    { name: 'Child (M)', value: childSex.find(x => x.name === 'Male')?.value || 0 },
    { name: 'Child (F)', value: childSex.find(x => x.name === 'Female')?.value || 0 },
  ];
  const unitDistribution = basicInfoByOffice(list);

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
    kpis: <KPICards data={loading ? null : kpis} />,
    chartTime: <ChartSubmissionsOverTime data={timeData} period={period} />,
    chartDonut: <ChartTopOffices data={unitDistribution} />,
    latest: <LatestSubmissions rows={latest} />,
    byPart: <ChartSexDistribution data={sexDistribution} />,
  };

  const grid = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
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
