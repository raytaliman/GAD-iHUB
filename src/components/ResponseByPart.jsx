/**
 * Component that displays a vertical list of progress bars representing average satisfaction scores
 * for different parts of the feedback form (Part II, III, and IV).
 * 
 * @param {Object} props
 * @param {Array<{name: string, avg: number}>} props.data - Aggregated averages per system section.
 */
export default function ResponseByPart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-4">Avg satisfaction per part (II–IV)</h3>
        <div className="text-slate-400 text-sm py-4 text-center">No data yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
      <h3 className="font-semibold text-slate-800 mb-4">Avg satisfaction per part (II–IV)</h3>
      <p className="text-slate-500 text-sm mb-4">Average score out of 5 for each form part</p>
      <div className="space-y-5">
        {data.map(({ name, avg }) => {
          const pct = (avg / 5) * 100;
          return (
            <div key={name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">{name}</span>
                <span className="text-slate-600 font-medium">{avg > 0 ? avg.toFixed(1) : '0.0'} / 5</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
