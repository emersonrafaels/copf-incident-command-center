-- Add a new column for the COPF ID pattern
ALTER TABLE public.occurrences 
ADD COLUMN codigo_ocorrencia TEXT UNIQUE;

-- Create a sequence for generating incremental numbers
CREATE SEQUENCE copf_sequence START 100001;

-- Update all existing records to have the COPF pattern
UPDATE public.occurrences 
SET codigo_ocorrencia = 'COPF' || LPAD(nextval('copf_sequence')::text, 6, '0')
WHERE codigo_ocorrencia IS NULL;

-- Create a function to generate COPF IDs
CREATE OR REPLACE FUNCTION generate_copf_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_ocorrencia IS NULL THEN
    NEW.codigo_ocorrencia := 'COPF' || LPAD(nextval('copf_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate COPF ID for new records
CREATE TRIGGER trigger_generate_copf_id
  BEFORE INSERT ON public.occurrences
  FOR EACH ROW
  EXECUTE FUNCTION generate_copf_id();

-- Make codigo_ocorrencia required for future inserts
ALTER TABLE public.occurrences 
ALTER COLUMN codigo_ocorrencia SET NOT NULL;