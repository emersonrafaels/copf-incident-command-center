-- Corrigir fornecedores restantes
UPDATE public.occurrences 
SET fornecedor = 'Nextvision'
WHERE fornecedor = 'Fornecedor H' AND transportadora = 'Prosegur';