-- Create occurrences table to support dashboard
create extension if not exists pgcrypto;

create table if not exists public.occurrences (
  id uuid primary key default gen_random_uuid(),
  agencia text not null,
  equipamento text not null,
  numero_serie text,
  descricao text,
  motivo_ocorrencia text,
  status text not null,
  prioridade text,
  severidade text not null,
  fornecedor text,
  transportadora text,
  segmento text not null,
  uf text,
  tipo_agencia text,
  vip boolean not null default false,
  supt text,
  data_ocorrencia timestamptz not null default now(),
  data_resolucao timestamptz,
  data_previsao_encerramento timestamptz,
  data_encerramento timestamptz,
  data_limite_sla timestamptz,
  usuario_responsavel text,
  reincidencia boolean not null default false,
  status_equipamento text default 'operante',
  possui_impedimento boolean not null default false,
  motivo_impedimento text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint occurrences_status_check check (status in ('pendente','em_andamento','resolvida','com_impedimentos','cancelado')),
  constraint occurrences_severidade_check check (severidade in ('baixa','media','alta','critica')),
  constraint occurrences_segmento_check check (segmento in ('atm','pos','rede','datacenter'))
);

-- Enable RLS
alter table public.occurrences enable row level security;

-- Read-only public access for now (demo). Only allow SELECT.
create policy if not exists "Occurrences are readable by anyone"
  on public.occurrences
  for select
  using (true);

-- Do not allow writes by default; no insert/update/delete policies are created.

-- Trigger to maintain updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_occurrences_updated_at
before update on public.occurrences
for each row execute function public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_occurrences_data_ocorrencia on public.occurrences (data_ocorrencia desc);
create index if not exists idx_occurrences_status on public.occurrences (status);
create index if not exists idx_occurrences_severidade on public.occurrences (severidade);
create index if not exists idx_occurrences_segmento on public.occurrences (segmento);
create index if not exists idx_occurrences_agencia on public.occurrences (agencia);
