-- Remover previsões de encerramento para ocorrências com status 'pendente' (a_iniciar)
UPDATE public.occurrences 
SET data_previsao_encerramento = NULL
WHERE status = 'pendente';

-- Garantir que TODAS as ocorrências 'em_andamento' tenham previsão de encerramento
UPDATE public.occurrences 
SET data_previsao_encerramento = data_ocorrencia + interval '4 hours' + (random() * interval '20 hours')
WHERE status = 'em_andamento' 
  AND data_previsao_encerramento IS NULL;