import { MessageSquare, TrendingUp, Smile, ClipboardList, ArrowUpRight } from 'lucide-react';

const cards = [
  {
    key: 'total',
    label: 'Total feedbacks',
    value: (d) => d.total,
    suffix: '',
    trend: (d) => d.totalTrend,
    icon: MessageSquare,
    color: 'text-primary',
    bg: 'bg-primary/5',
  },
  {
    key: 'satisfaction',
    label: 'Avg. satisfaction',
    value: (d) => (d.avgSatisfaction != null ? `${((d.avgSatisfaction / 5) * 100).toFixed(1)}%` : '–'),
    suffix: '',
    trend: (d) => d.satisfactionTrend,
    icon: Smile,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'positive',
    label: 'Positive rate',
    value: (d) => (d.positiveRate != null ? `${(d.positiveRate * 100).toFixed(1)}%` : '–'),
    suffix: '',
    trend: (d) => d.positiveTrend,
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'suggestions',
    label: 'With suggestions',
    value: (d) => d.withSuggestions,
    suffix: '',
    trend: (d) => d.suggestionsTrend,
    icon: ClipboardList,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

/**
 * Component that displays a grid of primary Key Performance Indicator (KPI) cards.
 * Shows high-level metrics like total feedback, average satisfaction, positive rating, and suggestion counts, 
 * along with their calculated trends relative to the previous 2 days.
 * 
 * @param {Object} props
 * @param {Object|null} props.data - The calculated KPI metrics. If null, skeleton loaders are shown.
 * @param {number} props.data.total - Total number of feedback entries.
 * @param {number|null} props.data.avgSatisfaction - Average satisfaction score (1-5 scale).
 * @param {number|null} props.data.positiveRate - Ratio of positive (Satisfied/Very Satisfied) responses.
 * @param {number} props.data.withSuggestions - Count of records containing comments.
 * @param {number|null} props.data.totalTrend - Percentage change in total entries.
 * @param {number|null} props.data.satisfactionTrend - Percentage change in avg satisfaction.
 * @param {number|null} props.data.positiveTrend - Percentage change in positive rate.
 * @param {number|null} props.data.suggestionsTrend - Percentage change in suggestion count.
 */
export default function KPICards({ data }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-black/25 shadow-card animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, value, suffix, trend, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="bg-white rounded-2xl p-5 border border-black/25 shadow-card hover:shadow-lg transition-shadow relative group"
        >
          <button className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={18} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${bg} ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {value(data)}
            {suffix}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100">
            {trend(data) != null ? (
              <p
                className={`text-xs font-medium flex items-center gap-1 ${
                  trend(data) >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend(data) >= 0 ? (
                  <span>↑ +{trend(data).toFixed(1)}%</span>
                ) : (
                  <span>↓ {trend(data).toFixed(1)}%</span>
                )}
                <span className="text-slate-400 font-normal">vs last 2 days</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400">vs last 2 days: –</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
