import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, User, Baby, Phone, Calendar, Building2, SlidersHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import { fetchAllRegistrations } from '../lib/data';

const formatOfficeUnit = (r) => {
  if (!r) return '–';
  const address = (r.office_unit_address || '').trim();
  const other = (r.office_unit_other || '').trim();
  
  if (!address && !other) return '–';
  if (address.toLowerCase() === 'others' || !address) return other || '–';
  if (!other || address.toLowerCase() === other.toLowerCase()) return address;
  return `${address} (${other})`;
};

const formatTime = (isoString) => {
  if (!isoString) return '–';
  try {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '–';
  }
};

const formatDuration = (startIso, endIso) => {
  if (!startIso || !endIso) return '–';
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diffMs = end - start;
    if (diffMs < 0) return '–';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  } catch (e) {
    return '–';
  }
};

export default function Visitors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  
  // Period filter: default to 'today'. Options: 'today' | 'custom' | 'month' | 'year' | 'all'
  const [period, setPeriod] = useState('today');
  // Specific Date Picker state
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAllRegistrations()
      .then((data) => {
        if (!cancelled) {
          setRows(data);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load visitors');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      // 1. Search Query Filter
      const q = search.toLowerCase().trim();
      if (q) {
        const matchName = (r.parent_name || '').toLowerCase().includes(q);
        const matchEmail = (r.email || '').toLowerCase().includes(q);
        const matchCode = (r.code || '').toLowerCase().includes(q);
        const matchPhone = (r.contact_number || '').toLowerCase().includes(q);
        const matchOffice = formatOfficeUnit(r).toLowerCase().includes(q);
        const matchService = (r.service_availed || '').toLowerCase().includes(q);
        const matchActivities = (r.activities || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCode && !matchPhone && !matchOffice && !matchService && !matchActivities) {
          return false;
        }
      }

      // 2. Period Filter (Today / Custom Date / This Month / This Year / All)
      if (!r.created_at) return false;
      const createdDate = new Date(r.created_at);
      const now = new Date();

      if (period === 'today') {
        const isToday = createdDate.getDate() === now.getDate() &&
                        createdDate.getMonth() === now.getMonth() &&
                        createdDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (period === 'custom') {
        if (!selectedDate) return true;
        const [sy, sm, sd] = selectedDate.split('-').map(Number);
        const matchesCustom = createdDate.getDate() === sd &&
                              createdDate.getMonth() === (sm - 1) &&
                              createdDate.getFullYear() === sy;
        if (!matchesCustom) return false;
      } else if (period === 'month') {
        const isThisMonth = createdDate.getMonth() === now.getMonth() &&
                            createdDate.getFullYear() === now.getFullYear();
        if (!isThisMonth) return false;
      } else if (period === 'year') {
        const isThisYear = createdDate.getFullYear() === now.getFullYear();
        if (!isThisYear) return false;
      }

      return true;
    });
  }, [rows, search, period, selectedDate]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageStart = (page - 1) * pageSize;
  const paginated = useMemo(() => filtered.slice(pageStart, pageStart + pageSize), [filtered, pageStart, pageSize]);

  const handlePageChange = (p) => {
    setPage(p);
  };

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, period, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Visitors Registry</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Track daily check-ins, time out, stay duration, and feedback survey statuses
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search visitors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-[#7030a0] focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <SlidersHorizontal size={14} className="text-[#7030a0]" />
              Period:
            </div>
            
            {/* Period selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'today', label: 'Today' },
                { id: 'custom', label: 'Select Date' },
                { id: 'month', label: 'This Month' },
                { id: 'year', label: 'This Year' },
                { id: 'all', label: 'All' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                    period === p.id
                      ? 'bg-white text-[#7030a0] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Date Input for Select Date option */}
            {period === 'custom' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all cursor-pointer animate-scale-in"
              />
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">Loading registry...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-6 text-center text-rose-800">
            <p className="font-bold text-sm uppercase tracking-wider mb-1">Failed to load visitors</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : (
          <>
            <div className="border border-slate-100 rounded-2xl overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">No.</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Visitor Code</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Parent / Guardian</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Children</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Time In</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Time Out</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Duration</th>
                      <th className="py-3 px-5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider text-center">Survey Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center bg-slate-50/10">
                          <User size={40} className="text-slate-300 mx-auto mb-3" />
                          <h3 className="font-bold text-slate-700 text-sm">No visitors found</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            {period === 'today' ? 'No visitors have checked in today yet.' : (period === 'custom' ? `No check-ins on ${selectedDate}` : 'Try adjusting your search query or filters.')}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5 text-xs text-slate-400 font-bold">
                            {pageStart + i + 1}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-[#7030a0] border border-violet-100">
                              {r.code || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="text-slate-800 font-extrabold text-xs">{r.parent_name || '–'}</p>
                            <p className="text-slate-400 text-[10px] font-bold mt-0.5 capitalize">{r.sex || '–'}</p>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex flex-col gap-1 max-w-[180px]">
                              {Array.isArray(r.children) && r.children.length > 0 ? (
                                r.children.map((c, idx) => (
                                  <div key={idx} className="text-xs font-semibold text-slate-700 truncate">
                                    • {c.name} <span className="text-slate-400 text-[10px] font-bold">({c.age != null && String(c.age).trim() !== '' ? `${c.age}y` : '–'}, {c.sex ? c.sex[0] : '–'})</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs italic">No children</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="text-slate-700 font-bold text-xs">{formatTime(r.created_at)}</p>
                            <p className="text-slate-400 text-[9px] font-semibold mt-0.5">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '–'}
                            </p>
                          </td>
                          <td className="py-3.5 px-5 text-slate-700 font-bold text-xs">{formatTime(r.time_out)}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold ${r.time_out ? 'bg-[#7030a0]/10 text-[#7030a0]' : 'bg-slate-100 text-slate-400'}`}>
                              {formatDuration(r.created_at, r.time_out)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {r.eval_id ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                <CheckCircle2 size={12} /> Answered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-400 border border-slate-200/40">
                                <XCircle size={12} /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-5">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-slate-400 text-xs font-semibold">
                  Showing {pageStart + 1}–{Math.min(pageStart + pageSize, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="text-xs font-bold text-[#7030a0] bg-violet-50/50 border border-violet-100 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-[#7030a0] transition-all cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">entries</span>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`min-w-[2rem] h-8 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                          page === p
                            ? 'bg-gradient-to-r from-violet-600 to-[#7030a0] text-white shadow-md shadow-violet-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-800 text-lg">Visitor Profile Details</h3>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <div className="flex items-center gap-2 text-sm text-slate-800 font-bold bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <User size={16} className="text-[#7030a0]" />
                    {selectedVisitor.parent_name || '–'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biological Sex</span>
                  <div className="text-sm text-slate-800 font-bold bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 capitalize">
                    {selectedVisitor.sex || '–'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Number</span>
                  <div className="flex items-center gap-2 text-sm text-slate-800 font-bold bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <Phone size={16} className="text-[#7030a0]" />
                    {selectedVisitor.country_code ? `${selectedVisitor.country_code} ` : ''}{selectedVisitor.contact_number || '–'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <div className="text-sm text-slate-800 font-bold bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    {selectedVisitor.email || '–'}
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Office / Unit</span>
                  <div className="flex items-center gap-2 text-sm text-slate-800 font-bold bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <Building2 size={16} className="text-[#7030a0]" />
                    {formatOfficeUnit(selectedVisitor)}
                  </div>
                </div>
              </div>

              {Array.isArray(selectedVisitor.children) && selectedVisitor.children.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Registered Children</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedVisitor.children.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-violet-50/50 border border-violet-100 rounded-xl p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-violet-100 rounded-lg text-[#7030a0]">
                            <Baby size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{c.name || '–'}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">{c.sex || '–'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-white border border-violet-100 text-[#7030a0] rounded-md text-[10px] font-black">
                          {c.age != null && String(c.age).trim() !== '' ? `${c.age} yrs` : '–'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
