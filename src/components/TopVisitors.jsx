import React, { useState } from 'react';
import { Award, Star } from 'lucide-react';

/**
 * Component that displays a summary table of the top visitors based on their visit counts.
 * Includes a filter to toggle between showing the Top 5 or Top 10 visitors.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.registrations - List of raw registration records.
 */
export default function TopVisitors({ registrations = [] }) {
  const [topLimit, setTopLimit] = useState(5);

  // Group registrations by visitor key (ignoring casing & whitespace) to calculate visit counts
  const topList = React.useMemo(() => {
    const visitsMap = {};
    
    registrations.forEach((r) => {
      // Group by a unique combination of name and contact number
      const parentName = (r.parent_name || '').trim();
      const contact = (r.contact_number || '').trim();
      
      if (!parentName) return;
      
      const key = `${parentName.toLowerCase()}||${contact.toLowerCase()}`;
      if (!visitsMap[key]) {
        visitsMap[key] = {
          name: parentName,
          contact: r.contact_number || '–',
          sex: r.sex || '–',
          office: r.office_unit_address || '–',
          count: 0
        };
      }
      visitsMap[key].count += 1;
    });

    return Object.values(visitsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, topLimit);
  }, [registrations, topLimit]);

  if (!registrations || registrations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Top Visitors</h3>
        </div>
        <div className="text-slate-400 text-sm py-8 text-center">No registration data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">Top Visitors</h3>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-100 text-[#7030a0]">
            <Award size={10} /> Rank
          </span>
        </div>
        
        {/* Toggle between Top 5 and Top 10 */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/20">
          {[5, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setTopLimit(num)}
              className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase transition-all ${
                topLimit === num
                  ? 'bg-white text-[#7030a0] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Top {num}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider">
              <th className="pb-3 pr-4 font-semibold text-center w-10">Rank</th>
              <th className="pb-3 pr-4 font-semibold">Visitor Details</th>
              <th className="pb-3 pr-4 font-semibold text-center">Visits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {topList.map((v, index) => {
              const rank = index + 1;
              return (
                <tr
                  key={index}
                  className="hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 40}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <td className="py-3.5 pr-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                      rank === 1 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : rank === 2 
                        ? 'bg-slate-150 text-slate-700 border border-slate-200' 
                        : rank === 3 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200/50' 
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {rank}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="font-bold text-slate-800 text-xs block">{v.name}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-violet-50 text-[#7030a0] border border-violet-100/50">
                      <Star size={10} className="fill-[#7030a0] text-[#7030a0]" />
                      {v.count}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
