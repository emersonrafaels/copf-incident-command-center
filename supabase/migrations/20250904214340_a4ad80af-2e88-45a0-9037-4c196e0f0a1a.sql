-- Atualizar fornecedores/responsáveis para os novos nomes especificados
UPDATE public.occurrences 
SET fornecedor = (
  ARRAY['STM', 'NCR', 'Diebold', 'Ariz', 'Azmachi', 'Lexmark', 'Nextvision', 'Protege', 'Tbforte', 'Prosegur', 'Brinks', 'Tecban']
)[floor(random() * 12 + 1)];

-- Também atualizar o campo usuario_responsavel se existir
UPDATE public.occurrences 
SET usuario_responsavel = (
  ARRAY['STM', 'NCR', 'Diebold', 'Ariz', 'Azmachi', 'Lexmark', 'Nextvision', 'Protege', 'Tbforte', 'Prosegur', 'Brinks', 'Tecban']
)[floor(random() * 12 + 1)]
WHERE usuario_responsavel IS NOT NULL;