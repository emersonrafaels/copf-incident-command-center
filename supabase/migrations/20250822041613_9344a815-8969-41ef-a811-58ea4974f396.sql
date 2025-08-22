-- Add RLS policy to allow inserting new occurrences
CREATE POLICY "Users can insert occurrences" 
ON public.occurrences 
FOR INSERT 
WITH CHECK (true);

-- Add RLS policy to allow updating occurrences
CREATE POLICY "Users can update occurrences" 
ON public.occurrences 
FOR UPDATE 
USING (true);