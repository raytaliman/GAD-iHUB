import { useState, useEffect } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { getLogs, clearLogs } from '../lib/systemLogs';

/**
 * Formats an ISO date string into a localized date and time string for log entries.
 * 
 * @private
 * @param {string} iso - ISO date string.
 * @returns {string} Formatted date and time.
 */
function formatTime(iso) {
  if (!iso) return '–';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Returns a CSS class mapping for log action types to provide visual cues (color-coding).
 * 
 * @private
 * @param {string} action - The action type ('edit', 'delete', 'add').
 * @returns {string} Tailwind CSS class string.
 */
function actionColor(action) {
  switch (action) {
    case 'edit':
      return 'bg-amber-100 text-amber-800';
    case 'delete':
      return 'bg-red-100 text-red-800';
    case 'add':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

/**
 * Page component that displays a history of administrative actions (audit trail).
 * Logs include the time, actor (user), action type, target component, and specific details.
 */
export default function SystemLogs() {
  const [logs, setLogs] = useState([]);

  /**
   * Loads logs from local storage or memory via the systemLogs library.
   */
  const load = () => setLogs(getLogs());

  useEffect(() => {
    load();
  }, []);

  /**
   * Prompts the user and clears all history if confirmed.
   */
  const handleClear = () => {
    if (window.confirm('Clear all system logs? This cannot be undone.')) {
      clearLogs();
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">System Logs</h2>
            <p className="text-slate-500 text-sm mt-1">
              Every edit and delete across User Management and Form Management is recorded here.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Clear logs
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <FileText className="mx-auto mb-2 text-slate-300" size={32} />
            <p>No system logs yet.</p>
            <p className="mt-1">Edits and deletes in User Management and Form Management will appear here.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-3 px-3 text-left font-semibold text-slate-600 w-[140px]">Time</th>
                    <th className="py-3 px-3 text-left font-semibold text-slate-600 w-[120px]">User</th>
                    <th className="py-3 px-3 text-left font-semibold text-slate-600 w-[100px]">Action</th>
                    <th className="py-3 px-3 text-left font-semibold text-slate-600 w-[120px]">Target</th>
                    <th className="py-3 px-3 text-left font-semibold text-slate-600">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr
                      key={`${log.timestamp}-${index}`}
                      className="border-b border-slate-100 hover:bg-slate-50/50 animate-fade-in-up"
                      style={{
                        animationDelay: `${Math.min(index * 30, 300)}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{log.actor ?? '–'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium capitalize ${actionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{log.target || '–'}</td>
                      <td className="py-2.5 px-3 text-slate-700">{log.details || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
