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
  UserCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'overview' },
  { icon: Users, label: 'Registrations', id: 'demographics' },
  { icon: UserCheck, label: 'Visitors', id: 'visitors' },
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
        className="w-64 h-screen flex-shrink-0 overflow-hidden flex flex-col border-r border-violet-800/10 relative z-40 shadow-[4px_0_24px_rgba(112,48,160,0.15)]"
        style={{ backgroundColor: '#7030a0' }}
      >

        <div className="p-7 flex justify-center relative">
          <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-3xl shadow-[0_8px_32px_rgba(255,255,255,0.06)] border border-white/20 flex items-center justify-center hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 group cursor-pointer">
            <img src={logo} alt="Logo" className="h-12 w-auto group-hover:rotate-1 transition-transform duration-300" />
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, id }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_20px_rgba(168,85,247,0.2)] border border-white/10 font-bold'
                    : 'text-violet-200/80 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
                )}
                
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-[#c084fc]' : 'text-violet-300 group-hover:text-white'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className="text-xs font-bold tracking-wide">{label}</span>
                
                {/* Interactive background highlight */}
                {!isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-white/5 bg-black/10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-xs font-bold tracking-wide transition-all duration-300 relative group border ${
              settingsModalOpen
                ? 'bg-white/10 text-white border-white/10 shadow-inner'
                : 'text-violet-200/80 border-transparent hover:bg-white/5 hover:text-white active:scale-[0.98]'
            }`}
          >
            <Settings 
              size={16} 
              className={`transition-transform duration-500 group-hover:rotate-45 ${
                settingsModalOpen ? 'text-[#c084fc]' : 'text-violet-300 group-hover:text-white'
              }`} 
            />
            <span>Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-violet-200/80 hover:bg-red-500/10 hover:text-red-200 border border-transparent hover:border-red-500/20 active:scale-[0.98] text-left text-xs font-bold tracking-wide transition-all duration-300 group"
          >
            <LogOut size={16} className="text-violet-300 group-hover:text-red-400 transition-colors" />
            <span>Log out</span>
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
