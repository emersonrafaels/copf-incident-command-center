-- Inserir 50 ocorrências para hoje
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, severidade, 
  fornecedor, segmento, uf, tipo_agencia, transportadora, supt, data_ocorrencia,
  data_limite_sla, data_previsao_encerramento, vip, reincidencia, possui_impedimento,
  status_equipamento, motivo_ocorrencia
) 
SELECT 
  (ARRAY['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '1011', '1012', '1013', '1014', '1015'])[ceil(random() * 15)] as agencia,
  (ARRAY['ATM', 'Impressora', 'UPS', 'Ar Condicionado', 'Sistema de Segurança', 'Câmera', 'Leitor de Cartão', 'Monitor', 'CPU', 'Switch'])[ceil(random() * 10)] as equipamento,
  'SN' || lpad((random() * 999999)::int::text, 6, '0') as numero_serie,
  (ARRAY[
    'Equipamento não responde',
    'Falha na comunicação',
    'Erro no display',
    'Problema de conectividade',
    'Mau funcionamento do hardware',
    'Sistema travado',
    'Falha de energia',
    'Erro de software',
    'Problema mecânico',
    'Falha na impressão'
  ])[ceil(random() * 10)] as descricao,
  (ARRAY['aberto', 'em_progresso', 'aguardando_pecas', 'resolvido'])[ceil(random() * 4)] as status,
  (ARRAY['baixa', 'media', 'alta', 'critica'])[ceil(random() * 4)] as prioridade,
  (ARRAY['baixa', 'media', 'alta', 'critica'])[ceil(random() * 4)] as severidade,
  (ARRAY['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Fornecedor D'])[ceil(random() * 4)] as fornecedor,
  (ARRAY['atm', 'pos', 'datacenter', 'rede'])[ceil(random() * 4)] as segmento,
  (ARRAY['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'DF', 'ES'])[ceil(random() * 10)] as uf,
  (ARRAY['matriz', 'filial', 'posto'])[ceil(random() * 3)] as tipo_agencia,
  (ARRAY['Transportadora Norte', 'Transportadora Sul', 'Transportadora Centro', 'Transportadora Leste'])[ceil(random() * 4)] as transportadora,
  (ARRAY['SUPT-01', 'SUPT-02', 'SUPT-03', 'SUPT-04', 'SUPT-05'])[ceil(random() * 5)] as supt,
  CURRENT_DATE + (random() * interval '23 hours') as data_ocorrencia,
  CURRENT_DATE + interval '2 days' + (random() * interval '3 days') as data_limite_sla,
  CASE 
    WHEN random() > 0.3 THEN CURRENT_DATE + interval '1 day' + (random() * interval '4 days')
    ELSE NULL 
  END as data_previsao_encerramento,
  random() > 0.8 as vip,
  random() > 0.85 as reincidencia,
  random() > 0.9 as possui_impedimento,
  (ARRAY['operante', 'inoperante', 'degradado'])[ceil(random() * 3)] as status_equipamento,
  (ARRAY[
    'Falha de hardware',
    'Problema de software',
    'Falha de conectividade',
    'Manutenção preventiva',
    'Substituição de peças',
    'Atualização de sistema'
  ])[ceil(random() * 6)] as motivo_ocorrencia
FROM generate_series(1, 50);