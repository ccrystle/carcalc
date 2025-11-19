import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, X } from "lucide-react";

interface EditableTextProps {
  contentKey: string;
  defaultContent: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "div" | "span";
  isAdmin: boolean;
}

export const EditableText = ({
  contentKey,
  defaultContent,
  className = "",
  as: Component = "p",
  isAdmin,
}: EditableTextProps) => {
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(defaultContent);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, [contentKey]);

  const loadContent = async () => {
    const { data } = await supabase
      .from("page_content")
      .select("content")
      .eq("key", contentKey)
      .single();

    if (data) {
      setContent(data.content);
      setEditValue(data.content);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("page_content")
      .upsert({ key: contentKey, content: editValue }, { onConflict: "key" });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    } else {
      setContent(editValue);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Content updated",
      });
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("page_content")
      .upsert({ key: contentKey, content: defaultContent }, { onConflict: "key" });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reset content",
        variant: "destructive",
      });
    } else {
      setContent(defaultContent);
      setEditValue(defaultContent);
      toast({
        title: "Success",
        description: "Content reset to default",
      });
    }
  };

  if (!isAdmin) {
    return <Component className={`${className} whitespace-pre-line`}>{content}</Component>;
  }

  if (isEditing) {
    return (
      <div className="relative">
        {Component === "h1" || Component === "h2" ? (
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
        <div className="mt-2 flex gap-2">
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
    <div className="group relative">
      <Component 
        className={`${className} whitespace-pre-line border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors cursor-pointer rounded px-2 py-1 bg-primary/20 hover:bg-primary/30`}
        onDoubleClick={() => setIsEditing(true)}
      >
        {content}
      </Component>
      <div className="flex gap-1 mt-1">
        <button
          onDoubleClick={() => setIsEditing(true)}
          className="opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-primary/20 rounded"
          title="Double-click to edit"
        >
          <Pencil className="h-3 w-3 text-primary" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
          title="Reset to default"
        >
          <X className="h-3 w-3 text-destructive" />
        </button>
      </div>
    </div>
  );
};
