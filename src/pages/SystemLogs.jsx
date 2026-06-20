import { useState, useEffect } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { getLogs, clearLogs } from '../lib/systemLogs';

/**
 * Formats an ISO date string into a localized date and time string for log entries.
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
 */
function actionColor(action) {
  switch (action) {
    case 'edit':
      return 'bg-amber-50 text-amber-700 border border-amber-100/50';
    case 'delete':
      return 'bg-rose-50 text-rose-700 border border-rose-100/50';
    case 'add':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100/50';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100';
  }
}

/**
 * Page component that displays a history of administrative actions (audit trail).
 */
export default function SystemLogs() {
  const [logs, setLogs] = useState([]);

  const load = () => setLogs(getLogs());

  useEffect(() => {
    load();
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear all system logs? This cannot be undone.')) {
      clearLogs();
      load();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-black text-slate-800 text-lg tracking-tight">System Logs</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
              Administrative action audit trail & system logs
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold active:scale-95 shrink-0"
          >
            <Trash2 size={15} />
            Clear Logs
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <FileText className="text-slate-400" size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400">No system logs recorded yet.</p>
            <p className="mt-1 text-[11px] text-slate-400/80 max-w-sm mx-auto">
              Changes in User Management or Form Settings will be automatically logged and displayed here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 backdrop-blur-sm z-10">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 text-left font-semibold w-[160px]">Time</th>
                    <th className="py-3.5 px-4 text-left font-semibold w-[120px]">User</th>
                    <th className="py-3.5 px-4 text-left font-semibold w-[100px]">Action</th>
                    <th className="py-3.5 px-4 text-left font-semibold w-[140px]">Target</th>
                    <th className="py-3.5 px-4 text-left font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, index) => (
                    <tr
                      key={`${log.timestamp}-${index}`}
                      className="hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                      style={{
                        animationDelay: `${Math.min(index * 30, 300)}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[10px] font-bold">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 text-slate-800 text-xs font-bold">{log.actor ?? '–'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${actionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-semibold">{log.target || '–'}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs font-medium leading-relaxed">{log.details || '–'}</td>
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

