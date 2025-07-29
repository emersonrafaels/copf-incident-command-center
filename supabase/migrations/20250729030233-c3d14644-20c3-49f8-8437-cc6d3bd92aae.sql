-- Adicionar coluna status_equipamento à tabela occurrences
ALTER TABLE public.occurrences 
ADD COLUMN status_equipamento TEXT NOT NULL DEFAULT 'operante';

-- Adicionar alguns dados de exemplo
UPDATE public.occurrences 
SET status_equipamento = CASE 
    WHEN MOD(CAST(SUBSTRING(agencia FROM '\d+') AS INTEGER), 3) = 0 THEN 'inoperante'
    ELSE 'operante'
END;