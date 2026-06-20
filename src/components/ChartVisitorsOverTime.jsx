import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const LINE_COLOR = '#7030a0';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 min-w-[150px] animate-scale-in">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700">
        Visitors: <span className="font-bold text-[#7030a0]">{count}</span>
      </p>
    </div>
  );
}

export default function ChartVisitorsOverTime({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Visitors per day</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs font-semibold">No data for this period</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h3 className="font-bold text-slate-800 text-sm">Visitors per day</h3>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 500 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 11, fontWeight: 500 }}
              stroke="#94a3b8"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(112, 48, 160, 0.08)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="count"
              name="Visitors"
              stroke={LINE_COLOR}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, stroke: '#fff', fill: LINE_COLOR }}
              activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLOR }}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
