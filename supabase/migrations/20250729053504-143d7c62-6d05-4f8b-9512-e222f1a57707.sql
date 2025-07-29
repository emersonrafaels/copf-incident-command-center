-- Adicionar campos de previsão e data de encerramento na tabela occurrences
ALTER TABLE public.occurrences 
ADD COLUMN data_previsao_encerramento timestamp with time zone,
ADD COLUMN data_encerramento timestamp with time zone;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.occurrences.data_previsao_encerramento IS 'Data e hora prevista pelo fornecedor para encerramento da ocorrência (quando não está encerrada)';
COMMENT ON COLUMN public.occurrences.data_encerramento IS 'Data e hora real do encerramento da ocorrência';