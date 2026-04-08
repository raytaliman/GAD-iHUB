import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, X, User, Baby, Phone, Calendar, Building2, Eye } from 'lucide-react';
import { fetchFeedback, formatRespondents } from '../lib/data';

const PAGE_SIZE = 10;

/**
 * Modal component that displays detailed information about a specific respondent, 
 * including their contact details, office, and all registered children.
 * 
 * @param {Object} props
 * @param {Object} props.respondent - The formatted respondent object to display.
 * @param {Function} props.onClose - Callback to close the modal.
 */
function RespondentDetailsModal({ respondent, onClose }) {
  if (!respondent) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-200 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <User className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Respondent Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive registration information</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
          <div className="space-y-6">
            {/* Parent Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-primary" size={16} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Parent / Guardian</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{respondent.parent_name || '–'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="text-primary" size={16} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact Details</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {respondent.country_code ? `${respondent.country_code} ` : ''}{respondent.contact_number || '–'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-primary" size={16} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Office / Address</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {respondent.office_unit_other && String(respondent.office_unit_other).trim()
                    ? `${respondent.office_unit_address || 'Others'} (${respondent.office_unit_other})`
                    : respondent.office_unit_address || '–'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-primary" size={16} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date of Use</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{respondent.dateOfUseFormatted}</p>
              </div>
            </div>

            {/* Children Section */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Baby className="text-primary" size={20} />
                <h4 className="font-semibold text-slate-800">Registered Children</h4>
              </div>

              <div className="space-y-3">
                {Array.isArray(respondent.children) && respondent.children.length > 0 ? (
                  respondent.children.map((child, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{child.name || 'Untitled Child'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{child.sex}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Age</p>
                        <p className="text-sm font-bold text-slate-800">{child.age} yrs</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
                    <p className="text-slate-400 text-sm italic">No child information recorded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-2">
              <p>Submitted: {respondent.submittedFormatted}</p>
              <p>Code: {respondent.code || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Searches across all searchable fields of a respondent record for a given query string.
 * Includes nested search into the children array.
 * 
 * @private
 * @param {Object} r - The respondent row to check.
 * @param {string} q - The search query.
 * @returns {boolean} True if a match is found.
 */
function matchRow(r, q) {
  if (!q || !q.trim()) return true;
  const s = q.trim().toLowerCase();
  const parent = (r.parent_name || '').toLowerCase();
  const contact = [r.country_code, r.contact_number].filter(Boolean).join(' ').toLowerCase();
  const office = [r.office_unit_address, r.office_unit_other].filter(Boolean).join(' ').toLowerCase();
  const dateUse = (r.dateOfUseFormatted || '').toLowerCase();
  const submitted = (r.submittedFormatted || '').toLowerCase();
  const code = (r.code || '').toLowerCase();

  // Also search through children
  const childrenMatch = Array.isArray(r.children) && r.children.some(c =>
    (c.name || '').toLowerCase().includes(s) ||
    (c.age || '').toString().toLowerCase().includes(s) ||
    (c.sex || '').toLowerCase().includes(s)
  );

  return (
    parent.includes(s) ||
    contact.includes(s) ||
    office.includes(s) ||
    dateUse.includes(s) ||
    submitted.includes(s) ||
    code.includes(s) ||
    childrenMatch
  );
}

/**
 * Page component that displays a searchable, paginated list of all respondents (Part I of the form).
 * 
 * @param {Object} props
 * @param {string} props.period - The time period for data fetching.
 * @param {Object} props.dateRange - Custom date range filters.
 */
export default function RespondentsInfo({ period, dateRange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [selectedRespondent, setSelectedRespondent] = useState(null);

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
   * Real-time polling for new respondents every 10 seconds.
   */
  useEffect(() => {
    const id = setInterval(() => {
      fetchFeedback(period ?? 'This month', dateRange)
        .then((data) => setList(data))
        .catch(() => { });
    }, 10000);
    return () => clearInterval(id);
  }, [period, dateRange]);

  const rows = useMemo(() => formatRespondents(list), [list]);
  const filtered = useMemo(
    () => (search.trim() ? rows.filter((r) => matchRow(r, search)) : rows),
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
        <p className="font-semibold">Could not load respondents</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="font-semibold text-slate-800">Respondents (Basic Information)</h3>
          <div className="relative ml-auto flex-1 min-w-[300px] max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by parent, date, child details, or office"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {search.trim() && (
            <span className="text-slate-500 text-sm">
              {filtered.length} of {rows.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400">Loading…</div>
        ) : !rows.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No respondents in this period
          </div>
        ) : !filtered.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No matches for &quot;{search.trim()}&quot;
          </div>
        ) : (
          <>
            <div
              key={page}
              className={`transition-opacity duration-300 ${isPageTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-slate-50/80 text-slate-600 border-b-2 border-slate-200">
                      <th className="py-3.5 px-4 font-semibold">Parent / guardian</th>
                      <th className="py-3.5 px-4 font-semibold">Office / Address</th>
                      <th className="py-3.5 px-4 font-semibold">Contact Details</th>
                      <th className="py-3.5 px-4 font-semibold text-center whitespace-nowrap">Date of use</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r, index) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-slate-800">{r.parent_name || '–'}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">{r.sex || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {r.office_unit_other && String(r.office_unit_other).trim()
                            ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
                            : r.office_unit_address || '–'}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-slate-600 font-medium">
                            {r.country_code ? `${r.country_code} ` : ''}{r.contact_number || '–'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 whitespace-nowrap">{r.dateOfUseFormatted}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedRespondent(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 hover:shadow-sm transition-all duration-200 group"
                          >
                            <Eye size={14} className="group-hover:scale-110 transition-transform" />
                            View more
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
                <p className="text-slate-500 text-sm">
                  Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={18} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center gap-0.5 mx-1">
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
                          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-sm">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${page === p
                              ? 'bg-primary text-white shadow-sm'
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {selectedRespondent && (
        <RespondentDetailsModal
          respondent={selectedRespondent}
          onClose={() => setSelectedRespondent(null)}
        />
      )}
    </div>
  );
}

