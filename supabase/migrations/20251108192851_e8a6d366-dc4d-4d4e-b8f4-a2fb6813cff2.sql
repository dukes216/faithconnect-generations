-- Drop the existing INSERT policy for churches
DROP POLICY IF EXISTS "Anyone can insert churches (for registration)" ON public.churches;

-- Create a new permissive INSERT policy that allows anyone (even unauthenticated) to insert churches
CREATE POLICY "Allow church registration" 
ON public.churches 
FOR INSERT 
TO public
WITH CHECK (true);