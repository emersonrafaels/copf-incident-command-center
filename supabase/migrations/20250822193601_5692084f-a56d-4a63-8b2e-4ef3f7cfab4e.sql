-- Migração para os novos tipos de pontos
-- Primeiro, vamos verificar a distribuição atual
-- SELECT tipo_agencia, COUNT(*) FROM occurrences GROUP BY tipo_agencia;

-- Atualizar os tipos de agencia para os novos 6 tipos específicos
-- Mapeamento dos tipos antigos para os novos:

-- Convencional -> Convencional (AG) e Convencional (PAB)
UPDATE occurrences 
SET tipo_agencia = 'Convencional (AG)'
WHERE tipo_agencia = 'convencional' 
  AND agencia IN (
    SELECT DISTINCT agencia 
    FROM occurrences 
    WHERE tipo_agencia = 'convencional' 
    ORDER BY agencia 
    LIMIT (SELECT COUNT(DISTINCT agencia)/2 FROM occurrences WHERE tipo_agencia = 'convencional')
  );

UPDATE occurrences 
SET tipo_agencia = 'Convencional (PAB)'
WHERE tipo_agencia = 'convencional';

-- Terceirizada -> Terceirizada (Espaço Itaú) e Terceirizada (PAB)
UPDATE occurrences 
SET tipo_agencia = 'Terceirizada (Espaço Itaú)'
WHERE tipo_agencia = 'terceirizada' 
  AND agencia IN (
    SELECT DISTINCT agencia 
    FROM occurrences 
    WHERE tipo_agencia = 'terceirizada' 
    ORDER BY agencia 
    LIMIT (SELECT COUNT(DISTINCT agencia)/2 FROM occurrences WHERE tipo_agencia = 'terceirizada')
  );

UPDATE occurrences 
SET tipo_agencia = 'Terceirizada (PAB)'
WHERE tipo_agencia = 'terceirizada';

-- Tradicional -> Terceirizada (PAE)
UPDATE occurrences 
SET tipo_agencia = 'Terceirizada (PAE)'
WHERE tipo_agencia = 'tradicional';

-- Digital -> Terceirizada (PAE) e Terceirizada (Phygital)
UPDATE occurrences 
SET tipo_agencia = 'Terceirizada (PAE)'
WHERE tipo_agencia = 'digital' 
  AND agencia IN (
    SELECT DISTINCT agencia 
    FROM occurrences 
    WHERE tipo_agencia = 'digital' 
    ORDER BY agencia 
    LIMIT (SELECT COUNT(DISTINCT agencia)/2 FROM occurrences WHERE tipo_agencia = 'digital')
  );

UPDATE occurrences 
SET tipo_agencia = 'Terceirizada (Phygital)'
WHERE tipo_agencia = 'digital';

-- Prime -> Terceirizada (Phygital)
UPDATE occurrences 
SET tipo_agencia = 'Terceirizada (Phygital)'
WHERE tipo_agencia = 'prime';

-- Ajustar regras VIP - apenas Convencional (AG) e Terceirizada (Espaço Itaú) podem ter VIP
-- Primeiro, remover VIP de todos os outros tipos
UPDATE occurrences 
SET vip = false
WHERE tipo_agencia NOT IN ('Convencional (AG)', 'Terceirizada (Espaço Itaú)');

-- Garantir que temos alguns VIPs nos tipos corretos
-- Definir alguns pontos específicos como VIP em Convencional (AG)
UPDATE occurrences 
SET vip = true
WHERE tipo_agencia = 'Convencional (AG)' 
  AND agencia IN (
    SELECT DISTINCT agencia 
    FROM occurrences 
    WHERE tipo_agencia = 'Convencional (AG)' 
    ORDER BY agencia 
    LIMIT 50
  );

-- Definir alguns pontos específicos como VIP em Terceirizada (Espaço Itaú)
UPDATE occurrences 
SET vip = true
WHERE tipo_agencia = 'Terceirizada (Espaço Itaú)' 
  AND agencia IN (
    SELECT DISTINCT agencia 
    FROM occurrences 
    WHERE tipo_agencia = 'Terceirizada (Espaço Itaú)' 
    ORDER BY agencia 
    LIMIT 30
  );

-- Verificar a distribuição final
SELECT 
    tipo_agencia, 
    COUNT(*) as total_ocorrencias,
    COUNT(DISTINCT agencia) as pontos_unicos,
    SUM(CASE WHEN vip = true THEN 1 ELSE 0 END) as total_vips,
    COUNT(DISTINCT CASE WHEN vip = true THEN agencia END) as pontos_vips
FROM occurrences 
GROUP BY tipo_agencia 
ORDER BY tipo_agencia;