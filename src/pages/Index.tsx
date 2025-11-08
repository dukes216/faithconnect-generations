import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Heart, BookOpen, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) {
        // Check if user has completed onboarding
        checkOnboarding(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        checkOnboarding(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboarding = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      navigate("/onboarding");
    } else {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);

      if (!roles || roles.length === 0) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FaithTech Generations</span>
          </div>
          {user && (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Connect. Grow. Inspire.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Building meaningful mentorship relationships within your faith community
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          ) : null}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Find Your Mentor</h3>
            <p className="text-muted-foreground">
              Connect with experienced mentors who share your interests and can guide your journey
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4">
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Community</h3>
            <p className="text-muted-foreground">
              Strengthen your faith community through meaningful one-on-one relationships
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Grow Together</h3>
            <p className="text-muted-foreground">
              Share wisdom, learn from experience, and grow in faith through guided mentorship
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FaithTech Generations. Building community through mentorship.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
