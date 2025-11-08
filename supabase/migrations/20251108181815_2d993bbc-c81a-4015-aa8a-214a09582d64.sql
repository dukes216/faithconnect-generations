-- Fix search_path for security definer functions with CASCADE
DROP FUNCTION IF EXISTS public.has_role_in_church(_user_id UUID, _church_id UUID, _role public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_church_id(_user_id UUID) CASCADE;

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.has_role_in_church(_user_id UUID, _church_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND church_id = _church_id
      AND role = _role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_church_id(_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_church_id UUID;
BEGIN
  SELECT church_id INTO v_church_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1;
  
  RETURN v_church_id;
END;
$$;

-- Recreate the dropped policies
CREATE POLICY "Admins can update their church"
  ON public.churches FOR UPDATE
  USING (public.has_role_in_church(auth.uid(), id, 'admin'));

CREATE POLICY "Admins can manage roles in their church"
  ON public.user_roles FOR ALL
  USING (public.has_role_in_church(auth.uid(), church_id, 'admin'));

CREATE POLICY "Admins can manage matches in their church"
  ON public.matches FOR ALL
  USING (public.has_role_in_church(auth.uid(), church_id, 'admin'));