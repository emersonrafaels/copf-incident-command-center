-- Corrigir a relação entre transportadoras e fornecedores
-- Cada transportadora deve ter apenas seus fornecedores específicos

-- Primeiro, definir os mapeamentos corretos
UPDATE occurrences 
SET transportadora = CASE 
  WHEN fornecedor = 'Diebold' THEN 
    CASE 
      WHEN random() < 0.5 THEN 'Brinks'
      ELSE 'Protege'
    END
  WHEN fornecedor = 'NCR' THEN 
    CASE 
      WHEN random() < 0.3 THEN 'Brinks'
      ELSE 'Protege'
    END
  WHEN fornecedor = 'STM' THEN 
    CASE 
      WHEN random() < 0.4 THEN 'Brinks'
      ELSE 'Protege'
    END
  WHEN fornecedor = 'Lexmark' THEN 'Prosegur'
  WHEN fornecedor = 'Nextvision' THEN 'Prosegur'
  WHEN fornecedor = 'Artis' THEN 'TBFort'
  WHEN fornecedor = 'Azmachi' THEN 'TBFort'
  WHEN fornecedor = 'Atos' THEN 'Prosegur'
  WHEN fornecedor = 'IBM' THEN 'Protege'
  WHEN fornecedor = 'Stefanini' THEN 'TBFort'
  WHEN fornecedor = 'TecBan' THEN 'Brinks'
  WHEN fornecedor = 'Brinks' THEN 'Brinks'
  WHEN fornecedor = 'Prosegur' THEN 'Prosegur'
  ELSE 'Protege'
END
WHERE transportadora IS NULL OR transportadora = '';

-- Garantir que não existam registros sem transportadora
UPDATE occurrences 
SET transportadora = 'Protege'
WHERE transportadora IS NULL OR transportadora = '';

-- Verificar se ainda existem valores nulos
UPDATE occurrences 
SET transportadora = COALESCE(transportadora, 'Protege');

-- Adicionar uma constraint para garantir que transportadora nunca seja nula
ALTER TABLE occurrences 
ALTER COLUMN transportadora SET NOT NULL;