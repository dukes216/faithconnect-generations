import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCircle } from "lucide-react";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      setHasProfile(true);
      // Check if they have a role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id);

      if (roles && roles.length > 0) {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  const handleRoleSelection = (role: "mentor" | "mentee") => {
    navigate(`/profile-setup?role=${role}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to FaithTech Generations</h1>
          <p className="text-muted-foreground">How would you like to participate?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelection("mentor")}>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>I want to be a Mentor</CardTitle>
              <CardDescription>Share your experience and guide others in their faith journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Share your wisdom and experience</li>
                <li>• Help others grow in their faith</li>
                <li>• Make a lasting impact</li>
                <li>• Flexible commitment options</li>
              </ul>
              <Button className="w-full" onClick={() => handleRoleSelection("mentor")}>
                Become a Mentor
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelection("mentee")}>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4 mx-auto">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>I want to be a Mentee</CardTitle>
              <CardDescription>Connect with experienced mentors to support your growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Get personalized guidance</li>
                <li>• Grow in your faith journey</li>
                <li>• Learn from experience</li>
                <li>• Build meaningful connections</li>
              </ul>
              <Button className="w-full" variant="secondary" onClick={() => handleRoleSelection("mentee")}>
                Find a Mentor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
