import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  UserCircle,
  AlertTriangle,
  ScrollText,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: Users, label: 'Respondents information', id: 'demographics' },
  { icon: Building2, label: 'Evaluations', id: 'facility' },
  { icon: MessageSquare, label: 'Suggestions', id: 'suggestions' },
  { icon: ClipboardList, label: 'Form Management', id: 'form-management' },
  { icon: FileText, label: 'Generate report', id: 'generate-report' },
];

/**
 * Modal dialog for confirming user logout.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onConfirm - Callback when logout is confirmed.
 */
function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm logout"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-100 flex-shrink-0">
            <AlertTriangle className="text-amber-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg mb-1">Confirm Logout</h3>
            <p className="text-slate-600 text-sm">
              Are you sure you want to sign out? You will need to sign in again to access the dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 font-medium text-sm hover:opacity-90"
            style={{ backgroundColor: '#7030a0' }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal dialog for accessing system-level settings and logs.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onNavigateToUsers - Callback to switch view to User Management.
 * @param {Function} props.onNavigateToSystemLogs - Callback to switch view to System Logs.
 */
function SettingsModal({ isOpen, onClose, onNavigateToUsers, onNavigateToSystemLogs }) {
  if (!isOpen) return null;

  const handleUsersClick = () => {
    onClose();
    if (onNavigateToUsers) onNavigateToUsers();
  };

  const handleSystemLogsClick = () => {
    onClose();
    if (onNavigateToSystemLogs) onNavigateToSystemLogs();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-semibold text-slate-800 text-lg">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToUsers) onNavigateToUsers();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-700 hover:bg-violet-50 transition-colors border border-slate-200 hover:border-violet-200 active:bg-violet-100"
          >
            <Users size={20} className="text-violet-600" />
            <div className="flex-1">
              <div className="font-medium text-slate-800">Users</div>
              <div className="text-sm text-slate-500">View all users and add new accounts</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToSystemLogs) onNavigateToSystemLogs();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-700 hover:bg-violet-50 transition-colors border border-slate-200 hover:border-violet-200 active:bg-violet-100"
          >
            <ScrollText size={20} className="text-violet-600" />
            <div className="flex-1">
              <div className="font-medium text-slate-800">System Logs</div>
              <div className="text-sm text-slate-500">View every edit and delete across the dashboard</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}


import logo from '../assets/logo.png';

/**
 * Sidebar component that handles primary navigation between application views.
 * 
 * @param {Object} props
 * @param {string} props.activeView - Currently active view ID.
 * @param {Function} props.onViewChange - Callback to change the active view.
 * @param {Function} props.onNavigateToUsers - Callback to navigate specifically to the Users page.
 * @param {Function} props.onNavigateToSystemLogs - Callback to navigate specifically to the System Logs page.
 * @param {Function} props.onLogout - Callback to initiate logout process.
 */
export default function Sidebar({ activeView, onViewChange, onNavigateToUsers, onNavigateToSystemLogs, onLogout }) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  /**
   * Finalizes the logout processes after user confirmation.
   * @private
   */
  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <aside
        className="w-60 h-screen flex-shrink-0 overflow-hidden rounded-r-2xl flex flex-col border-r border-slate-200/80"
        style={{ backgroundColor: '#EDE9FE', boxShadow: '4px 0 20px rgba(123,92,246,0.08)' }}
      >
        <div className="p-5 flex items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-left transition-colors ${activeView === id
                ? 'bg-primary text-white'
                : 'text-slate-700 hover:bg-violet-100/80'
                }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-0.5 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-left text-sm transition-all duration-200 ${settingsModalOpen
              ? 'bg-violet-200/80 text-violet-900 shadow-sm'
              : 'text-slate-700 hover:bg-violet-100/80 hover:text-violet-700 active:bg-violet-200/60 active:scale-[0.98]'
              }`}
          >
            <Settings size={18} />
            Settings
          </button>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-slate-700 hover:bg-violet-100/80 hover:text-violet-700 active:bg-violet-200/60 active:scale-[0.98] text-left text-sm transition-all duration-200"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onNavigateToUsers={onNavigateToUsers}
        onNavigateToSystemLogs={onNavigateToSystemLogs}
      />
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
