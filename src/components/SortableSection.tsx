import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableSectionProps {
    id: string;
    children: React.ReactNode;
}

export function SortableSection({ id, children }: SortableSectionProps) {
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
        zIndex: isDragging ? 50 : "auto",
        position: "relative" as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative">
            {/* Drag Handle - visible on hover or always visible on mobile? 
          Let's make it always visible but subtle, or visible on group hover.
          For mobile, it needs to be tappable.
      */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-2 cursor-grab active:cursor-grabbing bg-black/50 rounded-md text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-none"
                aria-label="Drag to reorder"
            >
                <GripVertical className="w-6 h-6" />
            </div>

            {/* Mobile Drag Handle - Top Right or somewhere easier to hit on touch? 
          Actually, the side handle works well if we ensure it doesn't overlap content.
          Let's try a top-center handle for mobile if needed, but side is standard.
          For now, the above handle will show on hover (desktop). 
          On mobile, hover doesn't exist, so we might need it always visible or a toggle mode.
          Let's make it always visible on touch devices if possible, or just rely on the user knowing.
          Actually, let's make it always visible for now to ensure discoverability.
      */}
            <div
                {...attributes}
                {...listeners}
                className="absolute right-4 top-4 z-50 p-2 cursor-grab active:cursor-grabbing bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg text-white/70 hover:text-white hover:bg-gray-800 transition-all shadow-lg touch-none"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {children}
        </div>
    );
}
