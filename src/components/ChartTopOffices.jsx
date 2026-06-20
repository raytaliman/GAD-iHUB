import { useState, useRef, useEffect } from 'react';
import { Building2 } from 'lucide-react';

/**
 * Radial Chart component that visualizes the top performing units by response volume.
 * Displays data in nested rings with interactive tooltips and legend.
 * 
 * @param {Object} props
 * @param {Array<{name: string, value: number}>} props.data - An array of objects mapping unit names to their response counts.
 */
export default function ChartTopOffices({ data }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(true);
    const svgRef = useRef(null);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1200);
        return () => clearTimeout(timer);
    }, [data]);

    // Take top 4 for focused visualization
    const top4 = (data || []).slice(0, 4);
    const total = top4.reduce((sum, item) => sum + (item.value || 0), 0);

    // Prepare categories with calculated percentages
    const categories = top4.map((item) => ({
        ...item,
        value: item.value || 0,
        percentage: total > 0 ? ((item.value || 0) / total) * 100 : 0,
    }));

    if (categories.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 size={16} className="text-[#7030a0]" />
                    Top 4 Units
                </h3>
                <div className="text-slate-400 text-sm py-4 text-center italic">Awaiting unit data...</div>
            </div>
        );
    }

    // Colors for 4 rings - matched with Demographics for consistency
    const colors = [
        { fill: '#6366F1', bg: '#EEF2FF' }, // Indigo
        { fill: '#8B5CF6', bg: '#F5F3FF' }, // Violet
        { fill: '#F43F5E', bg: '#FFF1F2' }, // Rose
        { fill: '#FB7185', bg: '#FFF5F5' }, // Light Rose
    ];

    // Ring sizes for 4 rings (Inner to Outer)
    const ringSizes = [82, 64, 46, 28];
    const strokeWidth = 16;
    const centerX = 100;
    const centerY = 100;
    const viewBoxSize = 200;

    /**
     * Updates the tooltip position and index when hovering over a ring.
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
     * Renders a static background circle for a ring.
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
     * Renders the dynamic filled portion of a ring with animations.
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

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Demographics
                </h3>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responses</span>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1">
                {/* Chart Section */}
                <div className="relative flex-shrink-0">
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                        className="w-[190px] h-[190px] drop-shadow-sm"
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

                {/* Legend */}
                <div className="flex-1 space-y-2.5">
                    {categories.map((item, i) => (
                        <div key={item.name} className="group/item">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 truncate max-w-[120px]">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i].fill }} />
                                    <span className="text-[11px] font-bold text-slate-600 truncate group-hover/item:text-slate-900 transition-colors">
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-slate-800 ml-2">
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 pt-4 border-t border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                            Top Performance Volume
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
