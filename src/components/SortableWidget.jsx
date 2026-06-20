import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SPAN_CLASS = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
};

/**
 * Higher-order component that wraps dashboard widgets with drag-and-drop capabilities.
 * Uses `@dnd-kit/sortable` for reordering logic and provides a visual handle in manage mode.
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the sortable item.
 * @param {number} [props.span=1] - Column span for the grid layout (1, 2, or 3).
 * @param {boolean} props.manageMode - Whether the widget is currently in reorderable mode.
 * @param {React.ReactNode} props.children - The widget content to be rendered.
 */
export default function SortableWidget({ id, span = 1, manageMode, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const spanClass = SPAN_CLASS[span] ?? 'lg:col-span-1';

  if (!manageMode) {
    return <div className={spanClass}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${spanClass} ${isDragging ? 'opacity-50 z-10' : ''}`}
    >
      <div className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-white/80 p-4">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab touch-none text-slate-400 hover:text-primary active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={20} />
        </div>
        <div className="pl-10 min-h-[80px] flex items-center">{children}</div>
      </div>
    </div>
  );
}
