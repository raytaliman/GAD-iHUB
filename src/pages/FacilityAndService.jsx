import { useState, useEffect, useRef } from 'react';
import { fetchFeedback, fetchFormStructure, distributionForQuestions } from '../lib/data';

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

/** Flat segment colors (1=low → 5=high): gold, orange, light blue, indigo, purple */
const SEGMENT_COLORS = {
  1: '#eab308',
  2: '#f97316',
  3: '#38bdf8',
  4: '#818cf8',
  5: '#7c3aed',
};

/** Single-value bar (avg) – kept for backward compatibility; use SegmentedBar for distribution. */
function AvgLineBar({ value, max = 5, width = 300, height = 20 }) {
  const v = value != null && !Number.isNaN(value) ? Number(value) : 0;
  const segment = Math.min(5, Math.max(1, Math.round((v / (max || 5)) * 5)));
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dist[segment] = 1;
  return <SegmentedBar distribution={dist} width={width} height={height} />;
}

const SEGMENT_GAP = 3;
const BAR_RADIUS = 4;

/**
 * Modal component that displays a list of verbatim text responses for a specific question.
 * 
 * @param {Object} props
 * @param {string} props.questionLabel - The text of the question.
 * @param {Array<{text: string, date: string}>} props.responses - Array of text responses with their submission dates.
 * @param {Function} props.onClose - Callback to close the modal.
 */
function TextDetailsModal({ questionLabel, responses, onClose }) {
  if (!questionLabel || !responses) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View text responses"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800 text-sm truncate">{questionLabel}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {responses.length === 0 ? (
            <p className="text-slate-500 text-sm">No text responses.</p>
          ) : (
            <ul className="space-y-3">
              {responses.map((r, i) => (
                <li key={i} className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="whitespace-pre-wrap break-words">{typeof r === 'string' ? r : (r.text ?? r.value ?? '')}</p>
                  {r.date && (
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(r.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A horizontal bar component that visualizes a qualitative distribution (1-5 ratings).
 * Each rating level is rendered as a distinct colored segment, with sizes proportional to its frequency.
 * 
 * @param {Object} props
 * @param {Object} props.distribution - Mapping of rating values (1, 2, 3, 4, 5) to their counts.
 * @param {number} [props.width=300] - Width of the bar.
 * @param {number} [props.height=20] - Height of the bar.
 */
function SegmentedBar({ distribution, width = 300, height = 20 }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const barRef = useRef(null);

  const counts = distribution && typeof distribution === 'object'
    ? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...distribution }
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const total = [1, 2, 3, 4, 5].reduce((s, v) => s + (counts[v] || 0), 0);
  
  if (total === 0) {
    return (
      <div
        className="bg-slate-200 flex flex-row flex-1"
        style={{ width, height, borderRadius: BAR_RADIUS }}
      />
    );
  }
  
  const segments = [1, 2, 3, 4, 5]
    .map((v) => ({ 
      v, 
      count: counts[v] || 0,
      pct: (counts[v] || 0) / total 
    }))
    .filter((s) => s.pct > 0);

  /**
   * Updates tooltip on segment hover.
   * @private
   */
  const handleSegmentHover = (segment, event) => {
    setHoveredSegment(segment);
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setTooltipPos({ x, y });
    }
  };

  const getSegmentLabel = (value) => {
    const labels = {
      1: 'Poor / Very Dissatisfied',
      2: 'Fair / Dissatisfied',
      3: 'Good / Neutral',
      4: 'Very Good / Satisfied',
      5: 'Excellent / Very Satisfied',
    };
    return labels[value] || `Rating ${value}`;
  };

  return (
    <div className="relative" ref={barRef}>
      <div
        className="flex flex-row flex-1 flex-shrink-0 items-stretch bg-slate-200 p-[3px]"
        style={{ width, height, borderRadius: BAR_RADIUS, gap: SEGMENT_GAP }}
      >
        {segments.map((segment) => (
          <div
            key={segment.v}
            className="min-w-0 transition-all duration-300 cursor-pointer"
            style={{
              flex: `${segment.pct} 1 0`,
              minWidth: 4,
              borderRadius: BAR_RADIUS,
              background: SEGMENT_COLORS[segment.v] || '#94a3b8',
              opacity: hoveredSegment && hoveredSegment.v !== segment.v ? 0.5 : 1,
            }}
            onMouseEnter={(e) => handleSegmentHover(segment, e)}
            onMouseMove={(e) => handleSegmentHover(segment, e)}
            onMouseLeave={() => setHoveredSegment(null)}
          />
        ))}
      </div>
      {/* Tooltip */}
      {hoveredSegment && (
        <div
          className="absolute bg-white text-slate-700 text-xs rounded-xl px-3 py-2 shadow-lg pointer-events-none z-10 whitespace-nowrap border border-slate-200"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 40}px`,
            transform: 'translateX(-50%)',
            borderRadius: '12px',
          }}
        >
          <div className="font-semibold text-slate-800">{getSegmentLabel(hoveredSegment.v)}</div>
          <div className="text-slate-600 mt-0.5">
            {hoveredSegment.count} ({((hoveredSegment.pct) * 100).toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Page component that displays evaluation results for Facility, Service, and Staff performance (Parts II-IV).
 * Displays results as segmented bars for rating-type questions or response counts for text-type questions.
 * 
 * @param {Object} props
 * @param {string} props.period - The active time period filter.
 * @param {Object} props.dateRange - Custom date range filters.
 */
export default function FacilityAndService({ period, dateRange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [formParts, setFormParts] = useState([]);
  const [textDetailsOpen, setTextDetailsOpen] = useState(null); // { label, responses } or null

  /**
   * Fetches data and form schema on mount or filter change.
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchFeedback(period ?? 'This month', dateRange),
      fetchFormStructure(),
    ])
      .then(([data, parts]) => {
        if (!cancelled) {
          setList(data);
          setFormParts(parts || []);
        }
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
      Promise.all([
        fetchFeedback(period ?? 'This month', dateRange),
        fetchFormStructure(),
      ])
        .then(([data, parts]) => {
          setList(data);
          setFormParts(parts || []);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, [period, dateRange]);

  // Fallback question sets when DB has no form_parts (Part II / Part III from labels)
  const fallbackPart2Questions = (PART2_LABELS && Object.keys(PART2_LABELS).length)
    ? Object.entries(PART2_LABELS).map(([key, label]) => ({ key, label, answer_type: 'emoji' }))
    : [];
  const fallbackPart3Questions = (PART3_LABELS && Object.keys(PART3_LABELS).length)
    ? Object.entries(PART3_LABELS).map(([key, label]) => ({ key, label, answer_type: 'emoji' }))
    : [];

  const partsWithTableRows =
    formParts.length > 0
      ? formParts
          .map((part) => {
            const dist = distributionForQuestions(list, part.questions);
            const rows = part.questions.map((q) => {
              if (q.answer_type === 'text') {
                const withValue = list.filter((r) => (r[q.key] ?? '').toString().trim() !== '');
                const responses = withValue.map((r) => ({
                  text: (r[q.key] ?? '').toString().trim(),
                  date: r.created_at,
                }));
                return {
                  type: 'text',
                  label: q.label,
                  key: q.key,
                  respondentCount: responses.length,
                  responses,
                };
              }
              return {
                type: 'rating',
                label: q.label,
                key: q.key,
                distribution: dist[q.key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
              };
            });
            return { part, rows };
          })
          .filter((x) => x.rows.length > 0)
      : [
          ...(fallbackPart2Questions.length
            ? (() => {
                const dist = distributionForQuestions(list, fallbackPart2Questions);
                return [{
                  part: { key: 'part2', label: 'Facility and Service Evaluation' },
                  rows: fallbackPart2Questions.map((q) => ({
                    type: 'rating',
                    label: q.label,
                    key: q.key,
                    distribution: dist[q.key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  })),
                }];
              })()
            : []),
          ...(fallbackPart3Questions.length
            ? (() => {
                const dist = distributionForQuestions(list, fallbackPart3Questions);
                return [{
                  part: { key: 'part3', label: 'Staff Evaluation' },
                  rows: fallbackPart3Questions.map((q) => ({
                    type: 'rating',
                    label: q.label,
                    key: q.key,
                    distribution: dist[q.key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  })),
                }];
              })()
            : []),
        ].filter((x) => x.rows.length > 0);

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
        <p className="font-semibold">Could not load data</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      {partsWithTableRows.map(({ part, rows }) => (
        <div
          key={part.key}
          className="bg-white rounded-2xl p-6 border border-black/25 shadow-card flex flex-col"
        >
          <h2 className="font-semibold text-slate-800 mb-4">{part.label}</h2>
          {loading ? (
            <div className="py-12 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium text-sm">Question</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium text-sm w-[320px]">Response</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.key}
                    className="border-b border-slate-100 last:border-b-0 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <td className="py-3 px-4 text-slate-800 text-sm align-middle">{row.label}</td>
                    <td className="py-3 px-4 text-right align-middle">
                      {row.type === 'rating' ? (
                        <div className="flex justify-end">
                          <SegmentedBar distribution={row.distribution} />
                        </div>
                      ) : (
                        <div
                          className="group flex items-center justify-end gap-2 w-full cursor-default"
                          title="Hover and click View details to see responses"
                        >
                          <span className="text-slate-600 text-sm font-medium tabular-nums">
                            {row.respondentCount} {row.respondentCount === 1 ? 'respondent' : 'respondents'}
                          </span>
                          {row.respondentCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setTextDetailsOpen({ label: row.label, responses: row.responses || [] })}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none rounded px-2 py-1 text-xs font-medium text-violet-600 hover:text-violet-800 hover:bg-violet-50 transition-opacity"
                            >
                              View details
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      {!loading && partsWithTableRows.length === 0 && (
        <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card flex-1 flex items-center justify-center text-slate-500 text-sm">
          No evaluation parts found. Add parts and questions in Form Management, or run supabase_setup.sql.
        </div>
      )}
      {textDetailsOpen && (
        <TextDetailsModal
          questionLabel={textDetailsOpen.label}
          responses={textDetailsOpen.responses}
          onClose={() => setTextDetailsOpen(null)}
        />
      )}
    </div>
  );
}
