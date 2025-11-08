import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") as "mentor" | "mentee";
  
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    churchId: "",
    bio: "",
    // Mentor specific
    experienceYears: "",
    ministryArea: "",
    maxMentees: "3",
    hoursPerWeek: "",
    cadence: "",
    meetingPreference: "hybrid",
    spiritualLevel: "",
    // Mentee specific
    goals: "",
    preferredMentorGender: "",
    preferredMentorAgeRange: "",
    // Professional
    profession: "",
    industry: "",
    yearsExperience: "",
    skills: "",
    // Life
    isMarried: false,
    hasChildren: false,
    isRetired: false,
    customNotes: "",
  });

  useEffect(() => {
    if (!role || (role !== "mentor" && role !== "mentee")) {
      navigate("/onboarding");
      return;
    }
    loadData();
  }, [role, navigate]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load churches
    const { data: churchData } = await supabase
      .from("churches")
      .select("*")
      .order("name");
    
    if (churchData) setChurches(churchData);

    // Load topics
    const { data: topicData } = await supabase
      .from("topics")
      .select("*")
      .order("category, name");
    
    if (topicData) setTopics(topicData);

    // Pre-fill email
    setFormData(prev => ({ ...prev, email: user.email || "" }));
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          church_id: formData.churchId,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          bio: formData.bio,
          phone: formData.phone,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          church_id: formData.churchId,
          role: role,
        });

      if (roleError) throw roleError;

      // Create professional attributes if filled
      if (formData.profession || formData.industry) {
        const skillsArray = formData.skills ? formData.skills.split(",").map(s => s.trim()) : [];
        await supabase.from("professional_attributes").insert({
          profile_id: profile.id,
          profession: formData.profession || null,
          industry: formData.industry || null,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          skills: skillsArray.length > 0 ? skillsArray : null,
        });
      }

      // Create life attributes
      await supabase.from("life_attributes").insert({
        profile_id: profile.id,
        is_married: formData.isMarried,
        has_children: formData.hasChildren,
        is_retired: formData.isRetired,
        custom_notes: formData.customNotes || null,
      });

      if (role === "mentor") {
        // Create mentor profile
        const { data: mentorProfile, error: mentorError } = await supabase
          .from("mentor_profiles")
          .insert({
            profile_id: profile.id,
            experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
            ministry_area: formData.ministryArea || null,
            max_mentees: parseInt(formData.maxMentees),
            hours_per_week: formData.hoursPerWeek ? parseInt(formData.hoursPerWeek) : null,
            cadence_description: formData.cadence || null,
            meeting_preference: formData.meetingPreference as any,
            spiritual_level: formData.spiritualLevel as any || null,
          })
          .select()
          .single();

        if (mentorError) throw mentorError;

        // Add topics
        if (selectedTopics.length > 0) {
          const topicInserts = selectedTopics.map(topicId => ({
            mentor_profile_id: mentorProfile.id,
            topic_id: topicId,
          }));
          await supabase.from("mentor_topics").insert(topicInserts);
        }
      } else {
        // Create mentee profile
        const { data: menteeProfile, error: menteeError } = await supabase
          .from("mentee_profiles")
          .insert({
            profile_id: profile.id,
            goals: formData.goals || null,
            preferred_mentor_gender: formData.preferredMentorGender || null,
            preferred_mentor_age_range: formData.preferredMentorAgeRange || null,
            meeting_preference: formData.meetingPreference as any,
            spiritual_level: formData.spiritualLevel as any || null,
          })
          .select()
          .single();

        if (menteeError) throw menteeError;

        // Add topics
        if (selectedTopics.length > 0) {
          const topicInserts = selectedTopics.map(topicId => ({
            mentee_profile_id: menteeProfile.id,
            topic_id: topicId,
          }));
          await supabase.from("mentee_topics").insert(topicInserts);
        }
      }

      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Profile setup error:", error);
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const topicsByCategory = topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {role === "mentor" ? "Mentor Profile Setup" : "Mentee Profile Setup"}
          </h1>
          <p className="text-muted-foreground">Tell us about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="church">Church *</Label>
                <Select value={formData.churchId} onValueChange={(value) => setFormData({ ...formData, churchId: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your church" />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spiritual Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spiritualLevel">Spiritual Level</Label>
                <Select value={formData.spiritualLevel} onValueChange={(value) => setFormData({ ...formData, spiritualLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your spiritual level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_believer">New Believer</SelectItem>
                    <SelectItem value="growing_believer">Growing Believer</SelectItem>
                    <SelectItem value="mature_believer">Mature Believer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "mentor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ministryArea">Ministry Area</Label>
                    <Input
                      id="ministryArea"
                      value={formData.ministryArea}
                      onChange={(e) => setFormData({ ...formData, ministryArea: e.target.value })}
                      placeholder="e.g., Youth Ministry, Worship"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    />
                  </div>
                </>
              )}

              {role === "mentee" && (
                <div className="space-y-2">
                  <Label htmlFor="goals">Goals</Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="What do you hope to achieve through mentorship?"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topics of Interest</CardTitle>
              <CardDescription>Select 3-5 topics you're interested in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(topicsByCategory).map(([category, categoryTopics]) => (
                <div key={category}>
                  <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(categoryTopics as any[]).map((topic) => (
                      <div key={topic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic.id}
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={() => handleTopicToggle(topic.id)}
                        />
                        <label htmlFor={topic.id} className="text-sm cursor-pointer">
                          {topic.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {role === "mentor" && (
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxMentees">Max Mentees at a Time</Label>
                    <Input
                      id="maxMentees"
                      type="number"
                      value={formData.maxMentees}
                      onChange={(e) => setFormData({ ...formData, maxMentees: e.target.value })}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                    <Input
                      id="hoursPerWeek"
                      type="number"
                      value={formData.hoursPerWeek}
                      onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadence">Cadence Description</Label>
                  <Input
                    id="cadence"
                    value={formData.cadence}
                    onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
                    placeholder="e.g., 4 hours every 2 weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingPreference">Meeting Preference</Label>
                  <Select value={formData.meetingPreference} onValueChange={(value) => setFormData({ ...formData, meetingPreference: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {role === "mentee" && (
            <Card>
              <CardHeader>
                <CardTitle>Mentor Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredMentorGender">Preferred Mentor Gender</Label>
                  <Input
                    id="preferredMentorGender"
                    value={formData.preferredMentorGender}
                    onChange={(e) => setFormData({ ...formData, preferredMentorGender: e.target.value })}
                    placeholder="e.g., Male, Female, No preference"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredMentorAgeRange">Preferred Age Range</Label>
                  <Input
                    id="preferredMentorAgeRange"
                    value={formData.preferredMentorAgeRange}
                    onChange={(e) => setFormData({ ...formData, preferredMentorAgeRange: e.target.value })}
                    placeholder="e.g., 30-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingPreference">Meeting Preference</Label>
                  <Select value={formData.meetingPreference} onValueChange={(value) => setFormData({ ...formData, meetingPreference: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Professional Background</CardTitle>
              <CardDescription>Optional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Leadership, Communication, Project Management"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Life Stage</CardTitle>
              <CardDescription>Optional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMarried"
                  checked={formData.isMarried}
                  onCheckedChange={(checked) => setFormData({ ...formData, isMarried: checked as boolean })}
                />
                <label htmlFor="isMarried" className="text-sm cursor-pointer">Married</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasChildren"
                  checked={formData.hasChildren}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasChildren: checked as boolean })}
                />
                <label htmlFor="hasChildren" className="text-sm cursor-pointer">Has Children</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRetired"
                  checked={formData.isRetired}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRetired: checked as boolean })}
                />
                <label htmlFor="isRetired" className="text-sm cursor-pointer">Retired</label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customNotes">Additional Notes</Label>
                <Textarea
                  id="customNotes"
                  value={formData.customNotes}
                  onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile Setup
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
