-- Adicionar campo motivo de ocorrência
ALTER TABLE public.occurrences 
ADD COLUMN motivo_ocorrencia text;

-- Criar motivos realistas baseados nos tipos de equipamentos
UPDATE public.occurrences 
SET motivo_ocorrencia = CASE 
  WHEN equipamento LIKE '%ATM%' OR equipamento LIKE '%Cassete%' THEN 
    CASE (random() * 10)::int
      WHEN 0 THEN 'Falha na dispensação de cédulas'
      WHEN 1 THEN 'Erro de comunicação com sistema central'
      WHEN 2 THEN 'Atolamento de cédulas no cassete'
      WHEN 3 THEN 'Falha no leitor de cartão'
      WHEN 4 THEN 'Display com defeito'
      WHEN 5 THEN 'Teclado não responsivo'
      WHEN 6 THEN 'Sensor de presença com problema'
      WHEN 7 THEN 'Falha no sistema de autenticação'
      WHEN 8 THEN 'Erro na impressão de comprovante'
      ELSE 'Travamento do sistema operacional'
    END
  WHEN equipamento LIKE '%Impressora%' THEN
    CASE (random() * 8)::int
      WHEN 0 THEN 'Atolamento de papel'
      WHEN 1 THEN 'Toner/tinta esgotado'
      WHEN 2 THEN 'Falha na comunicação USB/rede'
      WHEN 3 THEN 'Erro de driver de impressão'
      WHEN 4 THEN 'Cabeça de impressão danificada'
      WHEN 5 THEN 'Papel inadequado causando defeitos'
      WHEN 6 THEN 'Aquecimento excessivo'
      ELSE 'Configuração de impressão incorreta'
    END
  WHEN equipamento LIKE '%Desktop%' OR equipamento LIKE '%Notebook%' THEN
    CASE (random() * 8)::int
      WHEN 0 THEN 'Sistema operacional corrompido'
      WHEN 1 THEN 'Falha no disco rígido'
      WHEN 2 THEN 'Memória RAM com defeito'
      WHEN 3 THEN 'Superaquecimento do processador'
      WHEN 4 THEN 'Vírus/malware detectado'
      WHEN 5 THEN 'Falha na fonte de alimentação'
      WHEN 6 THEN 'Erro de conectividade de rede'
      ELSE 'Aplicativo não iniciando'
    END
  WHEN equipamento LIKE '%Monitor%' OR equipamento LIKE '%LED%' OR equipamento LIKE '%LCD%' THEN
    CASE (random() * 6)::int
      WHEN 0 THEN 'Tela sem imagem'
      WHEN 1 THEN 'Pixels defeituosos'
      WHEN 2 THEN 'Falha na retroiluminação'
      WHEN 3 THEN 'Cabo de vídeo com problema'
      WHEN 4 THEN 'Ajuste de resolução incorreto'
      ELSE 'Fonte interna queimada'
    END
  WHEN equipamento LIKE '%Scanner%' OR equipamento LIKE '%Leitor%' THEN
    CASE (random() * 6)::int
      WHEN 0 THEN 'Erro na digitalização de documentos'
      WHEN 1 THEN 'Lente suja ou danificada'
      WHEN 2 THEN 'Falha no mecanismo de alimentação'
      WHEN 3 THEN 'Software de OCR com problema'
      WHEN 4 THEN 'Configuração de qualidade inadequada'
      ELSE 'Driver desatualizado'
    END
  ELSE
    CASE (random() * 6)::int
      WHEN 0 THEN 'Falha de conectividade'
      WHEN 1 THEN 'Erro de configuração'
      WHEN 2 THEN 'Problema de alimentação elétrica'
      WHEN 3 THEN 'Incompatibilidade de software'
      WHEN 4 THEN 'Desgaste natural do equipamento'
      ELSE 'Erro não identificado'
    END
END
WHERE motivo_ocorrencia IS NULL;

-- Adicionar comentário no campo
COMMENT ON COLUMN public.occurrences.motivo_ocorrencia IS 'Motivo/causa raiz da ocorrência técnica';