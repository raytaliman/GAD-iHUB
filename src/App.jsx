import { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import FeedbackForm from './pages/FeedbackForm';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [period, setPeriod] = useState('This month');
  const [dateRange, setDateRange] = useState(null);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setDateRange(null);
  };

  const currentPath = window.location.pathname;

  if (currentPath === '/' || currentPath === '/feedback') {
    return <FeedbackForm />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <Layout
      period={period}
      onPeriodChange={handlePeriodChange}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      subtitle="DOST Ilocos Region – Innovation Hub for GAD"
      onLogout={logout}
    />
  );
}
