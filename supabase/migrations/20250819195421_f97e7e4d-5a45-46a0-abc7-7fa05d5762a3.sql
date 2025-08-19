-- Update existing records with DINEG data and ensure SUPT is populated
UPDATE public.occurrences 
SET dineg = (ARRAY['DINEG-01', 'DINEG-02', 'DINEG-03', 'DINEG-04', 'DINEG-05'])[ceil(random() * 5)]
WHERE dineg IS NULL;

-- Also update SUPT for any records that might be missing it
UPDATE public.occurrences 
SET supt = (ARRAY['SUPT-01', 'SUPT-02', 'SUPT-03', 'SUPT-04', 'SUPT-05'])[ceil(random() * 5)]
WHERE supt IS NULL;