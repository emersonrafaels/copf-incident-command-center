-- Seed occurrences for today with values matching constraints
INSERT INTO public.occurrences (
  vip,
  override,
  reincidencia,
  data_ocorrencia,
  data_resolucao,
  data_limite_sla,
  data_previsao_encerramento,
  data_encerramento,
  tipo_agencia,
  transportadora,
  supt,
  usuario_responsavel,
  prioridade_fornecedor,
  observacoes,
  status_equipamento,
  motivo_ocorrencia,
  agencia,
  equipamento,
  numero_serie,
  descricao,
  status,
  prioridade,
  severidade,
  fornecedor,
  segmento,
  uf
) VALUES
-- 1 ATM
(false, false, false, now() - interval '1 hour', NULL, NULL, now() + interval '5 hour', NULL,
 'convencional', 'Protege', '21', NULL, NULL, 'Seed de teste', 'inoperante', 'Falha de comunicação',
 '0215', 'ATM Saque', 'ASQ-0001', 'Terminal sem comunicação', 'em_andamento', 'alta', 'critica', 'NCR', 'atm', 'SP'),
-- 2 ATM depósito
(false, false, false, now() - interval '2 hour', NULL, NULL, now() + interval '8 hour', NULL,
 'terceirizada', 'Brinks', '22', NULL, NULL, 'Seed de teste', 'inoperante', 'Erro de depósito',
 '1320', 'ATM Depósito', 'ADP-0102', 'Falha no módulo de depósito', 'pendente', 'alta', 'alta', 'Diebold', 'atm', 'RJ'),
-- 3 Cassete (ATM)
(false, false, false, now() - interval '30 minute', NULL, NULL, now() + interval '10 hour', NULL,
 'convencional', 'Prosegur', '23', NULL, NULL, 'Seed de teste', 'operante', 'Atendimento em análise',
 '3055', 'Cassete', 'CAS-7788', 'Reposição de cassetes necessária', 'em_andamento', 'media', 'media', 'STM', 'atm', 'MG'),
-- 4 Notebook (datacenter)
(false, false, false, now() - interval '3 hour', NULL, NULL, now() + interval '20 hour', NULL,
 'convencional', 'Protege', '24', NULL, NULL, 'Seed de teste', 'inoperante', 'Sem boot',
 '0950', 'Notebook', 'NTB-1001', 'Notebook não liga', 'em_andamento', 'media', 'baixa', 'Artis', 'datacenter', 'SP'),
-- 5 Impressora (rede)
(false, false, false, now() - interval '50 minute', NULL, NULL, now() + interval '6 hour', NULL,
 'terceirizada', 'TBFort', '51', NULL, NULL, 'Seed de teste', 'inoperante', 'Sem impressão',
 '5188', 'Impressora', 'IMP-3344', 'Falha no cabeçote de impressão', 'pendente', 'media', 'media', 'Lexmark', 'rede', 'RS'),
-- 6 Monitor (rede)
(false, false, false, now() - interval '4 hour', NULL, NULL, now() + interval '15 hour', NULL,
 'convencional', 'Prosegur', '52', NULL, NULL, 'Seed de teste', 'operante', 'Monitor piscando',
 '2275', 'Monitor LCD/LED', 'MON-2211', 'Oscilação de brilho', 'em_andamento', 'baixa', 'baixa', 'Nextvision', 'rede', 'PR'),
-- 7 Biometria (pos)
(false, false, false, now() - interval '20 minute', NULL, NULL, now() + interval '3 hour', NULL,
 'convencional', 'Brinks', '53', NULL, NULL, 'Seed de teste', 'inoperante', 'Leitura biométrica falhando',
 '6020', 'Leitor biométrico', 'BIO-9001', 'Sensor não reconhece digitais', 'em_andamento', 'alta', 'alta', 'NCR', 'pos', 'SP'),
-- 8 Scanner de Cheque (rede)
(false, false, false, now() - interval '90 minute', NULL, NULL, now() + interval '12 hour', NULL,
 'terceirizada', 'Protege', '54', NULL, NULL, 'Seed de teste', 'inoperante', 'Scanner travando',
 '7850', 'Scanner de Cheque', 'SCN-5566', 'Atolamento frequente', 'com_impedimentos', 'media', 'media', 'STM', 'rede', 'RJ'),
-- 9 TCR (datacenter)
(false, false, false, now() - interval '10 minute', NULL, NULL, now() + interval '2 hour', NULL,
 'convencional', 'TBFort', '55', NULL, NULL, 'Seed de teste', 'inoperante', 'TCR sem contagem',
 '4390', 'TCR', 'TCR-1200', 'Erro no módulo de reciclagem', 'pendente', 'alta', 'critica', 'Diebold', 'datacenter', 'SP'),
-- 10 Televisão (rede)
(false, false, false, now() - interval '25 minute', NULL, NULL, now() + interval '7 hour', NULL,
 'convencional', 'Prosegur', '56', NULL, NULL, 'Seed de teste', 'operante', 'Falha intermitente',
 '1490', 'Televisão', 'TV-7781', 'Tela apagando aleatoriamente', 'em_andamento', 'baixa', 'baixa', 'Nextvision', 'rede', 'MG'),
-- 11 ATM Saque (atm)
(false, false, false, now() - interval '1 hour', NULL, NULL, now() + interval '9 hour', NULL,
 'terceirizada', 'Brinks', '57', NULL, NULL, 'Seed de teste', 'inoperante', 'Erro de saque',
 '3125', 'ATM Saque', 'ASQ-0002', 'Falha no dispensador', 'em_andamento', 'alta', 'alta', 'NCR', 'atm', 'SP'),
-- 12 Servidor (datacenter)
(false, false, false, now() - interval '2 hour', NULL, NULL, now() + interval '16 hour', NULL,
 'convencional', 'Protege', '58', NULL, NULL, 'Seed de teste', 'operante', 'Sem conexão de rede',
 '9205', 'Servidor', 'SRV-4455', 'Interface de rede com perda de pacotes', 'pendente', 'alta', 'media', 'STM', 'datacenter', 'RS');