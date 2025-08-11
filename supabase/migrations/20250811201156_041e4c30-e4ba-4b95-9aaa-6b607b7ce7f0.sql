-- Secure occurrences table: remove public access and allow only authenticated read
-- 1) Drop overly-permissive policy
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON public.occurrences;

-- 2) Allow only authenticated users to read
CREATE POLICY "Authenticated users can read occurrences"
ON public.occurrences
FOR SELECT
TO authenticated
USING (true);

-- Note: With RLS enabled and no other policies, INSERT/UPDATE/DELETE are denied by default.
