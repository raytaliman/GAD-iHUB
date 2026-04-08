const STORAGE_KEY = 'csf-dashboard-system-logs';
const AUTH_KEY = 'csf-auth';
const MAX_LOGS = 500;

/**
 * Get the current logged-in user display name (email or username).
 * @returns {string}
 */
function getCurrentActor() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth && (auth.email || auth.username)) {
        return auth.username || auth.email || 'Unknown';
      }
    }
  } catch (_) {}
  return 'Unknown';
}

/**
 * Add a system log entry (edit, delete, or add).
 * The current user (who did the action) is attached automatically.
 * @param {{ action: 'edit'|'delete'|'add', target: string, details: string, actor?: string }} entry
 */
export function addLog(entry) {
  try {
    const logs = getLogs();
    const actor = entry.actor != null ? entry.actor : getCurrentActor();
    const newEntry = {
      ...entry,
      actor,
      timestamp: new Date().toISOString(),
    };
    const next = [newEntry, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_) {}
}

/**
 * Get all system logs (newest first).
 * @returns {Array<{ action: string, target: string, details: string, timestamp: string, actor?: string }>}
 */
export function getLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {}
  return [];
}

/**
 * Clear all system logs.
 */
export function clearLogs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}
