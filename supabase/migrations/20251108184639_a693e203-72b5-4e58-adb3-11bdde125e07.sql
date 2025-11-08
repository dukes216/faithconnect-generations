-- Add SELECT policy for churches table so users can view churches
CREATE POLICY "Anyone authenticated can view churches"
ON churches
FOR SELECT
TO authenticated
USING (true);