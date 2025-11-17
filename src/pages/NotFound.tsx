import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { EditableText } from "@/components/EditableText";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    checkAdminStatus();
  }, [location.pathname]);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <EditableText
          contentKey="notfound_title"
          defaultContent="404"
          className="mb-4 text-4xl font-bold"
          as="h1"
          isAdmin={isAdmin}
        />
        <EditableText
          contentKey="notfound_message"
          defaultContent="Oops! Page not found"
          className="mb-4 text-xl text-muted-foreground"
          as="p"
          isAdmin={isAdmin}
        />
        <a href="/" className="text-primary underline hover:text-primary/90">
          <EditableText
            contentKey="notfound_link"
            defaultContent="Return to Home"
            className="inline"
            as="span"
            isAdmin={isAdmin}
          />
        </a>
      </div>
    </div>
  );
};

export default NotFound;
