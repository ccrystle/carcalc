import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EditableTextProps {
  contentKey: string;
  defaultContent: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  isAdmin: boolean;
  wrapperClassName?: string;
}

export const EditableText = ({
  contentKey,
  defaultContent,
  className = "",
  as: Component = "p",
  isAdmin,
  wrapperClassName = "",
}: EditableTextProps) => {
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(defaultContent);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, [contentKey]);

  const loadContent = async () => {
    try {
      const response = await api.get(`/content/${contentKey}`);
      if (response.data && response.data.content) {
        setContent(response.data.content);
        setEditValue(response.data.content);
      }
    } catch (error) {
      // If content doesn't exist yet, that's fine, stick with default
      // console.log("Content not found, using default");
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/content/${contentKey}`, { content: editValue });
      setContent(editValue);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await api.post(`/content/${contentKey}`, { content: defaultContent });
      setContent(defaultContent);
      setEditValue(defaultContent);
      toast({
        title: "Success",
        description: "Content reset to default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset content",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return <Component className={`${className} whitespace-pre-line`}>{content}</Component>;
  }

  if (isEditing) {
    return (
      <div className="relative">
        {Component === "h1" || Component === "h2" || Component === "h3" ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`${className} w-full border-2 border-primary bg-primary/80 text-primary-foreground px-2 outline-none`}
            autoFocus
          />
        ) : (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`${className} w-full border-2 border-primary bg-primary/80 text-primary-foreground px-2 outline-none`}
            autoFocus
            rows={3}
          />
        )}
        <div className="mt-2 flex gap-2 z-50 relative">
          <button
            onClick={handleSave}
            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="rounded bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-secondary/90"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative inline-block ${wrapperClassName || "w-full"}`}>
      <Component
        className={`${className} whitespace-pre-line border-2 border-transparent hover:border-primary/30 transition-colors cursor-pointer rounded px-1 -mx-1`}
        onDoubleClick={() => setIsEditing(true)}
      >
        {content}
      </Component>
    </div>
  );
};

