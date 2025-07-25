import { useState, useEffect, useMemo, useCallback } from 'react'
import { formatHours } from '@/lib/timeUtils'

export interface OccurrenceData {
  id: string
  agency: string
  segment: 'AA' | 'AB'
  equipment: string
  serialNumber: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'a_iniciar' | 'em_andamento' | 'encerrado' | 'com_impedimentos' | 'cancelado'
  createdAt: string
  resolvedAt?: string
  assignedTo: string
  vendor: string
}

export interface ChartData {
  name: string
  value: number
  fill: string
}

export interface TimelineData {
  date: string
  ocorrencias: number
  resolvidas: number
}

export interface MTTRData {
  mes: string
  mttr: number
}

export function useDashboardData() {
  const [occurrences, setOccurrences] = useState<OccurrenceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dados mock mais realistas - Memoizado para performance
  const generateMockData = useCallback(() => {
    // Estrutura hierárquica completa
    const hierarchyStructure = [
      // SP - DINEG 2
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0001', '0015', '0032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0045', '0067', '0089'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'SP', municipio: 'Campinas', dineg: '2', agencias: ['0101', '0115', '0132'], tipo: 'pab', vip: 'sim' },
      { estado: 'SP', municipio: 'Santos', dineg: '2', agencias: ['0201', '0215'], tipo: 'pae', vip: 'nao' },
      
      // RJ - DINEG 4
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1001', '1015', '1032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1045', '1067'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'RJ', municipio: 'Niterói', dineg: '4', agencias: ['1101', '1115'], tipo: 'pab', vip: 'sim' },
      { estado: 'RJ', municipio: 'Campos dos Goytacazes', dineg: '4', agencias: ['1201'], tipo: 'pae', vip: 'nao' },
      
      // MG - DINEG 8
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2001', '2015', '2032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2045', '2067'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'MG', municipio: 'Uberlândia', dineg: '8', agencias: ['2101', '2115'], tipo: 'pab', vip: 'sim' },
      { estado: 'MG', municipio: 'Contagem', dineg: '8', agencias: ['2201'], tipo: 'pae', vip: 'nao' },
      
      // RS - DINEG 80
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3001', '3015'], tipo: 'convencional', vip: 'sim' },
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3032', '3045'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'RS', municipio: 'Caxias do Sul', dineg: '80', agencias: ['3101'], tipo: 'pab', vip: 'sim' },
      { estado: 'RS', municipio: 'Pelotas', dineg: '80', agencias: ['3201'], tipo: 'pae', vip: 'nao' }
    ];

    // Equipamentos por segmento
    const equipmentsBySegment = {
      AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
      AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
    };

    // Transportadoras por tipo terceirizada
    const transportadoras = ['Express Logística', 'TechTransporte', 'LogiCorp'];
    const fornecedoresPorTransportadora = {
      'Express Logística': ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
      'TechTransporte': ['Fornecedor D', 'Fornecedor E'],
      'LogiCorp': ['Fornecedor F', 'Fornecedor G', 'Fornecedor H']
    };

    const mockOccurrences: OccurrenceData[] = [];

    // Gerar ocorrências baseadas na estrutura hierárquica
    hierarchyStructure.forEach((structure, groupIndex) => {
      const isSegmentAA = Math.random() < 0.8; // 80% AA, 20% AB
      const segment = isSegmentAA ? 'AA' : 'AB';
      const equipmentList = equipmentsBySegment[segment];
      
      // Determinar fornecedor baseado no tipo
      let vendor: string;
      let transportadora = '';
      
      if (structure.tipo === 'terceirizada') {
        transportadora = transportadoras[Math.floor(Math.random() * transportadoras.length)];
        const fornecedores = fornecedoresPorTransportadora[transportadora];
        vendor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
      } else {
        vendor = segment === 'AA' 
          ? ['Diebold Nixdorf', 'NCR Corporation', 'Itautec'][Math.floor(Math.random() * 3)]
          : ['Dell Technologies', 'HP', 'Lenovo', 'Gertec', 'Bematech', 'Epson', 'Canon'][Math.floor(Math.random() * 7)];
      }

      structure.agencias.forEach((agencyNum, agencyIndex) => {
        // Gerar 3-8 ocorrências por agência
        const occurrenceCount = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < occurrenceCount; i++) {
          const equipment = equipmentList[Math.floor(Math.random() * equipmentList.length)];
          const occurrenceId = `COPF-2024-${String(groupIndex + 1).padStart(2, '0')}-${agencyNum}-${String(i + 1).padStart(3, '0')}`;
          
          const status = ['a_iniciar', 'em_andamento', 'encerrado', 'com_impedimentos', 'cancelado'][Math.floor(Math.random() * 5)] as ('a_iniciar' | 'em_andamento' | 'encerrado' | 'com_impedimentos' | 'cancelado');
          const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
          
          // Gerar resolvedAt para ocorrências encerradas com distribuição Long Tail realística
          let resolvedAt: string | undefined;
          if (status === 'encerrado') {
            // Distribuição Long Tail: maioria resolvida rápido, alguns outliers
            const randomValue = Math.random();
            let durationHours: number;
            
            if (randomValue < 0.4) { // 40% resolvidas em até 2h
              durationHours = Math.random() * 2;
            } else if (randomValue < 0.7) { // 30% entre 2-8h  
              durationHours = 2 + Math.random() * 6;
            } else if (randomValue < 0.9) { // 20% entre 8-24h
              durationHours = 8 + Math.random() * 16;
            } else if (randomValue < 0.98) { // 8% entre 1-5 dias
              durationHours = 24 + Math.random() * 96;
            } else { // 2% acima de 5 dias (Long do Long Tail)
              durationHours = 120 + Math.random() * 240; // 5-15 dias
            }
            
            resolvedAt = new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000).toISOString();
          }

          mockOccurrences.push({
            id: occurrenceId,
            agency: `AG${agencyNum} - Centro (${structure.municipio})`,
            segment,
            equipment,
            serialNumber: `${segment}${String(i + 1).padStart(3, '0')}-${structure.estado}-${agencyNum}`,
            description: segment === 'AA' 
              ? [
                  'ATM não está dispensando cédulas - erro de hardware na gaveta',
                  'ATM não aceita depósitos - problemas no mecanismo de captura',
                  'Erro de conectividade com o servidor central',
                  'Cassete com defeito no sensor de notas',
                  'Falha na autenticação biométrica',
                  'Problema no leitor de cartão magnético'
                ][Math.floor(Math.random() * 6)]
              : [
                  'Impressora com papel atolado constantemente',
                  'Perda total de conectividade - link primário inoperante', 
                  'Terminal não reconhece cartões chip',
                  'Monitor com falha na exibição',
                  'Teclado com teclas não responsivas',
                  'Servidor com alta latência',
                  'Scanner não consegue ler documentos',
                  'Leitor biométrico não funciona',
                  'Televisão sem sinal',
                  'Classificadora com erro de contagem'
                ][Math.floor(Math.random() * 10)],
            severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as ('critical' | 'high' | 'medium' | 'low'),
            status,
            createdAt: createdAt.toISOString(),
            resolvedAt,
            assignedTo: ['João Silva - NOC', 'Maria Santos - Facilities', 'Carlos Oliveira - Redes', 'Ana Costa - POS', 'Roberto Lima - Suporte'][Math.floor(Math.random() * 5)],
            vendor
          });
        }
      });
    });

    return mockOccurrences;
  }, [])

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setOccurrences(generateMockData())
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Dados processados para gráficos - Memoizados para performance
  const severityData: ChartData[] = useMemo(() => [
    {
      name: 'Crítico',
      value: occurrences.filter(o => o.severity === 'critical').length,
      fill: 'hsl(var(--destructive))'
    },
    {
      name: 'Alto',
      value: occurrences.filter(o => o.severity === 'high').length,
      fill: 'hsl(var(--warning))'
    },
    {
      name: 'Médio',
      value: occurrences.filter(o => o.severity === 'medium').length,
      fill: 'hsl(var(--primary))'
    },
    {
      name: 'Baixo',
      value: occurrences.filter(o => o.severity === 'low').length,
      fill: 'hsl(var(--muted-foreground))'
    }
  ], [occurrences])

  const timelineData: TimelineData[] = [
    { date: '01/01', ocorrencias: 45, resolvidas: 38 },
    { date: '02/01', ocorrencias: 52, resolvidas: 44 },
    { date: '03/01', ocorrencias: 48, resolvidas: 41 },
    { date: '04/01', ocorrencias: 61, resolvidas: 55 },
    { date: '05/01', ocorrencias: 55, resolvidas: 48 },
    { date: '06/01', ocorrencias: 67, resolvidas: 59 },
    { date: '07/01', ocorrencias: 59, resolvidas: 52 }
  ]

  const mttrData: MTTRData[] = [
    { mes: 'Jul', mttr: 5.2 },
    { mes: 'Ago', mttr: 4.8 },
    { mes: 'Set', mttr: 4.5 },
    { mes: 'Out', mttr: 4.1 },
    { mes: 'Nov', mttr: 3.9 },
    { mes: 'Dez', mttr: 4.2 }
  ]

  // Dados dos equipamentos baseados nos segmentos AA e AB mapeados - Memoizados
  const equipmentData: ChartData[] = useMemo(() => [
    { 
      name: 'Segmento AA', 
      value: occurrences.filter(o => o.segment === 'AA').length, 
      fill: 'hsl(var(--primary))' 
    },
    { 
      name: 'Segmento AB', 
      value: occurrences.filter(o => o.segment === 'AB').length, 
      fill: 'hsl(var(--warning))' 
    }
  ], [occurrences])

  const metrics = useMemo(() => {
    const resolvedCount = occurrences.filter(o => o.status === 'encerrado').length
    const totalCount = occurrences.length
    
    return {
      totalOccurrences: totalCount,
      resolvedOccurrences: resolvedCount,
      pendingOccurrences: occurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_andamento').length,
      avgMTTR: formatHours(4.2),
      affectedAgencies: new Set(occurrences.map(o => o.agency)).size,
      resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0
    }
  }, [occurrences])

  return {
    occurrences,
    isLoading,
    severityData,
    timelineData,
    mttrData,
    equipmentData,
    metrics,
    refreshData: useCallback(() => {
      setIsLoading(true)
      setTimeout(() => {
        setOccurrences(generateMockData())
        setIsLoading(false)
      }, 500)
    }, [generateMockData])
  }
}