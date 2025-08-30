-- Fix the security issue by setting the search_path for the function
CREATE OR REPLACE FUNCTION generate_copf_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_ocorrencia IS NULL THEN
    NEW.codigo_ocorrencia := 'COPF' || LPAD(nextval('copf_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';