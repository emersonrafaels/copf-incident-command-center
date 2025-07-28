-- Adicionar coluna para transportadora nas ocorrências
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

-- Adicionar mais agências convencionais
UPDATE public.occurrences 
SET tipo_agencia = 'convencional'
WHERE id IN (
  SELECT id FROM public.occurrences 
  WHERE tipo_agencia = 'prime' 
  LIMIT 100
);

-- Criar alguns registros de exemplo para demonstrar a funcionalidade
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, 
  severidade, fornecedor, segmento, uf, tipo_agencia, transportadora, 
  vip, supt, override, prioridade_fornecedor, reincidencia
) VALUES 
-- Agências terceirizadas com Express Logística
('AGENCIA_9001', 'ATM NCR', 'SN_TERC001', 'Manutenção preventiva terceirizada', 'pendente', 'alta', 'critica', 'Fornecedor A', 'atm', 'SP', 'terceirizada', 'Express Logística', false, 'SUPT_01', false, 'P1', false),
('AGENCIA_9002', 'Terminal POS', 'SN_TERC002', 'Substituição de componente', 'em_andamento', 'media', 'alta', 'Fornecedor B', 'atm', 'RJ', 'terceirizada', 'Express Logística', false, 'SUPT_02', false, 'P2', false),
('AGENCIA_9003', 'Switch Cisco', 'SN_TERC003', 'Configuração de rede', 'pendente', 'baixa', 'media', 'Fornecedor C', 'atm', 'MG', 'terceirizada', 'Express Logística', false, 'SUPT_03', false, 'P3', false),

-- Agências terceirizadas com TechTransporte
('AGENCIA_9004', 'Impressora Epson', 'SN_TERC004', 'Troca de toner', 'pendente', 'media', 'baixa', 'Fornecedor D', 'atm', 'RS', 'terceirizada', 'TechTransporte', false, 'SUPT_04', false, 'P2', false),
('AGENCIA_9005', 'Scanner Canon', 'SN_TERC005', 'Calibração do scanner', 'resolvida', 'alta', 'media', 'Fornecedor E', 'atm', 'PR', 'terceirizada', 'TechTransporte', false, 'SUPT_05', false, 'P1', false),

-- Agências terceirizadas com LogiCorp
('AGENCIA_9006', 'UPS APC', 'SN_TERC006', 'Teste de bateria', 'em_andamento', 'critica', 'critica', 'Fornecedor F', 'atm', 'BA', 'terceirizada', 'LogiCorp', true, 'SUPT_06', false, 'P1', false),
('AGENCIA_9007', 'Servidor Dell', 'SN_TERC007', 'Atualização de sistema', 'pendente', 'alta', 'alta', 'Fornecedor G', 'atm', 'PE', 'terceirizada', 'LogiCorp', false, 'SUPT_07', false, 'P1', true),
('AGENCIA_9008', 'ATM Diebold', 'SN_TERC008', 'Manutenção corretiva', 'com_impedimentos', 'media', 'media', 'Fornecedor H', 'atm', 'SC', 'terceirizada', 'LogiCorp', false, 'SUPT_08', false, 'P2', false),

-- Agências convencionais
('AGENCIA_8001', 'Terminal POS Verifone', 'SN_CONV001', 'Manutenção interna', 'pendente', 'baixa', 'baixa', 'TecBan', 'atm', 'SP', 'convencional', NULL, false, 'SUPT_01', false, 'P3', false),
('AGENCIA_8002', 'Leitor Biometrico', 'SN_CONV002', 'Configuração interna', 'em_andamento', 'media', 'media', 'NCR', 'atm', 'RJ', 'convencional', NULL, false, 'SUPT_02', false, 'P2', false),
('AGENCIA_8003', 'Camera Hikvision', 'SN_CONV003', 'Ajuste de foco', 'resolvida', 'alta', 'baixa', 'Diebold', 'atm', 'MG', 'convencional', NULL, false, 'SUPT_03', false, 'P1', false);