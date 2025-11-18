import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface DraggableSectionProps {
  id: string;
  children: React.ReactNode;
  isAdmin: boolean;
}

export const DraggableSection = ({ id, children, isAdmin }: DraggableSectionProps) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isAdmin && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-8 top-4 cursor-grab active:cursor-grabbing z-10 bg-primary/20 hover:bg-primary/40 rounded p-2 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-primary" />
        </div>
      )}
      {children}
    </div>
  );
};
