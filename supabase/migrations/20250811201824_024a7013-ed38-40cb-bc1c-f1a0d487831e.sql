-- Allow public read-only access for occurrences (keep writes blocked)
DROP POLICY IF EXISTS "Public read-only access to occurrences" ON public.occurrences;

CREATE POLICY "Public read-only access to occurrences"
ON public.occurrences
FOR SELECT
TO anon
USING (true);
