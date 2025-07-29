-- Atualizar dados de encerramento para ocorrências já encerradas
-- Adicionar data_encerramento para todas as ocorrências encerradas (respeitando que deve ser > data_ocorrencia)
UPDATE public.occurrences 
SET data_encerramento = data_ocorrencia + interval '1 hour' + (random() * interval '72 hours')
WHERE status = 'encerrado' AND data_encerramento IS NULL;

-- Adicionar previsões de encerramento para algumas ocorrências não encerradas (cerca de 40%)
-- Algumas previsões serão realistas, outras otimistas ou pessimistas
UPDATE public.occurrences 
SET data_previsao_encerramento = data_ocorrencia + interval '2 hours' + (random() * interval '48 hours')
WHERE status IN ('a_iniciar', 'em_andamento', 'com_impedimentos') 
  AND data_previsao_encerramento IS NULL
  AND random() > 0.6;  -- 40% das ocorrências abertas terão previsão

-- Para ocorrências já encerradas, adicionar algumas previsões retrospectivas
-- Algumas previsões serão menores que o tempo real (otimistas)
-- Outras serão maiores que o tempo real (pessimistas)
UPDATE public.occurrences 
SET data_previsao_encerramento = CASE 
  WHEN random() > 0.5 THEN 
    -- 50% previsões otimistas (menores que o real)
    data_ocorrencia + ((data_encerramento - data_ocorrencia) * (0.5 + random() * 0.4))
  ELSE 
    -- 50% previsões pessimistas (maiores que o real)
    data_ocorrencia + ((data_encerramento - data_ocorrencia) * (1.2 + random() * 0.8))
END
WHERE status = 'encerrado' 
  AND data_encerramento IS NOT NULL 
  AND data_previsao_encerramento IS NULL
  AND random() > 0.3;  -- 70% das ocorrências encerradas terão previsão retroativa

-- Garantir que nenhuma previsão seja menor que a data de ocorrência
UPDATE public.occurrences 
SET data_previsao_encerramento = data_ocorrencia + interval '30 minutes'
WHERE data_previsao_encerramento < data_ocorrencia;