-- Replace placeholder motivo with the specified reason
UPDATE public.occurrences
SET motivo_impedimento = 'Falta de peças'
WHERE possui_impedimento = true
  AND btrim(motivo_impedimento) = 'Motivo não informado';