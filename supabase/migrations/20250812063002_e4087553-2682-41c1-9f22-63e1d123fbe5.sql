-- Re-randomizar motivos de impedimento para TODAS as ocorrências com impedimento
WITH reasons(val) AS (
  VALUES 
    ('Falta de Peças'),
    ('Sem acesso ao equipamento'),
    ('Equipe indisponível'),
    ('Dependência de terceiro'),
    ('Falha de energia elétrica'),
    ('Link de dados indisponível'),
    ('Aguardando peça em trânsito'),
    ('Janela de manutenção restrita'),
    ('Problemas de segurança no local'),
    ('Clima desfavorável')
), assign_all AS (
  SELECT DISTINCT ON (o.id) o.id, r.val
  FROM public.occurrences o
  CROSS JOIN reasons r
  WHERE o.possui_impedimento = true
  ORDER BY o.id, random()
)
UPDATE public.occurrences o
SET motivo_impedimento = a.val,
    updated_at = now()
FROM assign_all a
WHERE o.id = a.id;