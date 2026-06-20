import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../pages/Dashboard';
import RespondentsInfo from '../pages/RespondentsInfo';
import FacilityAndService from '../pages/FacilityAndService';
import Suggestions from '../pages/Suggestions';
import FormManagement from '../pages/FormManagement';
import GenerateReport from '../pages/GenerateReport';
import Users from '../pages/Users';
import SystemLogs from '../pages/SystemLogs';
import Visitors from '../pages/Visitors';

const STORAGE_KEY = 'csf-dashboard-widget-order';
const ACTIVE_VIEW_KEY = 'csf-dashboard-active-view';

/**
 * Loads the saved widget order from local storage or returns the default order.
 * 
 * @private
 * @returns {string[]} An array of widget IDs.
 */
function loadWidgetOrder() {
  const defaultOrder = ['kpis', 'chartTime', 'visitorsTime', 'byPart', 'topVisitors', 'latest'];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let order = parsed.filter((id) => id !== 'chartPart2' && id !== 'chartPart3' && id !== 'chartDonut');
        // Ensure topVisitors and latest are positioned correctly (topVisitors before latest)
        order = order.filter((id) => id !== 'topVisitors' && id !== 'latest');
        order.push('topVisitors', 'latest');
        return order;
      }
    }
  } catch (_) {}
  return defaultOrder;
}

/**
 * Loads the last active view from local storage or defaults to 'overview'.
 * 
 * @private
 * @returns {string} The active view ID.
 */
function loadActiveView() {
  try {
    const saved = localStorage.getItem(ACTIVE_VIEW_KEY);
    if (saved && typeof saved === 'string') {
      const validViews = ['overview', 'demographics', 'visitors', 'facility', 'suggestions', 'form-management', 'generate-report', 'users', 'system-logs'];
      if (validViews.includes(saved)) {
        return saved;
      }
    }
  } catch (_) {}
  return 'overview';
}

/**
 * Main Layout component that manages the primary application structure, navigation, and view state.
 * It coordinates the Sidebar, Header, and content area based on the selected view.
 * 
 * @param {Object} props
 * @param {string} props.period - The current time period filter.
 * @param {Function} props.onPeriodChange - Callback when the period changes.
 * @param {Object} props.dateRange - Current custom date range filter.
 * @param {Function} props.onDateRangeChange - Callback when the date range changes.
 * @param {string} props.subtitle - Descriptive subtitle for the header.
 * @param {Function} props.onLogout - Callback function to handle system logout.
 */
export default function Layout({ activeView, onViewChange, period, onPeriodChange, dateRange, onDateRangeChange, subtitle, onLogout }) {
  const [manageMode, setManageMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState(() => loadWidgetOrder());

  /**
   * Sets the active view and persists it to local storage.
   * @param {string} view - The view ID to switch to.
   */
  const setActiveView = (view) => {
    if (view === activeView) return;
    onViewChange(view);
    try {
      localStorage.setItem(ACTIVE_VIEW_KEY, view);
    } catch (_) {}
  };

  /**
   * Updates the widget sort order and persists it to local storage.
   * @param {string[]} next - The new ordered array of widget IDs.
   */
  const persistOrder = (next) => {
    const filtered = (next || []).filter((id) => id !== 'chartPart2' && id !== 'chartPart3');
    setWidgetOrder(filtered);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (_) {}
  };

  const pageContent =
    activeView === 'demographics' ? (
      <RespondentsInfo />
    ) : activeView === 'visitors' ? (
      <Visitors />
    ) : activeView === 'facility' ? (
      <FacilityAndService period={period} dateRange={dateRange} onViewChange={setActiveView} />
    ) : activeView === 'suggestions' ? (
      <Suggestions period={period} dateRange={dateRange} />
    ) : activeView === 'form-management' ? (
      <FormManagement />
    ) : activeView === 'generate-report' ? (
      <GenerateReport period={period} dateRange={dateRange} />
    ) : activeView === 'users' ? (
      <Users />
    ) : activeView === 'system-logs' ? (
      <SystemLogs />
    ) : (
      <Dashboard
        period={period}
        onPeriodChange={onPeriodChange}
        dateRange={dateRange}
        manageMode={manageMode}
        widgetOrder={widgetOrder}
        onWidgetOrderChange={persistOrder}
      />
    );

  const headerTitle =
    activeView === 'facility'
      ? 'Evaluations'
      : activeView === 'demographics'
        ? 'Registrations'
        : activeView === 'visitors'
          ? 'Visitors'
          : activeView === 'suggestions'
            ? 'Suggestions'
            : activeView === 'form-management'
              ? 'Form Management'
              : activeView === 'generate-report'
                ? 'Generate report'
                : activeView === 'users'
                  ? 'User Management'
                  : activeView === 'system-logs'
                    ? 'System Logs'
                    : undefined;
  const filterNeededViews = activeView === 'facility' || activeView === 'suggestions' || activeView === 'generate-report';
  const allControlsHiddenViews = activeView === 'demographics' || activeView === 'visitors' || activeView === 'users' || activeView === 'system-logs' || activeView === 'form-management';
  
  const headerSubtitle = filterNeededViews || allControlsHiddenViews ? '' : subtitle;
  const headerHideControls = filterNeededViews || allControlsHiddenViews;
  const headerShowPeriodAndDate = filterNeededViews;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onNavigateToUsers={() => setActiveView('users')} onNavigateToSystemLogs={() => setActiveView('system-logs')} onLogout={onLogout} />
      <main className="flex-1 min-w-0 bg-white flex flex-col min-h-0 overflow-auto">
        <div className="p-8 mx-auto w-full max-w-[1600px] flex flex-col gap-0 min-h-full">
          <Header
            period={period}
            onPeriodChange={onPeriodChange}
            subtitle={headerSubtitle}
            title={headerTitle}
            hideControls={headerHideControls}
            showPeriodAndDatePicker={headerShowPeriodAndDate}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            manageMode={manageMode}
            onManageWidgetsClick={() => setManageMode((m) => !m)}
          />
          <div key={activeView}>
            {pageContent}
          </div>
        </div>
      </main>
    </div>
  );
}
