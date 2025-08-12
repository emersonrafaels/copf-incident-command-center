-- Seed showcase occurrences: last 7 days, aging > 5 days, no SLA forecast (data_previsao_encerramento IS NULL)
-- Note: RLS allows public SELECT only; these INSERTs are migration-time seeds

-- Helper: choose base now() and spread dates in last 7 days
-- We'll create 8 occurrences: segmento 'Convencional', status 'em_andamento', severidade varied,
-- prioridade varied, fornecedor varied, with data_ocorrencia between now()-7d and now()-5d to ensure aging>5 days

-- 1
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Centro 101', 'ATM', 'SN-CNV-0001', 'Falha intermitente no dispensador de cédulas',
  'em_andamento', 'alta', 'alta', 'Fornecedor A', 'Convencional',
  'SP', 'Convencional', 'SUPT-01', 'Transp X',
  now() - interval '6 days' - interval '3 hours', NULL,
  false, false, false, false,
  'inoperante'
);

-- 2
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Norte 202', 'ATM', 'SN-CNV-0002', 'Erro de leitura no leitor de cartões',
  'em_andamento', 'media', 'media', 'Fornecedor B', 'Convencional',
  'RJ', 'Convencional', 'SUPT-02', 'Transp Y',
  now() - interval '7 days' + interval '2 hours', NULL,
  false, false, true, false,
  'inoperante'
);

-- 3
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Sul 303', 'ATM', 'SN-CNV-0003', 'Travamento ao iniciar operação',
  'em_andamento', 'alta', 'alta', 'Fornecedor C', 'Convencional',
  'RS', 'Convencional', 'SUPT-03', 'Transp Z',
  now() - interval '5 days' - interval '6 hours', NULL,
  false, false, false, true,
  'inoperante'
);

-- 4
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Leste 404', 'ATM', 'SN-CNV-0004', 'Falha na conexão de rede',
  'em_andamento', 'baixa', 'baixa', 'Fornecedor A', 'Convencional',
  'BA', 'Convencional', 'SUPT-04', 'Transp X',
  now() - interval '6 days' - interval '12 hours', NULL,
  false, false, false, false,
  'inoperante'
);

-- 5
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Oeste 505', 'ATM', 'SN-CNV-0005', 'Módulo de depósito não inicializa',
  'em_andamento', 'alta', 'critica', 'Fornecedor B', 'Convencional',
  'MG', 'Convencional', 'SUPT-05', 'Transp Y',
  now() - interval '5 days' - interval '8 hours', NULL,
  false, false, false, false,
  'inoperante'
);

-- 6
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Centro 606', 'ATM', 'SN-CNV-0006', 'Tempo de resposta muito lento',
  'em_andamento', 'media', 'media', 'Fornecedor C', 'Convencional',
  'SP', 'Convencional', 'SUPT-01', 'Transp Z',
  now() - interval '6 days' - interval '20 hours', NULL,
  false, false, false, false,
  'inoperante'
);

-- 7
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Norte 707', 'ATM', 'SN-CNV-0007', 'Erro esporádico no módulo de saque',
  'em_andamento', 'baixa', 'baixa', 'Fornecedor A', 'Convencional',
  'RJ', 'Convencional', 'SUPT-02', 'Transp X',
  now() - interval '7 days' + interval '6 hours', NULL,
  false, false, false, true,
  'inoperante'
);

-- 8
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES (
  'Agência Sul 808', 'ATM', 'SN-CNV-0008', 'Atualização pendente causando indisponibilidade',
  'em_andamento', 'alta', 'alta', 'Fornecedor B', 'Convencional',
  'RS', 'Convencional', 'SUPT-03', 'Transp Y',
  now() - interval '6 days' - interval '15 hours', NULL,
  false, false, false, false,
  'inoperante'
);
