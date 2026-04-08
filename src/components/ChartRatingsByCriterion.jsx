import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RATING_SCORE = {
  excellent: 5,
  veryGood: 4,
  good: 3,
  fair: 2,
  poor: 1,
  na: null,
};

const LABELS = {
  cleanliness_safety: 'Cleanliness & safety',
  child_comfort: "Child's comfort",
  toys_materials: 'Toys & materials',
  staff_attentiveness: 'Staff attentiveness',
  accessibility_convenience: 'Accessibility',
  maintenance_upkeep: 'Maintenance',
  staff_responsiveness: 'Staff responsiveness',
  staff_eval_attentiveness: 'Attentiveness',
  staff_eval_friendliness: 'Friendliness',
  staff_eval_responsiveness: 'Responsiveness',
};

const COLORS = ['#7B5CF6', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'];

/**
 * Horizontal Bar Chart component that compares average scores across different service and staff criteria.
 * 
 * @param {Object} props
 * @param {Object} props.criteriaData - Mapping of criterion keys to their numeric average scores.
 * @param {string} [props.title='Ratings by criterion'] - Custom title for the chart card.
 */
export default function ChartRatingsByCriterion({ criteriaData, title = 'Ratings by criterion' }) {
  const data =
    criteriaData &&
    Object.entries(criteriaData).map(([key, avg]) => ({
      name: LABELS[key] || key.replace(/_/g, ' '),
      avg: avg != null ? Number(avg.toFixed(2)) : 0,
      fullKey: key,
    }));

  if (!data || data.length === 0 || data.every((d) => d.avg === 0)) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-slate-400">No ratings yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
      <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              formatter={(value) => [value, 'Avg score']}
            />
            <Bar
              dataKey="avg"
              name="Avg"
              radius={[0, 12, 12, 0]}
              maxBarSize={24}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
