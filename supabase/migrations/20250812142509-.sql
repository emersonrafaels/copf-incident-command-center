-- Backfill: ensure all impeded rows have a reason
UPDATE public.occurrences
SET motivo_impedimento = 'Motivo não informado'
WHERE possui_impedimento = true
  AND (motivo_impedimento IS NULL OR btrim(motivo_impedimento) = '');

-- Add CHECK constraint to enforce motivo when impediment is true
ALTER TABLE public.occurrences
ADD CONSTRAINT occurrences_motivo_impedimento_required
CHECK (
  NOT possui_impedimento OR (motivo_impedimento IS NOT NULL AND length(btrim(motivo_impedimento)) > 0)
) NOT VALID;

-- Validate the constraint for existing rows
ALTER TABLE public.occurrences
VALIDATE CONSTRAINT occurrences_motivo_impedimento_required;