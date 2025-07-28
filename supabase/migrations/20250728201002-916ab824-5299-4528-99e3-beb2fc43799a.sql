-- Remover a restrição antiga de tipo_agencia
ALTER TABLE public.occurrences DROP CONSTRAINT occurrences_tipo_agencia_check;

-- Adicionar nova restrição incluindo 'convencional' e 'terceirizada'
ALTER TABLE public.occurrences ADD CONSTRAINT occurrences_tipo_agencia_check 
CHECK (tipo_agencia = ANY (ARRAY['tradicional'::text, 'digital'::text, 'prime'::text, 'convencional'::text, 'terceirizada'::text]));

-- Adicionar coluna para transportadora se não existir
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS transportadora TEXT;

-- Atualizar alguns registros para serem do tipo 'convencional'
UPDATE public.occurrences 
SET tipo_agencia = 'convencional' 
WHERE id IN (
  SELECT id FROM public.occurrences 
  WHERE tipo_agencia = 'tradicional' 
  LIMIT 200
);

-- Atualizar alguns registros para serem do tipo 'terceirizada' com transportadoras
UPDATE public.occurrences 
SET 
  tipo_agencia = 'terceirizada',
  transportadora = CASE 
    WHEN random() < 0.33 THEN 'Express Logística'
    WHEN random() < 0.66 THEN 'TechTransporte'
    ELSE 'LogiCorp'
  END
WHERE id IN (
  SELECT id FROM public.occurrences 
  WHERE tipo_agencia = 'digital' 
  LIMIT 150
);

-- Atualizar fornecedores para agências terceirizadas baseado na transportadora
UPDATE public.occurrences 
SET fornecedor = CASE 
  WHEN transportadora = 'Express Logística' THEN 
    CASE 
      WHEN random() < 0.33 THEN 'Fornecedor A'
      WHEN random() < 0.66 THEN 'Fornecedor B'
      ELSE 'Fornecedor C'
    END
  WHEN transportadora = 'TechTransporte' THEN 
    CASE 
      WHEN random() < 0.5 THEN 'Fornecedor D'
      ELSE 'Fornecedor E'
    END
  WHEN transportadora = 'LogiCorp' THEN 
    CASE 
      WHEN random() < 0.33 THEN 'Fornecedor F'
      WHEN random() < 0.66 THEN 'Fornecedor G'
      ELSE 'Fornecedor H'
    END
  ELSE fornecedor
END
WHERE tipo_agencia = 'terceirizada' AND transportadora IS NOT NULL;