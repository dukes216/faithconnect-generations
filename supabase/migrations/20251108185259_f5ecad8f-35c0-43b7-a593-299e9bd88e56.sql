-- Add SELECT policy for profiles so users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());