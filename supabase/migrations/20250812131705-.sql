-- Reseed showcase occurrences with valid segmento values per check constraint (use 'atm')
-- Goal: last 7 days, aging > 5 days, tipo_agencia = 'Convencional', data_previsao_encerramento IS NULL

-- Clean up any partial rows that might have been inserted (ignore errors if none)
-- Note: We only delete our specific serial numbers to be safe
DELETE FROM public.occurrences WHERE numero_serie IN (
  'SN-CNV-0001','SN-CNV-0002','SN-CNV-0003','SN-CNV-0004',
  'SN-CNV-0005','SN-CNV-0006','SN-CNV-0007','SN-CNV-0008'
);

-- Insert 8 showcase occurrences
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento,
  uf, tipo_agencia, supt, transportadora,
  data_ocorrencia, data_previsao_encerramento,
  vip, override, reincidencia, possui_impedimento,
  status_equipamento
) VALUES 
('Agência Centro 101','ATM','SN-CNV-0001','Falha intermitente no dispensador de cédulas',
 'em_andamento','alta','alta','Fornecedor A','atm',
 'SP','Convencional','SUPT-01','Transp X',
 now() - interval '6 days' - interval '3 hours', NULL,
 false,false,false,false,'inoperante'),

('Agência Norte 202','ATM','SN-CNV-0002','Erro de leitura no leitor de cartões',
 'em_andamento','media','media','Fornecedor B','atm',
 'RJ','Convencional','SUPT-02','Transp Y',
 now() - interval '7 days' + interval '2 hours', NULL,
 false,false,true,false,'inoperante'),

('Agência Sul 303','ATM','SN-CNV-0003','Travamento ao iniciar operação',
 'em_andamento','alta','alta','Fornecedor C','atm',
 'RS','Convencional','SUPT-03','Transp Z',
 now() - interval '5 days' - interval '6 hours', NULL,
 false,false,false,true,'inoperante'),

('Agência Leste 404','ATM','SN-CNV-0004','Falha na conexão de rede',
 'em_andamento','baixa','baixa','Fornecedor A','atm',
 'BA','Convencional','SUPT-04','Transp X',
 now() - interval '6 days' - interval '12 hours', NULL,
 false,false,false,false,'inoperante'),

('Agência Oeste 505','ATM','SN-CNV-0005','Módulo de depósito não inicializa',
 'em_andamento','alta','critica','Fornecedor B','atm',
 'MG','Convencional','SUPT-05','Transp Y',
 now() - interval '5 days' - interval '8 hours', NULL,
 false,false,false,false,'inoperante'),

('Agência Centro 606','ATM','SN-CNV-0006','Tempo de resposta muito lento',
 'em_andamento','media','media','Fornecedor C','atm',
 'SP','Convencional','SUPT-01','Transp Z',
 now() - interval '6 days' - interval '20 hours', NULL,
 false,false,false,false,'inoperante'),

('Agência Norte 707','ATM','SN-CNV-0007','Erro esporádico no módulo de saque',
 'em_andamento','baixa','baixa','Fornecedor A','atm',
 'RJ','Convencional','SUPT-02','Transp X',
 now() - interval '7 days' + interval '6 hours', NULL,
 false,false,false,true,'inoperante'),

('Agência Sul 808','ATM','SN-CNV-0008','Atualização pendente causando indisponibilidade',
 'em_andamento','alta','alta','Fornecedor B','atm',
 'RS','Convencional','SUPT-03','Transp Y',
 now() - interval '6 days' - interval '15 hours', NULL,
 false,false,false,false,'inoperante');