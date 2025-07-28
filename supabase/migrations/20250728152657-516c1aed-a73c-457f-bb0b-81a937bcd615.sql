-- Insert test data: 1500 occurrences (90% AA, 10% AB)
-- This will populate all dashboard cards with realistic data

-- First, let's clear any existing test data
TRUNCATE TABLE public.occurrences;

-- Generate 1350 AA segment occurrences (90%) - using segmento 'atm' for ATM-related issues
INSERT INTO public.occurrences (
    segmento, agencia, equipamento, numero_serie, descricao, 
    status, prioridade, severidade, fornecedor, uf, tipo_agencia, 
    supt, data_ocorrencia, data_resolucao, data_limite_sla,
    vip, reincidencia, observacoes, usuario_responsavel, prioridade_fornecedor
)
SELECT 
    'atm' as segmento,
    'AGENCIA_' || LPAD((ROW_NUMBER() OVER() % 200 + 1)::text, 4, '0') as agencia,
    CASE (ROW_NUMBER() OVER() % 10)
        WHEN 0 THEN 'ATM Diebold'
        WHEN 1 THEN 'ATM NCR'
        WHEN 2 THEN 'Impressora Epson'
        WHEN 3 THEN 'Scanner Canon'
        WHEN 4 THEN 'Servidor Dell'
        WHEN 5 THEN 'Switch Cisco'
        WHEN 6 THEN 'UPS APC'
        WHEN 7 THEN 'Camera Hikvision'
        WHEN 8 THEN 'Leitor Biometrico'
        ELSE 'Terminal POS'
    END as equipamento,
    'SN_' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 10)) as numero_serie,
    CASE (ROW_NUMBER() OVER() % 8)
        WHEN 0 THEN 'Falha na comunicação'
        WHEN 1 THEN 'Erro de hardware'
        WHEN 2 THEN 'Problema de software'
        WHEN 3 THEN 'Manutenção preventiva'
        WHEN 4 THEN 'Substituição de peça'
        WHEN 5 THEN 'Calibração necessária'
        WHEN 6 THEN 'Atualização de firmware'
        ELSE 'Limpeza técnica'
    END as descricao,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'pendente'
        WHEN 1 THEN 'em_andamento'
        WHEN 2 THEN 'resolvida'
        ELSE 'com_impedimentos'
    END as status,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'alta'
        WHEN 1 THEN 'media'
        WHEN 2 THEN 'baixa'
        ELSE 'critica'
    END as prioridade,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'critica'
        WHEN 1 THEN 'alta'
        WHEN 2 THEN 'media'
        ELSE 'baixa'
    END as severidade,
    CASE (ROW_NUMBER() OVER() % 5)
        WHEN 0 THEN 'TecBan'
        WHEN 1 THEN 'Diebold'
        WHEN 2 THEN 'NCR'
        WHEN 3 THEN 'Prosegur'
        ELSE 'Brinks'
    END as fornecedor,
    CASE (ROW_NUMBER() OVER() % 27)
        WHEN 0 THEN 'SP' WHEN 1 THEN 'RJ' WHEN 2 THEN 'MG' WHEN 3 THEN 'RS' 
        WHEN 4 THEN 'PR' WHEN 5 THEN 'SC' WHEN 6 THEN 'BA' WHEN 7 THEN 'GO'
        WHEN 8 THEN 'PE' WHEN 9 THEN 'CE' WHEN 10 THEN 'PA' WHEN 11 THEN 'MA'
        WHEN 12 THEN 'PB' WHEN 13 THEN 'ES' WHEN 14 THEN 'PI' WHEN 15 THEN 'AL'
        WHEN 16 THEN 'RN' WHEN 17 THEN 'MT' WHEN 18 THEN 'MS' WHEN 19 THEN 'DF'
        WHEN 20 THEN 'SE' WHEN 21 THEN 'AM' WHEN 22 THEN 'RO' WHEN 23 THEN 'AC'
        WHEN 24 THEN 'AP' WHEN 25 THEN 'RR' ELSE 'TO'
    END as uf,
    CASE (ROW_NUMBER() OVER() % 3)
        WHEN 0 THEN 'tradicional'
        WHEN 1 THEN 'prime'
        ELSE 'digital'
    END as tipo_agencia,
    'SUPT_' || LPAD(((ROW_NUMBER() OVER() % 15) + 1)::text, 2, '0') as supt,
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::int as data_ocorrencia,
    CASE WHEN (ROW_NUMBER() OVER() % 4) = 2 
        THEN NOW() - INTERVAL '1 hour' * (RANDOM() * 48)::int 
        ELSE NULL 
    END as data_resolucao,
    NOW() + INTERVAL '1 day' * (CASE 
        WHEN (ROW_NUMBER() OVER() % 4) = 0 THEN 1  -- Crítica: 1 dia
        WHEN (ROW_NUMBER() OVER() % 4) = 1 THEN 3  -- Alta: 3 dias
        WHEN (ROW_NUMBER() OVER() % 4) = 2 THEN 7  -- Média: 7 dias
        ELSE 14  -- Baixa: 14 dias
    END) as data_limite_sla,
    (ROW_NUMBER() OVER() % 20) = 0 as vip,  -- 5% VIP
    (ROW_NUMBER() OVER() % 15) = 0 as reincidencia,  -- ~7% reincidência
    CASE WHEN (ROW_NUMBER() OVER() % 3) = 0 
        THEN 'Observação técnica ' || (ROW_NUMBER() OVER())::text 
        ELSE NULL 
    END as observacoes,
    CASE (ROW_NUMBER() OVER() % 10)
        WHEN 0 THEN 'João Silva'
        WHEN 1 THEN 'Maria Santos'
        WHEN 2 THEN 'Pedro Costa'
        WHEN 3 THEN 'Ana Oliveira'
        WHEN 4 THEN 'Carlos Pereira'
        WHEN 5 THEN 'Luciana Lima'
        WHEN 6 THEN 'Roberto Alves'
        WHEN 7 THEN 'Fernanda Rocha'
        WHEN 8 THEN 'Ricardo Mendes'
        ELSE 'Patrícia Ferreira'
    END as usuario_responsavel,
    CASE (ROW_NUMBER() OVER() % 3)
        WHEN 0 THEN 'P1'
        WHEN 1 THEN 'P2'
        ELSE 'P3'
    END as prioridade_fornecedor
FROM generate_series(1, 1350);

-- Generate 150 AB segment occurrences (10%) - using segmento 'pos' for POS terminals
INSERT INTO public.occurrences (
    segmento, agencia, equipamento, numero_serie, descricao, 
    status, prioridade, severidade, fornecedor, uf, tipo_agencia, 
    supt, data_ocorrencia, data_resolucao, data_limite_sla,
    vip, reincidencia, observacoes, usuario_responsavel, prioridade_fornecedor
)
SELECT 
    'pos' as segmento,
    'AGENCIA_AB_' || LPAD((ROW_NUMBER() OVER() % 50 + 1)::text, 4, '0') as agencia,
    CASE (ROW_NUMBER() OVER() % 8)
        WHEN 0 THEN 'Terminal POS Ingenico'
        WHEN 1 THEN 'Terminal POS Verifone'
        WHEN 2 THEN 'Impressora Bematech'
        WHEN 3 THEN 'Scanner Datalogic'
        WHEN 4 THEN 'Tablet Samsung'
        WHEN 5 THEN 'Router TP-Link'
        WHEN 6 THEN 'Monitor LG'
        ELSE 'Teclado Logitech'
    END as equipamento,
    'SN_AB_' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 10)) as numero_serie,
    CASE (ROW_NUMBER() OVER() % 6)
        WHEN 0 THEN 'Falha de comunicação'
        WHEN 1 THEN 'Erro de sistema'
        WHEN 2 THEN 'Manutenção corretiva'
        WHEN 3 THEN 'Troca de componente'
        WHEN 4 THEN 'Configuração de rede'
        ELSE 'Teste de funcionamento'
    END as descricao,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'pendente'
        WHEN 1 THEN 'em_andamento'
        WHEN 2 THEN 'resolvida'
        ELSE 'com_impedimentos'
    END as status,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'alta'
        WHEN 1 THEN 'media'
        WHEN 2 THEN 'baixa'
        ELSE 'critica'
    END as prioridade,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'critica'
        WHEN 1 THEN 'alta'
        WHEN 2 THEN 'media'
        ELSE 'baixa'
    END as severidade,
    CASE (ROW_NUMBER() OVER() % 4)
        WHEN 0 THEN 'TecBan'
        WHEN 1 THEN 'Stefanini'
        WHEN 2 THEN 'Atos'
        ELSE 'IBM'
    END as fornecedor,
    CASE (ROW_NUMBER() OVER() % 15)
        WHEN 0 THEN 'SP' WHEN 1 THEN 'RJ' WHEN 2 THEN 'MG' WHEN 3 THEN 'RS' 
        WHEN 4 THEN 'PR' WHEN 5 THEN 'SC' WHEN 6 THEN 'BA' WHEN 7 THEN 'GO'
        WHEN 8 THEN 'PE' WHEN 9 THEN 'CE' WHEN 10 THEN 'PA' WHEN 11 THEN 'MA'
        WHEN 12 THEN 'ES' WHEN 13 THEN 'DF' ELSE 'MT'
    END as uf,
    CASE (ROW_NUMBER() OVER() % 3)
        WHEN 0 THEN 'tradicional'
        WHEN 1 THEN 'prime'
        ELSE 'digital'
    END as tipo_agencia,
    'SUPT_AB_' || LPAD(((ROW_NUMBER() OVER() % 8) + 1)::text, 2, '0') as supt,
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::int as data_ocorrencia,
    CASE WHEN (ROW_NUMBER() OVER() % 5) = 2 
        THEN NOW() - INTERVAL '1 hour' * (RANDOM() * 48)::int 
        ELSE NULL 
    END as data_resolucao,
    NOW() + INTERVAL '1 day' * (CASE 
        WHEN (ROW_NUMBER() OVER() % 4) = 0 THEN 1  -- Crítica: 1 dia
        WHEN (ROW_NUMBER() OVER() % 4) = 1 THEN 3  -- Alta: 3 dias
        WHEN (ROW_NUMBER() OVER() % 4) = 2 THEN 7  -- Média: 7 dias
        ELSE 14  -- Baixa: 14 dias
    END) as data_limite_sla,
    (ROW_NUMBER() OVER() % 25) = 0 as vip,  -- 4% VIP
    (ROW_NUMBER() OVER() % 20) = 0 as reincidencia,  -- 5% reincidência
    CASE WHEN (ROW_NUMBER() OVER() % 4) = 0 
        THEN 'Observação AB ' || (ROW_NUMBER() OVER())::text 
        ELSE NULL 
    END as observacoes,
    CASE (ROW_NUMBER() OVER() % 6)
        WHEN 0 THEN 'Alexandre Lima'
        WHEN 1 THEN 'Beatriz Silva'
        WHEN 2 THEN 'Carlos Augusto'
        WHEN 3 THEN 'Daniela Costa'
        WHEN 4 THEN 'Eduardo Santos'
        ELSE 'Fabiana Moura'
    END as usuario_responsavel,
    CASE (ROW_NUMBER() OVER() % 3)
        WHEN 0 THEN 'P1'
        WHEN 1 THEN 'P2'
        ELSE 'P3'
    END as prioridade_fornecedor
FROM generate_series(1, 150);