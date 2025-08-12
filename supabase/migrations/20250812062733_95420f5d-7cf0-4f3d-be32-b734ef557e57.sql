-- 1) Preencher motivos ausentes com valor aleatório por linha (LATERAL garante aleatoriedade por linha)
UPDATE public.occurrences o
SET motivo_impedimento = v.val,
    updated_at = now()
FROM LATERAL (
  SELECT val FROM (
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
  ) AS vals(val)
  ORDER BY random()
  LIMIT 1
) v
WHERE o.possui_impedimento = true
  AND (o.motivo_impedimento IS NULL OR btrim(o.motivo_impedimento) = '');

-- 2) Re-randomizar onde o motivo ficou igual para todos (ex.: "Equipe indisponível").
--    Escolhe qualquer outro motivo diferente do atual por linha
UPDATE public.occurrences o
SET motivo_impedimento = v.val,
    updated_at = now()
FROM LATERAL (
  SELECT val FROM (
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
  ) AS vals(val)
  WHERE val <> o.motivo_impedimento
  ORDER BY random()
  LIMIT 1
) v
WHERE o.possui_impedimento = true
  AND o.motivo_impedimento = 'Equipe indisponível';