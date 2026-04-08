import { useState, useRef, useEffect } from 'react';
import { User, Baby, Users } from 'lucide-react';

/**
 * Radial Chart component that visualizes the distribution of respondents by biological sex, 
 * categorized into Parent and Child groups.
 * 
 * @param {Object} props
 * @param {Array<{name: string, value: number}>} props.data - Ordered array of sex distribution data (Parent M, Parent F, Child M, Child F).
 */
export default function ChartSexDistribution({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1200);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/25 shadow-card">
        <h3 className="font-semibold text-slate-800 mb-4">Sex Distribution</h3>
        <div className="text-slate-400 text-sm py-4 text-center italic">Awaiting registration data...</div>
      </div>
    );
  }

  // Calculate total across all categories for percentage computation
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  // Prepare categories with calculated relative percentages
  const categories = data.map((item) => ({
    ...item,
    value: item.value || 0,
    percentage: total > 0 ? ((item.value || 0) / total) * 100 : 0,
  }));

  // Colors for 4 rings - Modern vibrant palette for Parent/Child differentiation
  const colors = [
    { fill: '#6366F1', bg: '#EEF2FF', label: 'Parent Male' },   // Indigo
    { fill: '#8B5CF6', bg: '#F5F3FF', label: 'Parent Female' }, // Violet
    { fill: '#F43F5E', bg: '#FFF1F2', label: 'Child Male' },    // Rose
    { fill: '#FB7185', bg: '#FFF5F5', label: 'Child Female' },  // Light Rose
  ];

  // Ring sizes for 4 rings (Inner to Outer)
  const ringSizes = [82, 64, 46, 28];
  const strokeWidth = 16;
  const centerX = 100;
  const centerY = 100;
  const viewBoxSize = 200;

  /**
   * Updates tooltip coordinates and state on ring hover.
   * @private
   */
  const handleRingHover = (index, event) => {
    setHoveredIndex(index);
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setTooltipPos({ x, y });
  };

  /**
   * Renders the background trough for a specific ring.
   * @private
   */
  const renderRing = (index, color) => {
    const radius = ringSizes[index];
    return (
      <circle
        key={`bg-${index}`}
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={color.bg}
        strokeWidth={strokeWidth}
      />
    );
  };

  /**
   * Renders the animated filled bar for a specific ring.
   * @private
   */
  const renderFilledRing = (index, percentage, color) => {
    const radius = ringSizes[index];
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference - (percentage / 100) * circumference;
    const initialOffset = isAnimating ? circumference : targetOffset;
    const isHovered = hoveredIndex === index;

    return (
      <circle
        key={`fill-${index}`}
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={color.fill}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={initialOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${centerX} ${centerY})`}
        style={{
          transition: isAnimating
            ? `stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s, opacity 0.2s`
            : 'stroke-dashoffset 0.3s ease-out, opacity 0.2s, stroke-width 0.2s',
          strokeDashoffset: targetOffset,
          opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
          strokeWidth: isHovered ? strokeWidth + 2 : strokeWidth,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => handleRingHover(index, e)}
        onMouseMove={(e) => handleRingHover(index, e)}
        onMouseLeave={() => setHoveredIndex(null)}
      />
    );
  };

  // Group items for legend
  const parents = categories.slice(0, 2);
  const children = categories.slice(2, 4);

  return (
    <div className="bg-white rounded-2xl p-4 border border-black/25 shadow-card h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-slate-800 text-sm">Sex Distribution</h3>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
          <Users size={12} className="text-primary" />
          <span className="text-xs font-black text-slate-600 tracking-tight">{total}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1">
        {/* Chart Section - Ultra impact size */}
        <div className="relative flex-shrink-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-[205px] h-[205px] drop-shadow-sm"
          >
            {/* Background rings */}
            {categories.map((_, index) => renderRing(index, colors[index]))}
            {/* Filled rings */}
            {categories.map((item, index) => renderFilledRing(index, item.percentage, colors[index]))}
          </svg>

          {/* Floating Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute bg-white rounded-xl shadow-xl border border-slate-200 px-3 py-2.5 pointer-events-none z-20 whitespace-nowrap animate-fade-in"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y - 45}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="text-[11px] font-bold text-slate-800 mb-1 leading-none uppercase tracking-wide">
                {categories[hoveredIndex].name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-medium">{categories[hoveredIndex].value} respondents</span>
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                  {categories[hoveredIndex].percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend Sections - Side by Side and Readable */}
        <div className="flex-1 grid grid-cols-1 gap-4">
          {/* Parents Group */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <User size={12} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Parents</span>
            </div>
            {parents.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between leading-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i].fill }} />
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-800">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Children Group */}
          <div className="space-y-2 border-t border-slate-50 pt-3">
            <div className="flex items-center gap-2 mb-1">
              <Baby size={12} className="text-rose-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Children</span>
            </div>
            {children.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between leading-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i + 2].fill }} />
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-800">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
