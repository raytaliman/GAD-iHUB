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
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Latest feedback</h3>
        </div>
        <div className="text-slate-400 text-sm py-8 text-center">No submissions yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Latest feedback</h3>
        <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
          See all <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Parent / Unit</th>
              <th className="pb-3 pr-4 font-medium">Child age</th>
              <th className="pb-3 pr-4 font-medium">Satisfaction</th>
              <th className="pb-3 font-medium">Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 4).map((r, index) => (
              <tr
                key={r.id}
                className="border-b border-slate-50 hover:bg-slate-50/50 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <td className="py-3 pr-4 text-slate-600">{r.date}</td>
                <td className="py-3 pr-4">
                  <span className="font-medium text-slate-800">{r.parent_name || '–'}</span>
                  <span className="block text-slate-500 text-xs">{r.office_unit_address || '–'}</span>
                </td>
                <td className="py-3 pr-4 text-slate-600">{r.child_age || '–'}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.overall_satisfaction === 'Very Satisfied' || r.overall_satisfaction === 'Satisfied'
                      ? 'bg-emerald-100 text-emerald-700'
                      : r.overall_satisfaction === 'Very Dissatisfied' || r.overall_satisfaction === 'Dissatisfied'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {r.overall_satisfaction || '–'}
                  </span>
                </td>
                <td className="py-3 text-slate-600 max-w-[200px] truncate" title={r.comments || ''}>
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
