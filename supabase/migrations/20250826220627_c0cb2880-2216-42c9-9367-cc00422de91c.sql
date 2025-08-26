-- Insert sample occurrences with different status values using correct segmento values
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, severidade, 
  fornecedor, segmento, uf, tipo_agencia, supt, transportadora, 
  motivo_ocorrencia, data_ocorrencia, data_limite_sla, data_previsao_encerramento,
  vip, reincidencia
) VALUES 
-- Status: aberto
('AG001', 'ATM Banco24Horas', 'SN001234', 'Falha na impressora de recibos', 'aberto', 'alta', 'high', 'Fornecedor A', 'atm', 'SP', 'convencional', 'SUPT01', 'Transportadora X', 'Defeito mecânico', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours', NOW() + INTERVAL '20 hours', false, false),
('AG002', 'ATM Itaú', 'SN001235', 'Tela com defeito', 'aberto', 'média', 'medium', 'Fornecedor B', 'pos', 'RJ', 'shopping', 'SUPT02', 'Transportadora Y', 'Componente eletrônico', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours', NULL, true, false),

-- Status: em andamento  
('AG003', 'ATM Bradesco', 'SN001236', 'Não aceita cartão', 'em andamento', 'alta', 'high', 'Fornecedor A', 'atm', 'MG', 'convencional', 'SUPT01', 'Transportadora X', 'Leitor de cartão', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '19 hours', NOW() + INTERVAL '18 hours', false, true),
('AG004', 'ATM Santander', 'SN001237', 'Travamento do sistema', 'em andamento', 'crítica', 'critical', 'Fornecedor C', 'rede', 'PR', 'aeroporto', 'SUPT03', 'Transportadora Z', 'Software', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours', NOW() + INTERVAL '19 hours', true, false),

-- Status: aguardando fornecedor
('AG005', 'ATM Caixa', 'SN001238', 'Dispensador não funciona', 'aguardando fornecedor', 'alta', 'high', 'Fornecedor B', 'atm', 'RS', 'convencional', 'SUPT02', 'Transportadora Y', 'Mecanismo dispensador', NOW() - INTERVAL '8 hours', NOW() + INTERVAL '16 hours', NULL, false, false),
('AG006', 'ATM Banco do Brasil', 'SN001239', 'Falha na comunicação', 'aguardando fornecedor', 'média', 'medium', 'Fornecedor D', 'datacenter', 'BA', 'shopping', 'SUPT04', 'Transportadora W', 'Conectividade', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours', NOW() + INTERVAL '25 hours', true, false),

-- Status: resolvido
('AG007', 'ATM Bradesco', 'SN001240', 'Papel para recibo acabou', 'resolvido', 'baixa', 'low', 'Fornecedor A', 'atm', 'SC', 'convencional', 'SUPT01', 'Transportadora X', 'Suprimento', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '12 hours', NOW() - INTERVAL '2 hours', false, false),
('AG008', 'ATM Itaú', 'SN001241', 'Teclado com tecla travada', 'resolvido', 'média', 'medium', 'Fornecedor B', 'pos', 'GO', 'rodoviária', 'SUPT02', 'Transportadora Y', 'Hardware', NOW() - INTERVAL '24 hours', NOW(), NOW() - INTERVAL '4 hours', false, true),

-- Status: fechado
('AG009', 'ATM Santander', 'SN001242', 'Limpeza de rotina concluída', 'fechado', 'baixa', 'low', 'Fornecedor C', 'atm', 'PE', 'convencional', 'SUPT03', 'Transportadora Z', 'Manutenção preventiva', NOW() - INTERVAL '48 hours', NOW() - INTERVAL '24 hours', NOW() - INTERVAL '30 hours', false, false),
('AG010', 'ATM Caixa', 'SN001243', 'Atualização de software', 'fechado', 'média', 'medium', 'Fornecedor D', 'rede', 'CE', 'shopping', 'SUPT04', 'Transportadora W', 'Software', NOW() - INTERVAL '72 hours', NOW() - INTERVAL '48 hours', NOW() - INTERVAL '50 hours', true, false),

-- Status: pendente
('AG011', 'ATM Banco24Horas', 'SN001244', 'Aguardando peça de reposição', 'pendente', 'alta', 'high', 'Fornecedor A', 'atm', 'DF', 'aeroporto', 'SUPT01', 'Transportadora X', 'Peça defeituosa', NOW() - INTERVAL '16 hours', NOW() + INTERVAL '8 hours', NULL, true, false),
('AG012', 'ATM Itaú', 'SN001245', 'Validação de segurança pendente', 'pendente', 'crítica', 'critical', 'Fornecedor B', 'datacenter', 'AM', 'convencional', 'SUPT02', 'Transportadora Y', 'Segurança', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '20 hours', NOW() + INTERVAL '30 hours', false, false),

-- Status: cancelado
('AG013', 'ATM Bradesco', 'SN001246', 'Falso alarme - equipamento ok', 'cancelado', 'baixa', 'low', 'Fornecedor C', 'atm', 'MT', 'shopping', 'SUPT03', 'Transportadora Z', 'Falso positivo', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours', NULL, false, false),
('AG014', 'ATM Santander', 'SN001247', 'Ocorrência duplicada', 'cancelado', 'média', 'medium', 'Fornecedor D', 'pos', 'RO', 'rodoviária', 'SUPT04', 'Transportadora W', 'Duplicação', NOW() - INTERVAL '10 hours', NOW() + INTERVAL '14 hours', NULL, false, false),

-- Status: escalado
('AG015', 'ATM Caixa', 'SN001248', 'Problema complexo - escalado', 'escalado', 'crítica', 'critical', 'Fornecedor A', 'atm', 'AC', 'convencional', 'SUPT01', 'Transportadora X', 'Complexidade técnica', NOW() - INTERVAL '14 hours', NOW() + INTERVAL '10 hours', NULL, true, true),
('AG016', 'ATM Banco do Brasil', 'SN001249', 'Falha recorrente - especialista', 'escalado', 'alta', 'high', 'Fornecedor B', 'rede', 'AP', 'aeroporto', 'SUPT02', 'Transportadora Y', 'Recorrência', NOW() - INTERVAL '20 hours', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '28 hours', false, true);

-- Update some resolved/closed occurrences with resolution dates
UPDATE public.occurrences 
SET data_resolucao = data_previsao_encerramento, 
    data_encerramento = data_previsao_encerramento + INTERVAL '1 hour'
WHERE status IN ('resolvido', 'fechado') 
AND data_previsao_encerramento IS NOT NULL;