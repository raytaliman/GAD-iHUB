import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, FileDown, CalendarRange } from 'lucide-react';
import {
  fetchFeedback,
  formatRespondents,
  part2Averages,
  part3Averages,
} from '../lib/data';

const PAGE_SIZE = 10;

const PART2_LABELS = {
  cleanliness_safety: 'Cleanliness & safety',
  child_comfort: "Child's comfort",
  toys_materials: 'Toys & materials',
  staff_attentiveness: 'Staff attentiveness',
  accessibility_convenience: 'Accessibility',
  maintenance_upkeep: 'Maintenance',
  staff_responsiveness: 'Staff responsiveness',
};

const PART3_LABELS = {
  staff_eval_attentiveness: 'Attentiveness',
  staff_eval_friendliness: 'Friendliness',
  staff_eval_responsiveness: 'Responsiveness',
};

const SATISFACTION_SCORE = { 'Very Satisfied': 5, Satisfied: 4, Neutral: 3, Dissatisfied: 2, 'Very Dissatisfied': 1 };

/**
 * Formats a date string into a readable format (e.g., "Jan 1, 2024").
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
 * Formats a date string into DD/MM/YY format for PDF reports.
 * 
 * @private
 * @param {string} d - ISO date string.
 * @returns {string} Formatted date (DD/MM/YY).
 */
function formatDDMMYY(d) {
  if (!d) return '–';
  const x = new Date(d);
  const day = String(x.getDate()).padStart(2, '0');
  const month = String(x.getMonth() + 1).padStart(2, '0');
  const year = String(x.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Page component that allows administrators to preview and export feedback data.
 * Supports generating printable HTML/PDF reports with customizable sections (averages, respondents, suggestions)
 * and specific date ranges.
 * 
 * @param {Object} props
 * @param {string} props.period - The default time period filter.
 * @param {Object} props.dateRange - Custom date range filters from the dashboard.
 */
export default function GenerateReport({ period, dateRange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [respondentsPage, setRespondentsPage] = useState(1);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [printSections, setPrintSections] = useState({
    questionAverages: true,
    respondents: true,
    suggestions: true,
  });
  const [pdfDateFrom, setPdfDateFrom] = useState('');
  const [pdfDateTo, setPdfDateTo] = useState('');

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
   * Real-time polling for new data.
   */
  useEffect(() => {
    const id = setInterval(() => {
      fetchFeedback(period ?? 'This month', dateRange)
        .then((data) => setList(data))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, [period, dateRange]);

  const questionRows = useMemo(() => {
    const p2 = part2Averages(list);
    const p3 = part3Averages(list);
    const part4Scores = (list || [])
      .map((r) => SATISFACTION_SCORE[r.overall_satisfaction])
      .filter((s) => s != null);
    const part4Avg = part4Scores.length ? part4Scores.reduce((a, b) => a + b, 0) / part4Scores.length : null;
    const rows = [];
    Object.entries(PART2_LABELS).forEach(([key, label]) => {
      rows.push({ part: 'Part II – Facility & Service', question: label, avg: p2[key] != null ? Number(p2[key].toFixed(2)) : '–' });
    });
    Object.entries(PART3_LABELS).forEach(([key, label]) => {
      rows.push({ part: 'Part III – Staff Evaluation', question: label, avg: p3[key] != null ? Number(p3[key].toFixed(2)) : '–' });
    });
    rows.push({
      part: 'Part IV – Overall Satisfaction',
      question: 'Overall satisfaction',
      avg: part4Avg != null ? Number(part4Avg.toFixed(2)) : '–',
    });
    return rows;
  }, [list]);

  const respondentsRows = useMemo(() => formatRespondents(list), [list]);
  const suggestionsRows = useMemo(
    () =>
      (list || [])
        .filter((r) => r.comments && String(r.comments).trim().length > 0)
        .map((r) => ({
          ...r,
          submittedFormatted: formatDate(r.created_at),
          dateOfUseFormatted: formatDate(r.date_of_use),
          officeDisplay:
            r.office_unit_other && String(r.office_unit_other).trim()
              ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
              : r.office_unit_address || '–',
        })),
    [list]
  );

  const respTotalPages = Math.max(1, Math.ceil(respondentsRows.length / PAGE_SIZE));
  const respPageStart = (respondentsPage - 1) * PAGE_SIZE;
  const respPageRows = useMemo(
    () => respondentsRows.slice(respPageStart, respPageStart + PAGE_SIZE),
    [respondentsRows, respPageStart]
  );

  const sugTotalPages = Math.max(1, Math.ceil(suggestionsRows.length / PAGE_SIZE));
  const sugPageStart = (suggestionsPage - 1) * PAGE_SIZE;
  const sugPageRows = useMemo(
    () => suggestionsRows.slice(sugPageStart, sugPageStart + PAGE_SIZE),
    [suggestionsRows, sugPageStart]
  );

  useEffect(() => {
    setRespondentsPage(1);
  }, [respondentsRows.length]);
  useEffect(() => {
    setSuggestionsPage(1);
  }, [suggestionsRows.length]);

  const filterLabel =
    dateRange?.from && dateRange?.to
      ? `Date range: ${formatDate(dateRange.from)} – ${formatDate(dateRange.to)}`
      : `Period: ${period ?? 'This month'}`;
  const generatedAt = formatDate(new Date());

  const escapeHtml = (s) => {
    if (s == null || s === '') return '';
    const t = String(s);
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const handlePrint = () => {
    const { questionAverages, respondents, suggestions } = printSections;

    const pdfList =
      pdfDateFrom && pdfDateTo
        ? (list || []).filter((r) => {
            const d = new Date(r.created_at);
            const from = new Date(pdfDateFrom);
            const to = new Date(pdfDateTo);
            to.setHours(23, 59, 59, 999);
            return d >= from && d <= to;
          })
        : list || [];

    const filterLabelPdf =
      pdfDateFrom && pdfDateTo
        ? `Date range: ${formatDDMMYY(pdfDateFrom)} – ${formatDDMMYY(pdfDateTo)}`
        : dateRange?.from && dateRange?.to
          ? `Date range: ${formatDDMMYY(dateRange.from)} – ${formatDDMMYY(dateRange.to)}`
          : `Period: ${period ?? 'This month'}`;
    const generatedAtPdf = formatDDMMYY(new Date());

    const questionRowsPdf = (() => {
      const p2 = part2Averages(pdfList);
      const p3 = part3Averages(pdfList);
      const part4Scores = pdfList
        .map((r) => SATISFACTION_SCORE[r.overall_satisfaction])
        .filter((s) => s != null);
      const part4Avg = part4Scores.length ? part4Scores.reduce((a, b) => a + b, 0) / part4Scores.length : null;
      const rows = [];
      Object.entries(PART2_LABELS).forEach(([key, label]) => {
        rows.push({ part: 'Part II – Facility & Service', question: label, avg: p2[key] != null ? Number(p2[key].toFixed(2)) : '–' });
      });
      Object.entries(PART3_LABELS).forEach(([key, label]) => {
        rows.push({ part: 'Part III – Staff Evaluation', question: label, avg: p3[key] != null ? Number(p3[key].toFixed(2)) : '–' });
      });
      rows.push({
        part: 'Part IV – Overall Satisfaction',
        question: 'Overall satisfaction',
        avg: part4Avg != null ? Number(part4Avg.toFixed(2)) : '–',
      });
      return rows;
    })();
    const respondentsRowsPdf = formatRespondents(pdfList);
    const suggestionsRowsPdf = pdfList
      .filter((r) => r.comments && String(r.comments).trim().length > 0)
      .map((r) => ({
        ...r,
        officeDisplay:
          r.office_unit_other && String(r.office_unit_other).trim()
            ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
            : r.office_unit_address || '–',
      }));

    const questionRowsHtml = questionRowsPdf
      .map(
        (row) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${escapeHtml(row.part)}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${escapeHtml(row.question)}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${typeof row.avg === 'number' ? row.avg.toFixed(2) : escapeHtml(row.avg)}</td></tr>`
      )
      .join('');
    const respondentsHtml = respondentsRowsPdf
      .map(
        (r) =>
          `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.parent_name || '–')}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.sex || '–')}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.country_code && r.contact_number ? `${r.country_code} ${r.contact_number}` : r.contact_number || '–')}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.office_unit_other && String(r.office_unit_other).trim() ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})` : r.office_unit_address || '–')}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.child_age ?? '–')}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.child_sex || '–')}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${formatDDMMYY(r.date_of_use)}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${formatDDMMYY(r.created_at)}</td></tr>`
      )
      .join('');
    const suggestionsHtml = suggestionsRowsPdf
      .map(
        (r) =>
          `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${formatDDMMYY(r.created_at)}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.officeDisplay)}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${formatDDMMYY(r.date_of_use)}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(r.comments || '–')}</td></tr>`
      )
      .join('');

    const dateBlock = `<h1>Feedback Report</h1><div class="meta">${escapeHtml(filterLabelPdf)}<br>Generated: ${escapeHtml(generatedAtPdf)}</div>`;
    const questionSection = questionAverages
      ? `<section><h2>Question averages</h2><table><thead><tr><th>Part</th><th>Question</th><th>Average</th></tr></thead><tbody>${questionRowsHtml}</tbody></table></section>`
      : '';
    const respondentsSection = respondents
      ? `<section><h2>List of respondents</h2><table><thead><tr><th>Parent / guardian</th><th>Sex</th><th>Contact</th><th>Office / unit</th><th>Child age</th><th>Child sex</th><th>Date registered</th><th>Submitted</th></tr></thead><tbody>${respondentsHtml}</tbody></table></section>`
      : '';
    const suggestionsSection = suggestions
      ? `<section><h2>Suggestions</h2><table><thead><tr><th>Date</th><th>Office / unit</th><th>Date registered</th><th>Suggestion</th></tr></thead><tbody>${suggestionsHtml}</tbody></table></section>`
      : '';

    const bodyParts = [dateBlock, questionSection, respondentsSection, suggestionsSection].filter(Boolean);
    const bodyContent = bodyParts.length ? bodyParts.join('') : '<p class="meta">No sections selected for printing.</p>';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Feedback Report</title><style>
      body{font-family:Inter,system-ui,sans-serif;margin:0;padding:24px;color:#1e293b;font-size:14px;}
      h1{font-size:18px;margin:0 0 6px 0;}
      .meta{color:#64748b;font-size:12px;margin:6px 0 16px 0;padding-bottom:12px;border-bottom:1px solid #e2e8f0;}
      section{margin-bottom:20px;}
      h2{font-size:15px;margin:0 0 8px 0;}
      table{width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;}
      th{text-align:left;padding:5px 8px;background:#f1f5f9;font-weight:600;border-bottom:2px solid #e2e8f0;font-size:12px;}
      td{font-size:12px;}
      @media print{body{padding:12px;}}
    </style></head><body>${bodyContent}</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:absolute;left:-9999px;width:800px;height:800px;border:none');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    };
    iframe.contentWindow.onafterprint = cleanup;
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 100);
    setTimeout(cleanup, 60000);
  };

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
        <p className="font-semibold">Could not load report data</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const togglePrintSection = (key) => {
    setPrintSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkboxOption = (key, label) => {
    const checked = printSections[key];
    return (
      <label
        key={key}
        className={`group flex items-center gap-2.5 rounded-full px-4 py-2.5 cursor-pointer transition-all duration-200 select-none ${
          checked
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => togglePrintSection(key)}
          className="sr-only"
        />
        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${checked ? 'bg-white/25 text-white' : 'bg-slate-300/50 text-slate-500 group-hover:bg-slate-400/50'}`}>
          {checked && '✓'}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </label>
    );
  };

  return (
    <div className="space-y-6">
      {/* Report options card — modern glass-style */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_-8px_rgba(0,0,0,0.08)]">
        <div className="flex items-end gap-4 flex-wrap pb-1">
          {/* Left: date pickers + Include in PDF (can wrap); right: Print stays fixed */}
          <div className="flex flex-wrap items-end gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="flex flex-col gap-2 shrink-0">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Date Picker</h4>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100/70 px-3 py-2 ring-1 ring-slate-200/40 h-[42px]">
                  <CalendarRange size={14} className="text-slate-400 shrink-0" />
                  <input
                    id="pdf-date-from"
                    type="date"
                    value={pdfDateFrom}
                    onChange={(e) => setPdfDateFrom(e.target.value)}
                    className="rounded-lg bg-white/80 border-0 px-2.5 py-1.5 text-[13px] text-slate-700 min-w-[120px] h-8 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-slate-100"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100/70 px-3 py-2 ring-1 ring-slate-200/40 h-[42px]">
                  <input
                    id="pdf-date-to"
                    type="date"
                    value={pdfDateTo}
                    onChange={(e) => setPdfDateTo(e.target.value)}
                    className="rounded-lg bg-white/80 border-0 px-2.5 py-1.5 text-[13px] text-slate-700 min-w-[120px] h-8 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-slate-100"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                {(pdfDateFrom || pdfDateTo) && (
                  <button
                    type="button"
                    onClick={() => { setPdfDateFrom(''); setPdfDateTo(''); }}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors h-[42px] flex items-center"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Include in PDF</h4>
              <div className="flex flex-wrap items-center gap-2">
                {checkboxOption('questionAverages', 'Question averages')}
                {checkboxOption('respondents', 'List of respondents')}
                {checkboxOption('suggestions', 'Suggestions')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2.5 px-5 py-2.5 h-[42px] rounded-full bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 transition-all duration-200 flex-shrink-0"
          >
            <FileDown size={18} strokeWidth={2.5} />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Question averages */}
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-1">Question averages</h3>
        <p className="text-slate-500 text-sm mb-4">Average rating (1–5) per question for the selected period</p>
        {loading ? (
          <div className="h-32 flex items-center justify-center text-slate-400">Loading…</div>
        ) : (
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-slate-50/80 text-slate-600 border-b-2 border-slate-200">
                  <th className="py-3.5 px-3 font-semibold">Part</th>
                  <th className="py-3.5 px-3 font-semibold">Question</th>
                  <th className="py-3.5 px-3 font-semibold">Average</th>
                </tr>
              </thead>
              <tbody>
                {questionRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-600">{row.part}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{row.question}</td>
                    <td className="py-3 px-3 text-slate-600">{typeof row.avg === 'number' ? row.avg.toFixed(2) : row.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Respondents */}
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-1">List of respondents</h3>
        <p className="text-slate-500 text-sm mb-4">Basic information for all respondents in the selected period</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400">Loading…</div>
        ) : !respondentsRows.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No respondents in this period</div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-slate-50/80 text-slate-600 border-b-2 border-slate-200">
                    <th className="py-3.5 px-3 font-semibold">Parent / guardian</th>
                    <th className="py-3.5 px-3 font-semibold">Sex</th>
                    <th className="py-3.5 px-3 font-semibold">Contact</th>
                    <th className="py-3.5 px-3 font-semibold">Office / unit</th>
                    <th className="py-3.5 px-3 font-semibold">Child age</th>
                    <th className="py-3.5 px-3 font-semibold">Child sex</th>
                    <th className="py-3.5 px-3 font-semibold">Date registered</th>
                    <th className="py-3.5 px-3 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {respPageRows.map((r, index) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <td className="py-3 pr-3 font-medium text-slate-800">{r.parent_name || '–'}</td>
                      <td className="py-3 pr-3 text-slate-600">{r.sex || '–'}</td>
                      <td className="py-3 pr-3 text-slate-600">
                        {r.country_code && r.contact_number ? `${r.country_code} ${r.contact_number}` : r.contact_number || '–'}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {r.office_unit_other && String(r.office_unit_other).trim()
                          ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
                          : r.office_unit_address || '–'}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{r.child_age ?? '–'}</td>
                      <td className="py-3 pr-3 text-slate-600">{r.child_sex || '–'}</td>
                      <td className="py-3 pr-3 text-slate-600">{r.dateOfUseFormatted}</td>
                      <td className="py-3 text-slate-600">{r.submittedFormatted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {respTotalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
                <p className="text-slate-500 text-sm">
                  Showing {respPageStart + 1}–{Math.min(respPageStart + PAGE_SIZE, respondentsRows.length)} of {respondentsRows.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRespondentsPage((p) => Math.max(1, p - 1))}
                    disabled={respondentsPage <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center gap-0.5 mx-1">
                    {Array.from({ length: respTotalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (respTotalPages <= 7) return true;
                        if (p === 1 || p === respTotalPages) return true;
                        if (Math.abs(p - respondentsPage) <= 1) return true;
                        return false;
                      })
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '…' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setRespondentsPage(p)}
                            className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                              respondentsPage === p ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRespondentsPage((p) => Math.min(respTotalPages, p + 1))}
                    disabled={respondentsPage >= respTotalPages}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Next page"
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

      {/* Suggestions */}
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-1">Suggestions</h3>
        <p className="text-slate-500 text-sm mb-4">All suggestions for improvement in the selected period</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400">Loading…</div>
        ) : !suggestionsRows.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No suggestions in this period</div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-slate-50/80 text-slate-600 border-b-2 border-slate-200">
                    <th className="py-3.5 px-3 font-semibold">Date</th>
                    <th className="py-3.5 px-3 font-semibold">Office / unit</th>
                    <th className="py-3.5 px-3 font-semibold">Date registered</th>
                    <th className="py-3.5 px-3 font-semibold">Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {sugPageRows.map((r, index) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.submittedFormatted}</td>
                      <td className="py-3 px-3 text-slate-600">{r.officeDisplay}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.dateOfUseFormatted}</td>
                      <td className="py-3 px-3 text-slate-700">{r.comments || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sugTotalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
                <p className="text-slate-500 text-sm">
                  Showing {sugPageStart + 1}–{Math.min(sugPageStart + PAGE_SIZE, suggestionsRows.length)} of {suggestionsRows.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSuggestionsPage((p) => Math.max(1, p - 1))}
                    disabled={suggestionsPage <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center gap-0.5 mx-1">
                    {Array.from({ length: sugTotalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (sugTotalPages <= 7) return true;
                        if (p === 1 || p === sugTotalPages) return true;
                        if (Math.abs(p - suggestionsPage) <= 1) return true;
                        return false;
                      })
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '…' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSuggestionsPage(p)}
                            className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                              suggestionsPage === p ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuggestionsPage((p) => Math.min(sugTotalPages, p + 1))}
                    disabled={suggestionsPage >= sugTotalPages}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Next page"
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
    </div>
  );
}
