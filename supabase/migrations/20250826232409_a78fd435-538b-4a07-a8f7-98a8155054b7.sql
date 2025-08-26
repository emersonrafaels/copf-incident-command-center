-- Insert sample occurrences with different status values using correct values for all fields
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, severidade, 
  fornecedor, segmento, uf, tipo_agencia, supt, transportadora, 
  motivo_ocorrencia, data_ocorrencia, data_limite_sla, data_previsao_encerramento,
  vip, reincidencia
) VALUES 
-- Status: em_andamento
('AG001', 'ATM Banco24Horas', 'SN001234', 'Falha na impressora de recibos', 'em_andamento', 'alta', 'alta', 'Fornecedor A', 'atm', 'SP', 'Convencional (AG)', 'SUPT01', 'Transportadora X', 'Defeito mecânico', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours', NOW() + INTERVAL '20 hours', false, false),
('AG002', 'ATM Itaú', 'SN001235', 'Tela com defeito', 'em_andamento', 'media', 'media', 'Fornecedor B', 'pos', 'RJ', 'Terceirizada (Espaço Itaú)', 'SUPT02', 'Transportadora Y', 'Componente eletrônico', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours', NULL, true, false),

-- Status: pendente  
('AG003', 'ATM Bradesco', 'SN001236', 'Não aceita cartão', 'pendente', 'alta', 'alta', 'Fornecedor A', 'atm', 'MG', 'Convencional (PAB)', 'SUPT01', 'Transportadora X', 'Leitor de cartão', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '19 hours', NOW() + INTERVAL '18 hours', false, true),
('AG004', 'ATM Santander', 'SN001237', 'Travamento do sistema', 'pendente', 'critica', 'critica', 'Fornecedor C', 'rede', 'PR', 'Terceirizada (PAE)', 'SUPT03', 'Transportadora Z', 'Software', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours', NOW() + INTERVAL '19 hours', true, false),

-- Status: com_impedimentos
('AG005', 'ATM Caixa', 'SN001238', 'Dispensador não funciona', 'com_impedimentos', 'alta', 'alta', 'Fornecedor B', 'atm', 'RS', 'Convencional (AG)', 'SUPT02', 'Transportadora Y', 'Mecanismo dispensador', NOW() - INTERVAL '8 hours', NOW() + INTERVAL '16 hours', NULL, false, false),
('AG006', 'ATM Banco do Brasil', 'SN001239', 'Falha na comunicação', 'com_impedimentos', 'media', 'media', 'Fornecedor D', 'datacenter', 'BA', 'Terceirizada (PAB)', 'SUPT04', 'Transportadora W', 'Conectividade', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours', NOW() + INTERVAL '25 hours', true, false),

-- Status: resolvida
('AG007', 'ATM Bradesco', 'SN001240', 'Papel para recibo acabou', 'resolvida', 'baixa', 'baixa', 'Fornecedor A', 'atm', 'SC', 'Convencional (PAB)', 'SUPT01', 'Transportadora X', 'Suprimento', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '12 hours', NOW() - INTERVAL '2 hours', false, false),
('AG008', 'ATM Itaú', 'SN001241', 'Teclado com tecla travada', 'resolvida', 'media', 'media', 'Fornecedor B', 'pos', 'GO', 'Terceirizada (Phygital)', 'SUPT02', 'Transportadora Y', 'Hardware', NOW() - INTERVAL '24 hours', NOW(), NOW() - INTERVAL '4 hours', false, true),

-- More varied status
('AG009', 'ATM Santander', 'SN001242', 'Limpeza de rotina concluída', 'pendente', 'baixa', 'baixa', 'Fornecedor C', 'atm', 'PE', 'Convencional (AG)', 'SUPT03', 'Transportadora Z', 'Manutenção preventiva', NOW() - INTERVAL '48 hours', NOW() - INTERVAL '24 hours', NOW() - INTERVAL '30 hours', false, false),
('AG010', 'ATM Caixa', 'SN001243', 'Atualização de software', 'em_andamento', 'media', 'media', 'Fornecedor D', 'rede', 'CE', 'Terceirizada (PAE)', 'SUPT04', 'Transportadora W', 'Software', NOW() - INTERVAL '72 hours', NOW() - INTERVAL '48 hours', NOW() - INTERVAL '50 hours', true, false),
('AG011', 'ATM Banco24Horas', 'SN001244', 'Aguardando peça de reposição', 'com_impedimentos', 'alta', 'alta', 'Fornecedor A', 'atm', 'DF', 'Convencional (AG)', 'SUPT01', 'Transportadora X', 'Peça defeituosa', NOW() - INTERVAL '16 hours', NOW() + INTERVAL '8 hours', NULL, true, false),
('AG012', 'ATM Itaú', 'SN001245', 'Validação de segurança pendente', 'pendente', 'critica', 'critica', 'Fornecedor B', 'datacenter', 'AM', 'Terceirizada (Espaço Itaú)', 'SUPT02', 'Transportadora Y', 'Segurança', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '20 hours', NOW() + INTERVAL '30 hours', false, false),
('AG013', 'ATM Bradesco', 'SN001246', 'Falso alarme - equipamento ok', 'em_andamento', 'baixa', 'baixa', 'Fornecedor C', 'atm', 'MT', 'Terceirizada (PAB)', 'SUPT03', 'Transportadora Z', 'Falso positivo', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours', NULL, false, false),
('AG014', 'ATM Santander', 'SN001247', 'Ocorrência duplicada', 'pendente', 'media', 'media', 'Fornecedor D', 'pos', 'RO', 'Convencional (PAB)', 'SUPT04', 'Transportadora W', 'Duplicação', NOW() - INTERVAL '10 hours', NOW() + INTERVAL '14 hours', NULL, false, false),
('AG015', 'ATM Caixa', 'SN001248', 'Problema complexo - escalado', 'com_impedimentos', 'critica', 'critica', 'Fornecedor A', 'atm', 'AC', 'Terceirizada (Phygital)', 'SUPT01', 'Transportadora X', 'Complexidade técnica', NOW() - INTERVAL '14 hours', NOW() + INTERVAL '10 hours', NULL, true, true),
('AG016', 'ATM Banco do Brasil', 'SN001249', 'Falha recorrente - especialista', 'em_andamento', 'alta', 'alta', 'Fornecedor B', 'rede', 'AP', 'Convencional (AG)', 'SUPT02', 'Transportadora Y', 'Recorrência', NOW() - INTERVAL '20 hours', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '28 hours', false, true);

-- Update some resolved occurrences with resolution dates
UPDATE public.occurrences 
SET data_resolucao = data_previsao_encerramento, 
    data_encerramento = data_previsao_encerramento + INTERVAL '1 hour'
WHERE status = 'resolvida' 
AND data_previsao_encerramento IS NOT NULL;