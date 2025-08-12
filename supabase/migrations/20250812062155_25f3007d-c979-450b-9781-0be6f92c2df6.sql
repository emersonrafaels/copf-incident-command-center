-- Preencher motivo_impedimento faltante em ocorrências que já possuem impedimento
UPDATE public.occurrences
SET motivo_impedimento = (
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
  ) AS v(val)
  ORDER BY random() LIMIT 1
),
updated_at = now()
WHERE public.occurrences.possui_impedimento = true
  AND (public.occurrences.motivo_impedimento IS NULL OR btrim(public.occurrences.motivo_impedimento) = '');

-- Marcar aleatoriamente ~25% das ocorrências abertas/ativas como com impedimento e atribuir um motivo
UPDATE public.occurrences
SET possui_impedimento = true,
    motivo_impedimento = (
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
      ) AS v(val)
      ORDER BY random() LIMIT 1
    ),
    updated_at = now()
WHERE public.occurrences.possui_impedimento = false
  AND (
    public.occurrences.status IS NULL 
    OR lower(public.occurrences.status) NOT IN ('encerrada', 'fechada')
  )
  AND random() < 0.25;