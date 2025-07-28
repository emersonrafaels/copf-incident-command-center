-- Atualizar transportadoras e fornecedores existentes
-- Mapear Express Logística -> Protege
UPDATE public.occurrences 
SET 
  transportadora = 'Protege',
  fornecedor = CASE 
    WHEN fornecedor = 'Fornecedor A' THEN 'STM'
    WHEN fornecedor = 'Fornecedor B' THEN 'NCR'
    WHEN fornecedor = 'Fornecedor C' THEN 'Diebold'
    ELSE fornecedor
  END
WHERE transportadora = 'Express Logística';

-- Mapear TechTransporte -> TBFort
UPDATE public.occurrences 
SET 
  transportadora = 'TBFort',
  fornecedor = CASE 
    WHEN fornecedor = 'Fornecedor D' THEN 'Artis'
    WHEN fornecedor = 'Fornecedor E' THEN 'Azmachi'
    ELSE fornecedor
  END
WHERE transportadora = 'TechTransporte';

-- Mapear LogiCorp -> Prosegur e Brinks (dividir meio a meio)
UPDATE public.occurrences 
SET 
  transportadora = 'Prosegur',
  fornecedor = CASE 
    WHEN fornecedor = 'Fornecedor F' THEN 'Lexmark'
    WHEN fornecedor = 'Fornecedor G' THEN 'Nextvision'
    ELSE fornecedor
  END
WHERE transportadora = 'LogiCorp' 
AND id IN (
  SELECT id FROM public.occurrences 
  WHERE transportadora = 'LogiCorp' 
  LIMIT (SELECT COUNT(*)/2 FROM public.occurrences WHERE transportadora = 'LogiCorp')
);

-- Mapear restante do LogiCorp -> Brinks
UPDATE public.occurrences 
SET 
  transportadora = 'Brinks',
  fornecedor = CASE 
    WHEN fornecedor = 'Fornecedor H' THEN 'STM'
    WHEN fornecedor = 'Fornecedor G' THEN 'Diebold'
    WHEN fornecedor = 'Fornecedor F' THEN 'NCR'
    ELSE fornecedor
  END
WHERE transportadora = 'LogiCorp';

-- Atualizar equipamentos para os novos padrões por segmento
-- Segmento AA (atm, pos) -> equipamentos AA
UPDATE public.occurrences 
SET equipamento = CASE 
  WHEN random() < 0.4 THEN 'ATM Saque'
  WHEN random() < 0.7 THEN 'ATM Depósito'
  ELSE 'Cassete'
END
WHERE segmento IN ('atm', 'pos');

-- Segmento AB (rede, datacenter) -> equipamentos AB
UPDATE public.occurrences 
SET equipamento = CASE 
  WHEN random() < 0.15 THEN 'Notebook'
  WHEN random() < 0.25 THEN 'Desktop'
  WHEN random() < 0.35 THEN 'Leitor biométrico'
  WHEN random() < 0.45 THEN 'Impressora'
  WHEN random() < 0.55 THEN 'Monitor LCD/LED'
  WHEN random() < 0.65 THEN 'Servidor'
  WHEN random() < 0.7 THEN 'Scanner de Cheque'
  WHEN random() < 0.75 THEN 'PIN PAD'
  WHEN random() < 0.8 THEN 'Teclado'
  WHEN random() < 0.85 THEN 'Impressora térmica'
  WHEN random() < 0.9 THEN 'TCR'
  WHEN random() < 0.95 THEN 'Televisão'
  ELSE 'Fragmentadora de Papel'
END
WHERE segmento IN ('rede', 'datacenter');