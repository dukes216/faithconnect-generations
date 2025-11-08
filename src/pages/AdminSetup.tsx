import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";

const AdminSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    churchName: "",
    namespace: "",
    denomination: "",
    location: "",
    contactEmail: "",
    contactPhone: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create church admin account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create admin account");

      // Create church
      const { data: church, error: churchError } = await supabase
        .from("churches")
        .insert({
          name: formData.churchName,
          namespace: formData.namespace.toLowerCase().replace(/\s+/g, "-"),
          denomination: formData.denomination || null,
          location: formData.location || null,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
        })
        .select()
        .single();

      if (churchError) throw churchError;

      // Create admin profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          church_id: church.id,
          email: formData.adminEmail,
          first_name: formData.adminFirstName,
          last_name: formData.adminLastName,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          church_id: church.id,
          role: "admin",
        });

      if (roleError) throw roleError;

      toast.success("Church and admin account created! Please check your email to verify your account.");
      navigate("/auth");
    } catch (error: any) {
      console.error("Admin setup error:", error);
      toast.error(error.message || "Failed to create church and admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Church Registration</h1>
          <p className="text-muted-foreground">Set up your church on FaithTech Generations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Church Information</CardTitle>
              <CardDescription>Details about your church</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="churchName">Church Name *</Label>
                <Input
                  id="churchName"
                  value={formData.churchName}
                  onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace (URL-friendly) *</Label>
                <Input
                  id="namespace"
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                  placeholder="e.g., first-baptist-church"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be used in URLs and must be unique
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="denomination">Denomination</Label>
                  <Input
                    id="denomination"
                    value={formData.denomination}
                    onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>Your administrator login credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">First Name *</Label>
                  <Input
                    id="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Last Name *</Label>
                  <Input
                    id="adminLastName"
                    value={formData.adminLastName}
                    onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Church & Admin Account
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={() => navigate("/auth")}>
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSetup;
