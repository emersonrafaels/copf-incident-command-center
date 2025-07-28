-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.occurrences;

-- Create a new policy that allows anonymous access
-- This is appropriate for internal management systems
CREATE POLICY "Allow all operations for anonymous users" 
ON public.occurrences 
FOR ALL 
TO anon, authenticated
USING (true) 
WITH CHECK (true);