import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import FeedbackForm from './pages/FeedbackForm';
import { useAuth } from './hooks/useAuth';

const pathToView = {
  '/dashboard': 'overview',
  '/registrations': 'demographics',
  '/visitors': 'visitors',
  '/evaluations': 'facility',
  '/suggestions': 'suggestions',
  '/form-management': 'form-management',
  '/generate-report': 'generate-report',
  '/users': 'users',
  '/system-logs': 'system-logs'
};

const viewToPath = {
  'overview': '/dashboard',
  'demographics': '/registrations',
  'visitors': '/visitors',
  'facility': '/evaluations',
  'suggestions': '/suggestions',
  'form-management': '/form-management',
  'generate-report': '/generate-report',
  'users': '/users',
  'system-logs': '/system-logs'
};

export default function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [period, setPeriod] = useState('This month');
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-01`;
    const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
    return { from: fromStr, to: toStr };
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync state with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle path redirections based on auth status
  useEffect(() => {
    const validAdminPaths = Object.keys(pathToView);
    const publicPaths = ['/', '/feedback', '/registration'];

    if (isAuthenticated) {
      if (currentPath === '/login' || !([...validAdminPaths, ...publicPaths].includes(currentPath))) {
        const savedView = localStorage.getItem('csf-dashboard-active-view') || 'overview';
        const path = viewToPath[savedView] || '/dashboard';
        window.history.pushState({}, '', path);
        setCurrentPath(path);
      }
    } else {
      if (!['/login', ...publicPaths].includes(currentPath)) {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
      }
    }
  }, [isAuthenticated, currentPath]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setDateRange(null);
  };

  const handleLogin = (userData) => {
    login(userData);
    const savedView = localStorage.getItem('csf-dashboard-active-view') || 'overview';
    const path = viewToPath[savedView] || '/dashboard';
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleViewChange = (view) => {
    const path = viewToPath[view] || '/dashboard';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  if (currentPath === '/' || currentPath === '/feedback' || currentPath === '/registration') {
    return <FeedbackForm />;
  }

  if (!isAuthenticated || currentPath === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  const activeView = pathToView[currentPath] || 'overview';

  return (
    <Layout
      activeView={activeView}
      onViewChange={handleViewChange}
      period={period}
      onPeriodChange={handlePeriodChange}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      subtitle="DOST Ilocos Region – Innovation Hub for GAD"
      onLogout={logout}
    />
  );
}
