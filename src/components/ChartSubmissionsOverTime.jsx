import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const BAR_COLOR = '#7B5CF6';

/**
 * Utility function to calculate how much a value deviates from a set of comparative values.
 * 
 * @private
 * @param {number} value - The focal value.
 * @param {number[]} others - Array of other values to average for comparison.
 * @returns {number|null} The percentage difference, or null if no comparison values exist.
 */
function pctVsOthers(value, others) {
  if (!others.length) return null;
  const avg = others.reduce((a, b) => a + b, 0) / others.length;
  return ((value - avg) / avg) * 100;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const value = item?.value;
  const pct = item?.pctVsOthers;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3 min-w-[180px]">
      <p className="text-sm font-semibold text-slate-800 mb-1">{label}</p>
      <p className="text-sm text-slate-600">
        Avg satisfaction: <span className="font-semibold text-slate-800">{value?.toFixed(2) ?? '–'}</span>
      </p>
      {pct != null && (
        <p className={`text-xs mt-1.5 font-medium ${pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {pct >= 0 ? `↑ +${pct.toFixed(1)}%` : `↓ ${pct.toFixed(1)}%`} vs other days
        </p>
      )}
    </div>
  );
}

export default function ChartSubmissionsOverTime({ data, period, onPeriodChange }) {
  const enrichedData =
    data?.map((d, i) => {
      const others = (data || []).filter((_, j) => j !== i).map((x) => x.value);
      const pctVsOthersVal = pctVsOthers(d.value, others);
      return { ...d, pctVsOthers: pctVsOthersVal };
    }) ?? [];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Satisfaction over time</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-400">No data for this period</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-slate-800">Satisfaction over time</h3>
        {onPeriodChange && (
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white"
          >
            <option value="This week">This week</option>
            <option value="This month">This month</option>
            <option value="Last 3 months">Last 3 months</option>
            <option value="This year">This year</option>
          </select>
        )}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enrichedData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              domain={[0, 5]}
              allowDecimals
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(112, 48, 160, 0.08)' }} />
            <Bar
              dataKey="value"
              name="Avg satisfaction"
              fill={BAR_COLOR}
              radius={[12, 12, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
