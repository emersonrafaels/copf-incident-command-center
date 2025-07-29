-- Verificar os valores reais de status na base
-- Atualizar data_encerramento para ocorrências com status 'resolvida' 
UPDATE public.occurrences 
SET data_encerramento = data_ocorrencia + interval '1 hour' + (random() * interval '72 hours')
WHERE status = 'resolvida' AND data_encerramento IS NULL;

-- Adicionar previsões para ocorrências não resolvidas (pendente, em_andamento)
UPDATE public.occurrences 
SET data_previsao_encerramento = data_ocorrencia + interval '2 hours' + (random() * interval '48 hours')
WHERE status IN ('pendente', 'em_andamento') 
  AND data_previsao_encerramento IS NULL
  AND random() > 0.6;

-- Para ocorrências já resolvidas, adicionar previsões retrospectivas
UPDATE public.occurrences 
SET data_previsao_encerramento = CASE 
  WHEN random() > 0.5 THEN 
    -- Previsões otimistas (menores que o real)
    data_ocorrencia + ((data_encerramento - data_ocorrencia) * (0.5 + random() * 0.4))
  ELSE 
    -- Previsões pessimistas (maiores que o real)
    data_ocorrencia + ((data_encerramento - data_ocorrencia) * (1.2 + random() * 0.8))
END
WHERE status = 'resolvida' 
  AND data_encerramento IS NOT NULL 
  AND data_previsao_encerramento IS NULL
  AND random() > 0.3;

-- Garantir que previsões sejam sempre após a data de ocorrência
UPDATE public.occurrences 
SET data_previsao_encerramento = data_ocorrencia + interval '30 minutes'
WHERE data_previsao_encerramento < data_ocorrencia;