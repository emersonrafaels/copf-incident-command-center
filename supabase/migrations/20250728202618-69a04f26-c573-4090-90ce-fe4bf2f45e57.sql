-- Criar registros específicos para demonstrar todas as novas combinações
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, 
  severidade, fornecedor, segmento, uf, tipo_agencia, transportadora, 
  vip, supt, override, prioridade_fornecedor, reincidencia
) VALUES 
-- Protege + STM (Segmento AA)
('AGENCIA_P001', 'ATM Saque', 'SN_P_STM_001', 'Manutenção ATM Protege-STM', 'pendente', 'alta', 'critica', 'STM', 'atm', 'SP', 'terceirizada', 'Protege', false, 'SUPT_01', false, 'P1', false),
('AGENCIA_P002', 'Cassete', 'SN_P_STM_002', 'Troca cassete Protege-STM', 'em_andamento', 'media', 'alta', 'STM', 'pos', 'RJ', 'terceirizada', 'Protege', false, 'SUPT_02', false, 'P2', false),

-- Protege + NCR (Segmento AB)
('AGENCIA_P003', 'Notebook', 'SN_P_NCR_001', 'Config notebook Protege-NCR', 'pendente', 'alta', 'media', 'NCR', 'rede', 'MG', 'terceirizada', 'Protege', false, 'SUPT_03', false, 'P1', false),
('AGENCIA_P004', 'Servidor', 'SN_P_NCR_002', 'Instalação servidor Protege-NCR', 'resolvida', 'media', 'baixa', 'NCR', 'datacenter', 'RS', 'terceirizada', 'Protege', false, 'SUPT_04', false, 'P2', false),

-- Protege + Diebold (Segmentos AA e AB)
('AGENCIA_P005', 'ATM Depósito', 'SN_P_DIE_001', 'ATM Depósito Protege-Diebold', 'pendente', 'critica', 'critica', 'Diebold', 'atm', 'PR', 'terceirizada', 'Protege', true, 'SUPT_05', false, 'P1', false),
('AGENCIA_P006', 'Impressora', 'SN_P_DIE_002', 'Impressora Protege-Diebold', 'em_andamento', 'alta', 'alta', 'Diebold', 'rede', 'BA', 'terceirizada', 'Protege', false, 'SUPT_06', false, 'P1', true),

-- TBFort + Artis (Segmentos AA e AB)
('AGENCIA_T001', 'ATM Saque', 'SN_T_ART_001', 'ATM TBFort-Artis', 'pendente', 'alta', 'critica', 'Artis', 'atm', 'PE', 'terceirizada', 'TBFort', false, 'SUPT_07', false, 'P1', false),
('AGENCIA_T002', 'Leitor biométrico', 'SN_T_ART_002', 'Biometria TBFort-Artis', 'com_impedimentos', 'media', 'media', 'Artis', 'datacenter', 'SC', 'terceirizada', 'TBFort', false, 'SUPT_08', false, 'P2', false),

-- TBFort + Azmachi (Segmentos AA e AB)
('AGENCIA_T003', 'Cassete', 'SN_T_AZM_001', 'Cassete TBFort-Azmachi', 'pendente', 'media', 'baixa', 'Azmachi', 'pos', 'GO', 'terceirizada', 'TBFort', false, 'SUPT_09', false, 'P3', false),
('AGENCIA_T004', 'Monitor LCD/LED', 'SN_T_AZM_002', 'Monitor TBFort-Azmachi', 'resolvida', 'baixa', 'media', 'Azmachi', 'rede', 'MT', 'terceirizada', 'TBFort', false, 'SUPT_10', false, 'P2', false),

-- Prosegur + Lexmark (Segmentos AA e AB)
('AGENCIA_PR001', 'ATM Depósito', 'SN_PR_LEX_001', 'ATM Prosegur-Lexmark', 'em_andamento', 'alta', 'alta', 'Lexmark', 'atm', 'MS', 'terceirizada', 'Prosegur', false, 'SUPT_11', false, 'P1', false),
('AGENCIA_PR002', 'Impressora térmica', 'SN_PR_LEX_002', 'Impressora Prosegur-Lexmark', 'pendente', 'critica', 'critica', 'Lexmark', 'datacenter', 'AM', 'terceirizada', 'Prosegur', true, 'SUPT_12', false, 'P1', false),

-- Prosegur + Nextvision (Segmentos AA e AB)
('AGENCIA_PR003', 'ATM Saque', 'SN_PR_NEX_001', 'ATM Prosegur-Nextvision', 'pendente', 'alta', 'media', 'Nextvision', 'pos', 'PA', 'terceirizada', 'Prosegur', false, 'SUPT_13', false, 'P2', false),
('AGENCIA_PR004', 'TCR', 'SN_PR_NEX_002', 'TCR Prosegur-Nextvision', 'em_andamento', 'media', 'baixa', 'Nextvision', 'rede', 'CE', 'terceirizada', 'Prosegur', false, 'SUPT_14', false, 'P3', false),

-- Brinks + STM (Segmentos AA e AB)
('AGENCIA_B001', 'Cassete', 'SN_B_STM_001', 'Cassete Brinks-STM', 'pendente', 'alta', 'media', 'STM', 'atm', 'AL', 'terceirizada', 'Brinks', false, 'SUPT_15', false, 'P1', false),
('AGENCIA_B002', 'Desktop', 'SN_B_STM_002', 'Desktop Brinks-STM', 'resolvida', 'media', 'baixa', 'STM', 'datacenter', 'SE', 'terceirizada', 'Brinks', false, 'SUPT_01', false, 'P2', false),

-- Brinks + Diebold (Segmentos AA e AB)
('AGENCIA_B003', 'ATM Depósito', 'SN_B_DIE_001', 'ATM Brinks-Diebold', 'em_andamento', 'critica', 'alta', 'Diebold', 'pos', 'RN', 'terceirizada', 'Brinks', false, 'SUPT_02', false, 'P1', false),
('AGENCIA_B004', 'Televisão', 'SN_B_DIE_002', 'TV Brinks-Diebold', 'pendente', 'baixa', 'media', 'Diebold', 'rede', 'PI', 'terceirizada', 'Brinks', false, 'SUPT_03', false, 'P3', false),

-- Brinks + NCR (Segmentos AA e AB)
('AGENCIA_B005', 'ATM Saque', 'SN_B_NCR_001', 'ATM Brinks-NCR', 'pendente', 'alta', 'critica', 'NCR', 'atm', 'MA', 'terceirizada', 'Brinks', false, 'SUPT_04', false, 'P1', false),
('AGENCIA_B006', 'Fragmentadora de Papel', 'SN_B_NCR_002', 'Fragmentadora Brinks-NCR', 'em_andamento', 'media', 'baixa', 'NCR', 'datacenter', 'TO', 'terceirizada', 'Brinks', false, 'SUPT_05', false, 'P2', false);