import { MessageSquare, TrendingUp, Smile, ClipboardList, ArrowUpRight } from 'lucide-react';

const cards = [
  {
    key: 'total',
    label: 'Total feedbacks',
    value: (d) => d.total,
    suffix: '',
    trend: (d) => d.totalTrend,
    icon: MessageSquare,
    color: 'text-[#7030a0]',
    bg: 'bg-violet-50',
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
    color: 'text-[#7030a0]',
    bg: 'bg-violet-100/50',
  },
];

/**
 * Component that displays a grid of primary Key Performance Indicator (KPI) cards.
 * Shows high-level metrics like total feedback, average satisfaction, positive rating, and suggestion counts, 
 * along with their calculated trends relative to the previous 2 days.
 */
export default function KPICards({ data, trendLabel = 'vs previous period' }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-100 rounded w-20" />
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
          className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative group"
        >
          <button className="absolute top-2.5 right-2.5 p-0.5 rounded text-slate-400 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={12} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg ${bg} ${color}`}>
              <Icon size={14} />
            </div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider">{label}</p>
          </div>
          <p className="text-lg font-black text-slate-800 tracking-tight">
            {value(data)}
            {suffix}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-50">
            {trend(data) != null ? (
              <p
                className={`text-[10px] font-bold flex items-center gap-1 ${
                  trend(data) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend(data) >= 0 ? (
                  <span>↑ +{trend(data).toFixed(1)}%</span>
                ) : (
                  <span>↓ {trend(data).toFixed(1)}%</span>
                )}
                <span className="text-slate-400 font-medium">{trendLabel}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-semibold">{trendLabel}: –</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
