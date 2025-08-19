-- Add dineg field to occurrences table
ALTER TABLE public.occurrences 
ADD COLUMN dineg text;