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
    <div 
      ref={setNodeRef} 
      style={style} 
      className={isAdmin ? "cursor-grab active:cursor-grabbing" : ""}
      {...(isAdmin ? { ...attributes, ...listeners } : {})}
    >
      {children}
    </div>
  );
};
