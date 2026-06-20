import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Calendar, Building2, MessageSquare } from 'lucide-react';
import { fetchFeedback } from '../lib/data';

/** Modal to show full suggestion comment. */
/**
 * Modal component that displays the full text of a user's suggestion along with 
 * submission metadata like date and office/unit.
 * 
 * @param {Object} props
 * @param {Object} props.suggestion - The formatted suggestion object to display.
 * @param {Function} props.onClose - Callback to close the modal.
 */
function ViewSuggestionModal({ suggestion, onClose }) {
  if (!suggestion) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View full suggestion"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-100 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-violet-100/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-100/50 flex items-center justify-center text-[#7030a0]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg tracking-tight">Suggestion Details</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Full feedback and information</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
          <div className="space-y-5">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-[#7030a0]" size={15} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted Date</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{suggestion.submittedFormatted || '–'}</p>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-[#7030a0]" size={15} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office / Unit</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{suggestion.officeDisplay || '–'}</p>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-[#7030a0]" size={15} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Registered</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{suggestion.dateOfUseFormatted || '–'}</p>
              </div>
            </div>

            {/* Suggestion Content */}
            <div className="bg-gradient-to-br from-violet-50/20 to-violet-100/10 rounded-2xl p-5 border border-violet-100/80">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="text-[#7030a0]" size={18} />
                <h4 className="font-bold text-slate-800 tracking-tight">Suggestion</h4>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <p className="text-slate-700 text-xs font-semibold whitespace-pre-wrap break-words leading-relaxed">
                  {suggestion.comments || '–'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

/**
 * Formats a date string into a readable short date format (e.g., "Jan 1, 2024").
 * 
 * @private
 * @param {string} d - ISO date string.
 * @returns {string} Formatted date.
 */
function formatDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Checks if a suggestion record matches a given search query across multiple fields.
 * 
 * @private
 * @param {Object} r - Suggestion row.
 * @param {string} q - Search query.
 * @returns {boolean} True if matched.
 */
function matchSuggestion(r, q) {
  if (!q || !q.trim()) return true;
  const s = q.trim().toLowerCase();
  const date = (r.submittedFormatted || '').toLowerCase();
  const office = (r.officeDisplay || '').toLowerCase();
  const dateUse = (r.dateOfUseFormatted || '').toLowerCase();
  const comment = (r.comments || '').toLowerCase();
  return date.includes(s) || office.includes(s) || dateUse.includes(s) || comment.includes(s);
}

/**
 * Page component that displays a searchable, paginated list of suggestions and comments.
 * Filtered from the main feedback list (only records with non-empty comments are shown).
 * 
 * @param {Object} props
 * @param {string} props.period - Time period filter.
 * @param {Object} props.dateRange - Custom date range filters.
 */
export default function Suggestions({ period, dateRange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingSuggestion, setViewingSuggestion] = useState(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  /**
   * Fetches data on mount or when period/dateRange filters change.
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFeedback(period ?? 'This month', dateRange)
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [period, dateRange]);

  /**
   * Real-time polling for new suggestions.
   */
  useEffect(() => {
    const id = setInterval(() => {
      fetchFeedback(period ?? 'This month', dateRange)
        .then((data) => setList(data))
        .catch(() => { });
    }, 10000);
    return () => clearInterval(id);
  }, [period, dateRange]);

  const withSuggestions = useMemo(
    () => (list || []).filter((r) => r.comments && String(r.comments).trim().length > 0),
    [list]
  );

  const rows = useMemo(
    () =>
      withSuggestions.map((r) => ({
        ...r,
        submittedFormatted: formatDate(r.created_at),
        dateOfUseFormatted: formatDate(r.date_of_use),
        officeDisplay:
          r.office_unit_other && String(r.office_unit_other).trim()
            ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
            : r.office_unit_address || '–',
      })),
    [withSuggestions]
  );

  const filtered = useMemo(
    () => (search.trim() ? rows.filter((r) => matchSuggestion(r, search)) : rows),
    [rows, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart]
  );

  useEffect(() => {
    setPage(1);
  }, [search, filtered.length]);

  const handlePageChange = (newPage) => {
    if (newPage === page) return;
    setIsPageTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setTimeout(() => setIsPageTransitioning(false), 50);
    }, 150);
  };

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
        <p className="font-semibold">Could not load suggestions</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <h2 className="font-black text-slate-800 text-lg tracking-tight">Suggestions for improvement</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Written suggestions collected from Part IV</p>
          </div>
          <div className="relative ml-auto flex-1 min-w-[300px] max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by date, office, or suggestion..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-[#7030a0] bg-slate-50/40 focus:bg-white transition-all duration-200"
            />
          </div>
          {search.trim() && (
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shrink-0">
              {filtered.length} of {rows.length} matches
            </span>
          )}
        </div>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400 font-semibold text-sm">Loading suggestions...</div>
        ) : !rows.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
            No suggestions in this period
          </div>
        ) : !filtered.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
            No matches found for &quot;{search.trim()}&quot;
          </div>
        ) : (
          <>
            <div
              key={page}
              className={`transition-opacity duration-300 ${isPageTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-semibold text-center w-[140px]">Date</th>
                      <th className="py-3.5 px-4 font-semibold text-left w-[220px]">Office / unit</th>
                      <th className="py-3.5 px-4 font-semibold text-center w-[140px]">Date Registered</th>
                      <th className="py-3.5 px-4 font-semibold text-left w-[280px]">Suggestion</th>
                      <th className="py-3.5 px-4 font-semibold text-center w-[120px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pageRows.map((r, index) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <td className="py-3.5 px-4 text-slate-500 font-medium text-xs whitespace-nowrap text-center w-[140px]">{r.submittedFormatted}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold text-xs w-[220px]">{r.officeDisplay}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium text-xs whitespace-nowrap text-center w-[140px]">{r.dateOfUseFormatted}</td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs w-[280px] leading-relaxed">
                          {r.comments && r.comments.length > 25 ? (
                            <span>{r.comments.slice(0, 25)}...</span>
                          ) : (
                            r.comments || '–'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center w-[120px]">
                          {r.comments && r.comments.length > 25 ? (
                            <button
                              type="button"
                              onClick={() => setViewingSuggestion(r)}
                              className="px-3 py-1.5 rounded-xl bg-violet-50 text-[#7030a0] text-[11px] font-bold hover:bg-violet-100/70 active:scale-95 transition-all duration-200"
                            >
                              View details
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">–</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-5">
                <p className="text-slate-400 text-xs font-semibold">
                  Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - page) <= 1) return true;
                        return false;
                      })
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '…' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-bold">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`min-w-[2rem] h-8 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${page === p
                                ? 'bg-gradient-to-r from-violet-600 to-[#7030a0] text-white shadow-md shadow-violet-200'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                              }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {viewingSuggestion && (
        <ViewSuggestionModal
          suggestion={viewingSuggestion}
          onClose={() => setViewingSuggestion(null)}
        />
      )}
    </div>
  );
}
