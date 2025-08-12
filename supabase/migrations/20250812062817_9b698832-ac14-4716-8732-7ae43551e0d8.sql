-- Preencher motivos ausentes com variedade (evita motivo único)
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
), assign_missing AS (
  SELECT DISTINCT ON (o.id) o.id, r.val
  FROM public.occurrences o
  CROSS JOIN reasons r
  WHERE o.possui_impedimento = true
    AND (o.motivo_impedimento IS NULL OR btrim(o.motivo_impedimento) = '')
  ORDER BY o.id, random()
)
UPDATE public.occurrences o
SET motivo_impedimento = a.val,
    updated_at = now()
FROM assign_missing a
WHERE o.id = a.id;

-- Re-randomizar onde todas ficaram iguais (ex.: "Equipe indisponível")
WITH reasons(val) AS (
  VALUES 
    ('Falta de Peças'),
    ('Sem acesso ao equipamento'),
    ('Dependência de terceiro'),
    ('Falha de energia elétrica'),
    ('Link de dados indisponível'),
    ('Aguardando peça em trânsito'),
    ('Janela de manutenção restrita'),
    ('Problemas de segurança no local'),
    ('Clima desfavorável')
), assign_change AS (
  SELECT DISTINCT ON (o.id) o.id, r.val
  FROM public.occurrences o
  JOIN reasons r ON r.val <> o.motivo_impedimento
  WHERE o.possui_impedimento = true
    AND o.motivo_impedimento = 'Equipe indisponível'
  ORDER BY o.id, random()
)
UPDATE public.occurrences o
SET motivo_impedimento = a.val,
    updated_at = now()
FROM assign_change a
WHERE o.id = a.id;