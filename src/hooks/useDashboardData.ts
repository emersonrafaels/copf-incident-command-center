import { useState, useEffect, useMemo, useCallback } from 'react'
import { formatHours } from '@/lib/timeUtils'
import { useFilters } from '@/contexts/FiltersContext'

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
  transportadora?: string // Hierarquia: transportadora > fornecedor para terceirizados
  tipoAgencia: string
  estado: string
  municipio: string
  dineg: string
  vip: boolean
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
  const { filterPeriod } = useFilters()

  // Dados mock responsivos ao período de filtro
  const generateMockData = useMemo(() => {
    // Definir multiplicador baseado no período
    const getPeriodMultiplier = (period: string) => {
      switch (period) {
        case '1-day': return 0.3
        case '7-days': return 1
        case '30-days': return 4.2
        case '90-days': return 12.5
        case '1-year': return 52
        default: return 1
      }
    }

    const multiplier = getPeriodMultiplier(filterPeriod)
    // Estrutura hierárquica completa
    const hierarchyStructure = [
      // SP - DINEG 2
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0001', '0015', '0032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0045', '0067', '0089'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0091', '0095'], tipo: 'terceirizada', vip: 'sim' },
      { estado: 'SP', municipio: 'Campinas', dineg: '2', agencias: ['0101', '0115', '0132'], tipo: 'pab', vip: 'sim' },
      { estado: 'SP', municipio: 'Santos', dineg: '2', agencias: ['0201', '0215'], tipo: 'pae', vip: 'nao' },
      { estado: 'SP', municipio: 'Guarulhos', dineg: '2', agencias: ['0301', '0315', '0320'], tipo: 'terceirizada', vip: 'nao' },
      
      // RJ - DINEG 4
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1001', '1015', '1032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1045', '1067'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1070', '1075', '1080'], tipo: 'terceirizada', vip: 'sim' },
      { estado: 'RJ', municipio: 'Niterói', dineg: '4', agencias: ['1101', '1115'], tipo: 'pab', vip: 'sim' },
      { estado: 'RJ', municipio: 'Campos dos Goytacazes', dineg: '4', agencias: ['1201'], tipo: 'pae', vip: 'nao' },
      { estado: 'RJ', municipio: 'Nova Iguaçu', dineg: '4', agencias: ['1401', '1410'], tipo: 'terceirizada', vip: 'nao' },
      
      // MG - DINEG 8
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2001', '2015', '2032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2045', '2067'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2070', '2075'], tipo: 'terceirizada', vip: 'sim' },
      { estado: 'MG', municipio: 'Uberlândia', dineg: '8', agencias: ['2101', '2115'], tipo: 'pab', vip: 'sim' },
      { estado: 'MG', municipio: 'Contagem', dineg: '8', agencias: ['2201'], tipo: 'pae', vip: 'nao' },
      { estado: 'MG', municipio: 'Juiz de Fora', dineg: '8', agencias: ['2301', '2315'], tipo: 'terceirizada', vip: 'nao' },
      
      // RS - DINEG 80
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3001', '3015'], tipo: 'convencional', vip: 'sim' },
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3032', '3045'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3050', '3055'], tipo: 'terceirizada', vip: 'sim' },
      { estado: 'RS', municipio: 'Caxias do Sul', dineg: '80', agencias: ['3101'], tipo: 'pab', vip: 'sim' },
      { estado: 'RS', municipio: 'Pelotas', dineg: '80', agencias: ['3201'], tipo: 'pae', vip: 'nao' },
      { estado: 'RS', municipio: 'Canoas', dineg: '80', agencias: ['3301', '3310'], tipo: 'terceirizada', vip: 'nao' },
      
      // BA - DINEG 3 (nova região)
      { estado: 'BA', municipio: 'Salvador', dineg: '3', agencias: ['4001', '4015', '4032'], tipo: 'convencional', vip: 'sim' },
      { estado: 'BA', municipio: 'Salvador', dineg: '3', agencias: ['4045', '4067', '4070'], tipo: 'terceirizada', vip: 'nao' },
      { estado: 'BA', municipio: 'Feira de Santana', dineg: '3', agencias: ['4101', '4115'], tipo: 'terceirizada', vip: 'sim' },
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

    // Lista de todos os fornecedores para garantir distribuição
    const allVendors = {
      AA: ['Diebold Nixdorf', 'NCR Corporation', 'Itautec'],
      AB: ['Dell Technologies', 'HP', 'Lenovo', 'Gertec', 'Bematech', 'Epson', 'Canon'],
      terceirizada: ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Fornecedor D', 'Fornecedor E', 'Fornecedor F', 'Fornecedor G', 'Fornecedor H']
    };

    let vendorRotationIndex = 0;

    // Gerar ocorrências baseadas na estrutura hierárquica
    hierarchyStructure.forEach((structure, groupIndex) => {
      structure.agencias.forEach((agencyNum, agencyIndex) => {
        // Número de ocorrências baseado no período
        let baseOccurrenceCount;
        if (structure.tipo === 'terceirizada') {
          baseOccurrenceCount = 10; // Base para terceirizadas
        } else {
          baseOccurrenceCount = 5; // Base para outras
        }
        
        const occurrenceCount = Math.max(1, Math.round(baseOccurrenceCount * multiplier))
        
        for (let i = 0; i < occurrenceCount; i++) {
          // Distribuição fixa entre segmentos AA e AB
          const segment = (i % 3 === 0) ? 'AB' : 'AA'; // 33% AB, 67% AA
          const equipmentList = equipmentsBySegment[segment];
          const equipment = equipmentList[i % equipmentList.length]; // Distribuição fixa
          
          // Determinar fornecedor baseado no tipo
          let vendor: string;
          let transportadora: string | undefined;
          
          if (structure.tipo === 'terceirizada') {
            // Para pontos terceirizados, definir transportadora de forma fixa
            transportadora = transportadoras[groupIndex % transportadoras.length];
            vendor = fornecedoresPorTransportadora[transportadora][i % fornecedoresPorTransportadora[transportadora].length];
          } else if (structure.tipo === 'convencional') {
            // Para pontos convencionais, distribuição fixa
            if (groupIndex % 3 === 0) {
              transportadora = 'Express Logística';
              vendor = 'Fornecedor A';
            } else {
              transportadora = transportadoras[groupIndex % transportadoras.length];
              vendor = fornecedoresPorTransportadora[transportadora][i % fornecedoresPorTransportadora[transportadora].length];
            }
          } else {
            // Para PAB/PAE usar fornecedores do segmento
            const segmentVendors = allVendors[segment];
            vendor = segmentVendors[vendorRotationIndex % segmentVendors.length];
            vendorRotationIndex++;
          }

          const occurrenceId = `COPF-2024-${String(groupIndex + 1).padStart(2, '0')}-${agencyNum}-${String(i + 1).padStart(3, '0')}`;
          
          // Status fixo baseado no índice para consistência
          const statuses = ['a_iniciar', 'em_andamento', 'encerrado', 'com_impedimentos', 'cancelado'];
          const status = statuses[i % statuses.length] as ('a_iniciar' | 'em_andamento' | 'encerrado' | 'com_impedimentos' | 'cancelado');
          
          // Data baseada no período e índice com algumas ocorrências criadas hoje
          const maxDaysAgo = filterPeriod === '1-day' ? 1 : 
                            filterPeriod === '7-days' ? 7 :
                            filterPeriod === '30-days' ? 30 :
                            filterPeriod === '90-days' ? 90 : 365;
          
          // 20% das ocorrências criadas hoje (índices 0, 5, 10, etc.)
          const isCreatedToday = i % 5 === 0;
          const daysAgo = isCreatedToday ? 0 : (i % maxDaysAgo) + 1;
          const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
          
          // Gerar resolvedAt para ocorrências encerradas de forma fixa
          let resolvedAt: string | undefined;
          if (status === 'encerrado') {
            const durationHours = (i % 48) + 1; // Entre 1 e 48 horas
            resolvedAt = new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000).toISOString();
          }

          // Descrições fixas baseadas no segmento e índice
          const descriptions = {
            AA: [
              'ATM não está dispensando cédulas - erro de hardware na gaveta',
              'ATM não aceita depósitos - problemas no mecanismo de captura',
              'Erro de conectividade com o servidor central',
              'Cassete com defeito no sensor de notas',
              'Falha na autenticação biométrica',
              'Problema no leitor de cartão magnético',
              'Display do ATM com falha na exibição',
              'Teclado numérico não responsivo'
            ],
            AB: [
              'Impressora com papel atolado constantemente',
              'Perda total de conectividade - link primário inoperante', 
              'Terminal não reconhece cartões chip',
              'Monitor com falha na exibição',
              'Teclado com teclas não responsivas',
              'Servidor com alta latência',
              'Scanner não consegue ler documentos',
              'Leitor biométrico não funciona',
              'Televisão sem sinal',
              'Classificadora com erro de contagem',
              'Notebook apresentando tela azul',
              'Desktop com lentidão extrema',
              'PIN PAD com botões travados'
            ]
          };

          // Severidade fixa baseada no índice
          const severities = ['critical', 'high', 'medium', 'low'];
          const severity = severities[i % severities.length] as ('critical' | 'high' | 'medium' | 'low');

          // Responsável fixo baseado no índice
          const assignees = ['João Silva - NOC', 'Maria Santos - Facilities', 'Carlos Oliveira - Redes', 'Ana Costa - POS', 'Roberto Lima - Suporte'];

          mockOccurrences.push({
            id: occurrenceId,
            agency: `AG${agencyNum} - Centro (${structure.municipio})`,
            segment,
            equipment,
            serialNumber: `${segment}${String(i + 1).padStart(3, '0')}-${structure.estado}-${agencyNum}`,
            description: descriptions[segment][i % descriptions[segment].length],
            severity,
            status,
            createdAt: createdAt.toISOString(),
            resolvedAt,
            assignedTo: assignees[i % assignees.length],
            vendor,
            transportadora: transportadora,
            tipoAgencia: structure.tipo,
            estado: structure.estado,
            municipio: structure.municipio,
            dineg: structure.dineg,
            vip: structure.vip === 'sim'
          });
        }
      });
    });

    // Adicionar algumas ocorrências reincidentes (10% do total)
    const reincidenceCount = Math.max(2, Math.round(mockOccurrences.length * 0.1));
    for (let i = 0; i < reincidenceCount; i++) {
      const originalOccurrence = mockOccurrences[i % mockOccurrences.length];
      
      // Criar reincidência com dados similares mas datas diferentes
      const reincidenceOccurrence = {
        ...originalOccurrence,
        id: `${originalOccurrence.id}-REC`,
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(), // Até 3 dias atrás
        status: ['a_iniciar', 'em_andamento', 'com_impedimentos'][Math.floor(Math.random() * 3)] as 'a_iniciar' | 'em_andamento' | 'com_impedimentos',
        resolvedAt: undefined
      };
      
      mockOccurrences.push(reincidenceOccurrence);
    }

    return mockOccurrences;
  }, [filterPeriod])


  // Regenerar dados quando o filtro de período mudar
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setOccurrences(generateMockData)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterPeriod, generateMockData])

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

  const timelineData: TimelineData[] = useMemo(() => {
    const multiplier = filterPeriod === '1-day' ? 0.3 : 
                      filterPeriod === '7-days' ? 1 :
                      filterPeriod === '30-days' ? 4.2 :
                      filterPeriod === '90-days' ? 12.5 : 52;

    return [
      { date: '01/01', ocorrencias: Math.round(45 * multiplier), resolvidas: Math.round(38 * multiplier) },
      { date: '02/01', ocorrencias: Math.round(52 * multiplier), resolvidas: Math.round(44 * multiplier) },
      { date: '03/01', ocorrencias: Math.round(48 * multiplier), resolvidas: Math.round(41 * multiplier) },
      { date: '04/01', ocorrencias: Math.round(61 * multiplier), resolvidas: Math.round(55 * multiplier) },
      { date: '05/01', ocorrencias: Math.round(55 * multiplier), resolvidas: Math.round(48 * multiplier) },
      { date: '06/01', ocorrencias: Math.round(67 * multiplier), resolvidas: Math.round(59 * multiplier) },
      { date: '07/01', ocorrencias: Math.round(59 * multiplier), resolvidas: Math.round(52 * multiplier) }
    ]
  }, [filterPeriod])

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
    const pendingCount = occurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_andamento').length
    
    // Calcular reincidências (mesmo motivo, mesmo equipamento, em até 4 dias)
    const reincidenceCount = occurrences.reduce((count, occurrence, index) => {
      const sameReasonEquipment = occurrences.filter((other, otherIndex) => 
        otherIndex !== index &&
        other.description === occurrence.description &&
        other.equipment === occurrence.equipment &&
        other.agency === occurrence.agency
      );
      
      if (sameReasonEquipment.length > 0) {
        const hasRecentRecurrence = sameReasonEquipment.some(other => {
          const daysDiff = Math.abs(new Date(occurrence.createdAt).getTime() - new Date(other.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 4;
        });
        
        if (hasRecentRecurrence) {
          return count + 1;
        }
      }
      return count;
    }, 0);
    
    // Calcular SLA em atraso
    const overdueCount = occurrences.filter(o => {
      if (o.status === 'encerrado') return false;
      const createdDate = new Date(o.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
      return hoursDiff > slaLimit;
    }).length;
    
    // Calcular agências afetadas e VIPs
    const affectedAgencies = new Set(occurrences.map(o => o.agency));
    const vipAgencies = Array.from(affectedAgencies).filter(agency => {
      const agencyNumber = agency.match(/\d+/)?.[0] || '0';
      return agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
    });
    
    return {
      totalOccurrences: totalCount,
      resolvedOccurrences: resolvedCount,
      pendingOccurrences: pendingCount,
      reincidenceCount,
      overdueCount,
      affectedAgencies: affectedAgencies.size,
      vipAgencies: vipAgencies.length,
      avgMTTR: formatHours(4.2),
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
        setOccurrences(generateMockData)
        setIsLoading(false)
      }, 500)
    }, [generateMockData])
  }
}