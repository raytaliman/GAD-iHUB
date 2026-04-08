import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SATISFACTION_ORDER = [
  'Very Satisfied',
  'Satisfied',
  'Neutral',
  'Dissatisfied',
  'Very Dissatisfied',
];
/* Match dashboard palette: vibrant purple → lighter purple → gray */
const COLORS = ['#7B5CF6', '#A78BFA', '#C4B5FD', '#A1A1AA', '#71717A'];

/**
 * Donut Chart component that visualizes the distribution of overall satisfaction levels.
 * Uses a segmented pie layout with interactive tooltips and a vertical legend.
 * 
 * @param {Object} props
 * @param {Object} props.distribution - Mapping of satisfaction labels (e.g., 'Very Satisfied') to their respective counts.
 */
export default function ChartSatisfactionDonut({ distribution }) {
  const data =
    distribution && Object.keys(distribution).length > 0
      ? SATISFACTION_ORDER.filter((k) => (distribution[k] || 0) > 0).map((name) => ({
        name,
        value: distribution[name] || 0,
      }))
      : [];

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-4">Overall satisfaction</h3>
        <div className="h-[280px] flex items-center justify-center text-slate-400">No data</div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
      <h3 className="font-semibold text-slate-800 mb-3">Overall satisfaction</h3>
      <div className="h-[280px] flex flex-col">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={80}
                paddingAngle={2}
                cornerRadius={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                formatter={(value) => [
                  `${value} (${total ? ((value / total) * 100).toFixed(1) : 0}%)`,
                  'Responses',
                ]}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry) => (
                  <span className="text-slate-600 text-sm">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-slate-500 text-sm mt-2">Total: {total} responses</p>
      </div>
    </div>
  );
}
