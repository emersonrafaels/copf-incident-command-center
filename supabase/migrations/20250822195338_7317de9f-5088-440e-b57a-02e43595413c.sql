-- Remover a constraint existente de tipo_agencia para permitir os novos valores
ALTER TABLE occurrences DROP CONSTRAINT IF EXISTS occurrences_tipo_agencia_check;

-- Atualizar os tipos de agencia para os novos 6 tipos específicos
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
UPDATE occurrences 
SET vip = false
WHERE tipo_agencia NOT IN ('Convencional (AG)', 'Terceirizada (Espaço Itaú)');

-- Garantir que temos alguns VIPs nos tipos corretos
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

-- Criar nova constraint com os valores válidos
ALTER TABLE occurrences 
ADD CONSTRAINT occurrences_tipo_agencia_check 
CHECK (tipo_agencia IN ('Convencional (AG)', 'Convencional (PAB)', 'Terceirizada (Espaço Itaú)', 'Terceirizada (PAB)', 'Terceirizada (PAE)', 'Terceirizada (Phygital)'));

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