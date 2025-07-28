-- Atualizar alguns registros de agências terceirizadas para segmento AA (pos)
UPDATE public.occurrences 
SET segmento = 'pos'
WHERE tipo_agencia = 'terceirizada' 
AND transportadora = 'Express Logística'
AND id IN (
  SELECT id FROM public.occurrences 
  WHERE tipo_agencia = 'terceirizada' 
  AND transportadora = 'Express Logística'
  LIMIT 8
);

-- Atualizar alguns registros de agências terceirizadas para segmento AB (rede)
UPDATE public.occurrences 
SET segmento = 'rede'
WHERE tipo_agencia = 'terceirizada' 
AND transportadora = 'TechTransporte'
AND id IN (
  SELECT id FROM public.occurrences 
  WHERE tipo_agencia = 'terceirizada' 
  AND transportadora = 'TechTransporte'
  LIMIT 10
);

-- Criar registros específicos para garantir dados em todas as combinações
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, 
  severidade, fornecedor, segmento, uf, tipo_agencia, transportadora, 
  vip, supt, override, prioridade_fornecedor, reincidencia
) VALUES 
-- Express Logística + Fornecedor A + Segmento AA (pos)
('AGENCIA_T001', 'Terminal POS Ingenico', 'SN_AA_001', 'Config POS terceirizada', 'pendente', 'alta', 'critica', 'Fornecedor A', 'pos', 'SP', 'terceirizada', 'Express Logística', false, 'SUPT_01', false, 'P1', false),
('AGENCIA_T002', 'Terminal POS Verifone', 'SN_AA_002', 'Manutenção POS', 'em_andamento', 'media', 'alta', 'Fornecedor A', 'pos', 'RJ', 'terceirizada', 'Express Logística', false, 'SUPT_02', false, 'P2', false),

-- Express Logística + Fornecedor B + Segmento AB (rede)
('AGENCIA_T003', 'Switch Cisco', 'SN_AB_001', 'Config rede terceirizada', 'pendente', 'alta', 'media', 'Fornecedor B', 'rede', 'MG', 'terceirizada', 'Express Logística', false, 'SUPT_03', false, 'P1', false),
('AGENCIA_T004', 'Router TP-Link', 'SN_AB_002', 'Instalação router', 'resolvida', 'media', 'baixa', 'Fornecedor B', 'rede', 'RS', 'terceirizada', 'Express Logística', false, 'SUPT_04', false, 'P2', false),

-- TechTransporte + Fornecedor D + Segmento AA (pos)
('AGENCIA_T005', 'Terminal POS', 'SN_AA_003', 'Atualização firmware POS', 'pendente', 'critica', 'critica', 'Fornecedor D', 'pos', 'PR', 'terceirizada', 'TechTransporte', true, 'SUPT_05', false, 'P1', false),
('AGENCIA_T006', 'Terminal POS Ingenico', 'SN_AA_004', 'Substituição POS', 'em_andamento', 'alta', 'alta', 'Fornecedor D', 'pos', 'BA', 'terceirizada', 'TechTransporte', false, 'SUPT_06', false, 'P1', true),

-- TechTransporte + Fornecedor E + Segmento AB (datacenter)
('AGENCIA_T007', 'Servidor Dell', 'SN_AB_003', 'Manutenção servidor DC', 'pendente', 'alta', 'critica', 'Fornecedor E', 'datacenter', 'PE', 'terceirizada', 'TechTransporte', false, 'SUPT_07', false, 'P1', false),
('AGENCIA_T008', 'Router TP-Link', 'SN_AB_004', 'Config datacenter', 'com_impedimentos', 'media', 'media', 'Fornecedor E', 'datacenter', 'SC', 'terceirizada', 'TechTransporte', false, 'SUPT_08', false, 'P2', false),

-- LogiCorp + Fornecedor F + Segmento AA (pos)
('AGENCIA_T009', 'Terminal POS Verifone', 'SN_AA_005', 'Instalação POS Logi', 'pendente', 'media', 'baixa', 'Fornecedor F', 'pos', 'GO', 'terceirizada', 'LogiCorp', false, 'SUPT_09', false, 'P3', false),
('AGENCIA_T010', 'Terminal POS', 'SN_AA_006', 'Manutenção POS Logi', 'resolvida', 'baixa', 'media', 'Fornecedor F', 'pos', 'MT', 'terceirizada', 'LogiCorp', false, 'SUPT_10', false, 'P2', false),

-- LogiCorp + Fornecedor G + Segmento AB (rede)
('AGENCIA_T011', 'Switch Cisco', 'SN_AB_005', 'Config switch Logi', 'em_andamento', 'alta', 'alta', 'Fornecedor G', 'rede', 'MS', 'terceirizada', 'LogiCorp', false, 'SUPT_11', false, 'P1', false),
('AGENCIA_T012', 'Router TP-Link', 'SN_AB_006', 'Instalação rede Logi', 'pendente', 'critica', 'critica', 'Fornecedor G', 'rede', 'AM', 'terceirizada', 'LogiCorp', true, 'SUPT_12', false, 'P1', false),

-- LogiCorp + Fornecedor H + Segmento AB (datacenter)
('AGENCIA_T013', 'Servidor Dell', 'SN_AB_007', 'Backup datacenter', 'pendente', 'alta', 'media', 'Fornecedor H', 'datacenter', 'PA', 'terceirizada', 'LogiCorp', false, 'SUPT_13', false, 'P2', false),
('AGENCIA_T014', 'UPS APC', 'SN_AB_008', 'Teste UPS datacenter', 'em_andamento', 'media', 'baixa', 'Fornecedor H', 'datacenter', 'CE', 'terceirizada', 'LogiCorp', false, 'SUPT_14', false, 'P3', false);

-- Inserir mais registros para Express Logística + Fornecedor C em diferentes segmentos
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, 
  severidade, fornecedor, segmento, uf, tipo_agencia, transportadora, 
  vip, supt, override, prioridade_fornecedor, reincidencia
) VALUES 
('AGENCIA_T015', 'Terminal POS Verifone', 'SN_AA_007', 'Config Express C', 'pendente', 'alta', 'media', 'Fornecedor C', 'pos', 'AL', 'terceirizada', 'Express Logística', false, 'SUPT_15', false, 'P1', false),
('AGENCIA_T016', 'Switch Cisco', 'SN_AB_009', 'Rede Express C', 'resolvida', 'media', 'baixa', 'Fornecedor C', 'rede', 'SE', 'terceirizada', 'Express Logística', false, 'SUPT_01', false, 'P2', false),
('AGENCIA_T017', 'Servidor Dell', 'SN_AB_010', 'DC Express C', 'em_andamento', 'critica', 'alta', 'Fornecedor C', 'datacenter', 'RN', 'terceirizada', 'Express Logística', false, 'SUPT_02', false, 'P1', false);