-- Create enum types for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'mentor', 'mentee');
CREATE TYPE public.spiritual_level AS ENUM ('new_believer', 'growing_believer', 'mature_believer');
CREATE TYPE public.meeting_preference AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE public.match_status AS ENUM ('pending', 'accepted', 'active', 'completed', 'declined');

-- Churches table
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  namespace TEXT NOT NULL UNIQUE,
  denomination TEXT,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles table (for all users - mentors and mentees)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email, church_id)
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, church_id, role)
);

-- Mentor profiles table
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  experience_years INTEGER,
  ministry_area TEXT,
  max_mentees INTEGER DEFAULT 3,
  hours_per_week INTEGER,
  cadence_description TEXT,
  meeting_preference public.meeting_preference DEFAULT 'hybrid',
  spiritual_level public.spiritual_level,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mentee profiles table
CREATE TABLE public.mentee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  goals TEXT,
  preferred_mentor_gender TEXT,
  preferred_mentor_age_range TEXT,
  meeting_preference public.meeting_preference DEFAULT 'hybrid',
  spiritual_level public.spiritual_level,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Topics/Interests table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mentor topics junction table
CREATE TABLE public.mentor_topics (
  mentor_profile_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_profile_id, topic_id)
);

-- Mentee topics junction table
CREATE TABLE public.mentee_topics (
  mentee_profile_id UUID REFERENCES public.mentee_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (mentee_profile_id, topic_id)
);

-- Professional attributes table
CREATE TABLE public.professional_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  profession TEXT,
  industry TEXT,
  years_experience INTEGER,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id)
);

-- Life attributes table
CREATE TABLE public.life_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_married BOOLEAN,
  has_children BOOLEAN,
  is_retired BOOLEAN,
  custom_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id)
);

-- Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  mentor_profile_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_profile_id UUID REFERENCES public.mentee_profiles(id) ON DELETE CASCADE NOT NULL,
  status public.match_status DEFAULT 'pending',
  match_score INTEGER,
  match_reasons TEXT[],
  created_by_admin BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentee_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role_in_church(_user_id UUID, _church_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND church_id = _church_id
      AND role = _role
  )
$$;

-- Function to get user's church_id
CREATE OR REPLACE FUNCTION public.get_user_church_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for churches
CREATE POLICY "Users can view their own church"
  ON public.churches FOR SELECT
  USING (id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins can update their church"
  ON public.churches FOR UPDATE
  USING (public.has_role_in_church(auth.uid(), id, 'admin'));

CREATE POLICY "Anyone can insert churches (for registration)"
  ON public.churches FOR INSERT
  WITH CHECK (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their church"
  ON public.profiles FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their church"
  ON public.user_roles FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins can manage roles in their church"
  ON public.user_roles FOR ALL
  USING (public.has_role_in_church(auth.uid(), church_id, 'admin'));

CREATE POLICY "Users can insert their own non-admin roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid() AND role != 'admin');

-- RLS Policies for mentor_profiles
CREATE POLICY "Users can view mentor profiles in their church"
  ON public.mentor_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = mentor_profiles.profile_id
        AND p.church_id = public.get_user_church_id(auth.uid())
    )
  );

CREATE POLICY "Mentors can manage their own profile"
  ON public.mentor_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = mentor_profiles.profile_id
        AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for mentee_profiles
CREATE POLICY "Users can view mentee profiles in their church"
  ON public.mentee_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = mentee_profiles.profile_id
        AND p.church_id = public.get_user_church_id(auth.uid())
    )
  );

CREATE POLICY "Mentees can manage their own profile"
  ON public.mentee_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = mentee_profiles.profile_id
        AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for topics (public read, admin write)
CREATE POLICY "Anyone authenticated can view topics"
  ON public.topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert topics"
  ON public.topics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for mentor_topics
CREATE POLICY "Users can view mentor topics in their church"
  ON public.mentor_topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      JOIN public.profiles p ON p.id = mp.profile_id
      WHERE mp.id = mentor_topics.mentor_profile_id
        AND p.church_id = public.get_user_church_id(auth.uid())
    )
  );

CREATE POLICY "Mentors can manage their own topics"
  ON public.mentor_topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      JOIN public.profiles p ON p.id = mp.profile_id
      WHERE mp.id = mentor_topics.mentor_profile_id
        AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for mentee_topics
CREATE POLICY "Users can view mentee topics in their church"
  ON public.mentee_topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentee_profiles mp
      JOIN public.profiles p ON p.id = mp.profile_id
      WHERE mp.id = mentee_topics.mentee_profile_id
        AND p.church_id = public.get_user_church_id(auth.uid())
    )
  );

CREATE POLICY "Mentees can manage their own topics"
  ON public.mentee_topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentee_profiles mp
      JOIN public.profiles p ON p.id = mp.profile_id
      WHERE mp.id = mentee_topics.mentee_profile_id
        AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for professional_attributes
CREATE POLICY "Users can view professional attributes in their church"
  ON public.professional_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = professional_attributes.profile_id
        AND p.church_id = public.get_user_church_id(auth.uid())
    )
  );

CREATE POLICY "Users can manage their own professional attributes"
  ON public.professional_attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = professional_attributes.profile_id
        AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for life_attributes
CREATE POLICY "Users can view life attributes in their church"
  ON public.life_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = life_attributes.profile_id
        AND p.church_id = public.get_user_church_id(auth.uid())
    )
  );

CREATE POLICY "Users can manage their own life attributes"
  ON public.life_attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = life_attributes.profile_id
        AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for matches
CREATE POLICY "Users can view matches in their church"
  ON public.matches FOR SELECT
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Admins can manage matches in their church"
  ON public.matches FOR ALL
  USING (public.has_role_in_church(auth.uid(), church_id, 'admin'));

CREATE POLICY "Mentees can create match requests"
  ON public.matches FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id(auth.uid())
    AND created_by_admin = false
  );

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentee_profiles_updated_at
  BEFORE UPDATE ON public.mentee_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default topics
INSERT INTO public.topics (name, category) VALUES
  -- Spiritual topics
  ('Faith Growth', 'spiritual'),
  ('New Believer Support', 'spiritual'),
  ('Prayer Life', 'spiritual'),
  ('Bible Study', 'spiritual'),
  ('Spiritual Disciplines', 'spiritual'),
  ('Ministry Leadership', 'spiritual'),
  ('Worship & Music', 'spiritual'),
  
  -- Professional topics
  ('Career Development', 'professional'),
  ('Business Leadership', 'professional'),
  ('Entrepreneurship', 'professional'),
  ('Technology & IT', 'professional'),
  ('Healthcare', 'professional'),
  ('Education & Teaching', 'professional'),
  ('Finance & Accounting', 'professional'),
  ('Marketing & Sales', 'professional'),
  
  -- Life topics
  ('Marriage & Relationships', 'life'),
  ('Parenting', 'life'),
  ('Youth Guidance', 'life'),
  ('Young Adults', 'life'),
  ('Seniors & Retirement', 'life'),
  ('Mental Health', 'life'),
  ('Grief & Loss', 'life'),
  ('Life Transitions', 'life');