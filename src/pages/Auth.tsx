import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { EditableText } from "@/components/EditableText";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Wait a moment for session to fully propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("Logged in successfully");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Account created! You can now log in.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <EditableText
            contentKey="auth_back_button"
            defaultContent="Back to Home"
            className="inline"
            as="span"
            isAdmin={isAdmin}
          />
        </Button>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              <EditableText
                contentKey="auth_login_tab"
                defaultContent="Login"
                className="inline"
                as="span"
                isAdmin={isAdmin}
              />
            </TabsTrigger>
            <TabsTrigger value="signup">
              <EditableText
                contentKey="auth_signup_tab"
                defaultContent="Sign Up"
                className="inline"
                as="span"
                isAdmin={isAdmin}
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>
                  <EditableText
                    contentKey="auth_login_title"
                    defaultContent="Welcome Back"
                    className="inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    contentKey="auth_login_description"
                    defaultContent="Log in to access the admin panel"
                    className="inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">
                      <EditableText
                        contentKey="auth_email_label"
                        defaultContent="Email"
                        className="inline"
                        as="span"
                        isAdmin={isAdmin}
                      />
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="charlie@cooler.dev"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">
                      <EditableText
                        contentKey="auth_password_label"
                        defaultContent="Password"
                        className="inline"
                        as="span"
                        isAdmin={isAdmin}
                      />
                    </Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : <EditableText
                      contentKey="auth_login_button"
                      defaultContent="Log In"
                      className="inline"
                      as="span"
                      isAdmin={isAdmin}
                    />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>
                  <EditableText
                    contentKey="auth_signup_title"
                    defaultContent="Create Account"
                    className="inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    contentKey="auth_signup_description"
                    defaultContent="Sign up to get started"
                    className="inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">
                      <EditableText
                        contentKey="auth_email_label"
                        defaultContent="Email"
                        className="inline"
                        as="span"
                        isAdmin={isAdmin}
                      />
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">
                      <EditableText
                        contentKey="auth_password_label"
                        defaultContent="Password"
                        className="inline"
                        as="span"
                        isAdmin={isAdmin}
                      />
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : <EditableText
                      contentKey="auth_signup_button"
                      defaultContent="Sign Up"
                      className="inline"
                      as="span"
                      isAdmin={isAdmin}
                    />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
