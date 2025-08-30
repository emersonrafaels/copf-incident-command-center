-- Allow codigo_ocorrencia to be nullable during insert, trigger will set it
ALTER TABLE public.occurrences 
ALTER COLUMN codigo_ocorrencia DROP NOT NULL;

-- Set a temporary default to handle the constraint, trigger will override
ALTER TABLE public.occurrences 
ALTER COLUMN codigo_ocorrencia SET DEFAULT '';

-- Update the trigger to handle both insert and update cases
CREATE OR REPLACE FUNCTION generate_copf_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_ocorrencia IS NULL OR NEW.codigo_ocorrencia = '' THEN
    NEW.codigo_ocorrencia := 'COPF' || LPAD(nextval('copf_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';

-- Now make it NOT NULL again but with the default and trigger in place
ALTER TABLE public.occurrences 
ALTER COLUMN codigo_ocorrencia SET NOT NULL;