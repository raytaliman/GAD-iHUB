import { ArrowUpRight } from 'lucide-react';

/**
 * Component that displays a summary table of the most recent feedback submissions.
 * Shows data points such as submission date, parent name, child age, satisfaction rating, and truncated comments.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.rows - Array of evaluation records to display.
 * @param {string} props.rows[].id - Unique record identifier.
 * @param {string} props.rows[].date - Human-readable date of submission.
 * @param {string} [props.rows[].parent_name] - Name of the respondent parent.
 * @param {string} [props.rows[].office_unit_address] - Office or unit associated with the feedback.
 * @param {string} [props.rows[].overall_satisfaction] - Qualitative satisfaction rating.
 * @param {string} [props.rows[].comments] - User-submitted suggestions or comments.
 */
export default function LatestSubmissions({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Latest feedback</h3>
        </div>
        <div className="text-slate-400 text-sm py-8 text-center">No submissions yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-sm">Latest feedback</h3>
        <button className="text-[#7030a0] text-xs font-bold hover:underline flex items-center gap-1 transition-all">
          See all <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider">
              <th className="pb-3 pr-4 font-semibold">Date</th>
              <th className="pb-3 pr-4 font-semibold">Parent</th>
              <th className="pb-3 pr-4 font-semibold">Child age</th>
              <th className="pb-3 pr-4 font-semibold">Satisfaction</th>
              <th className="pb-3 font-semibold">Suggestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.slice(0, 4).map((r, index) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <td className="py-3.5 pr-4 text-slate-500 font-medium text-xs">{r.date}</td>
                <td className="py-3.5 pr-4">
                  <span className="font-bold text-slate-800 text-xs block">{r.parent_name || '–'}</span>
                </td>
                <td className="py-3.5 pr-4 text-slate-600 font-semibold text-xs">{r.child_age ? `${r.child_age} yrs` : '–'}</td>
                <td className="py-3.5 pr-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      r.overall_satisfaction === 'Very Satisfied' || r.overall_satisfaction === 'Satisfied'
                        ? 'bg-emerald-50 text-emerald-700'
                        : r.overall_satisfaction === 'Very Dissatisfied' || r.overall_satisfaction === 'Dissatisfied'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r.overall_satisfaction || '–'}
                  </span>
                </td>
                <td className="py-3.5 text-slate-600 text-xs max-w-[200px] truncate" title={r.comments || ''}>
                  {r.comments ? (r.comments.length > 40 ? `${r.comments.slice(0, 40)}…` : r.comments) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
