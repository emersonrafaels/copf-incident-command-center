-- Create table for occurrences
CREATE TABLE public.occurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agencia TEXT NOT NULL,
  equipamento TEXT NOT NULL,
  numero_serie TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'resolvida', 'com_impedimentos')),
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  fornecedor TEXT NOT NULL,
  segmento TEXT NOT NULL CHECK (segmento IN ('atm', 'pos', 'rede', 'datacenter')),
  uf TEXT NOT NULL,
  tipo_agencia TEXT NOT NULL CHECK (tipo_agencia IN ('tradicional', 'digital', 'prime')),
  vip BOOLEAN NOT NULL DEFAULT false,
  supt TEXT NOT NULL,
  override BOOLEAN NOT NULL DEFAULT false,
  prioridade_fornecedor TEXT,
  reincidencia BOOLEAN NOT NULL DEFAULT false,
  data_ocorrencia TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  data_limite_sla TIMESTAMP WITH TIME ZONE,
  usuario_responsavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to access all occurrences
-- (since this appears to be an internal management system)
CREATE POLICY "Allow all operations for authenticated users" 
ON public.occurrences 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_occurrences_updated_at
  BEFORE UPDATE ON public.occurrences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data to maintain current functionality
INSERT INTO public.occurrences (
  agencia, equipamento, numero_serie, descricao, status, prioridade, severidade,
  fornecedor, segmento, uf, tipo_agencia, vip, supt, override, prioridade_fornecedor,
  reincidencia, data_ocorrencia, data_limite_sla, usuario_responsavel
) VALUES 
('AG001', 'ATM Diebold', 'ATM001', 'Display não liga', 'pendente', 'alta', 'alta', 'Diebold', 'atm', 'SP', 'tradicional', true, 'SUPT-SP', false, 'alta', false, now() - interval '2 hours', now() + interval '22 hours', 'João Silva'),
('AG002', 'POS Ingenico', 'POS001', 'Não aceita cartão', 'em_andamento', 'critica', 'critica', 'Ingenico', 'pos', 'RJ', 'digital', false, 'SUPT-RJ', false, 'critica', true, now() - interval '4 hours', now() + interval '20 hours', 'Maria Santos'),
('AG003', 'Switch Cisco', 'SW001', 'Porta com falha', 'resolvida', 'media', 'media', 'Cisco', 'rede', 'MG', 'prime', false, 'SUPT-MG', false, 'media', false, now() - interval '1 day', now() - interval '2 hours', 'Pedro Costa'),
('AG004', 'Servidor Dell', 'SRV001', 'Alto consumo CPU', 'com_impedimentos', 'alta', 'alta', 'Dell', 'datacenter', 'SP', 'tradicional', true, 'SUPT-SP', true, 'baixa', false, now() - interval '6 hours', now() + interval '18 hours', 'Ana Lima'),
('AG005', 'ATM NCR', 'ATM002', 'Problema na impressora', 'pendente', 'media', 'media', 'NCR', 'atm', 'RS', 'digital', false, 'SUPT-RS', false, null, false, now() - interval '1 hour', now() + interval '23 hours', 'Carlos Mendes');