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

  // Dados mock estáticos para garantir compatibilidade dashboard/ocorrências
  const generateMockData = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

    const staticOccurrences: OccurrenceData[] = [
      // Ocorrências que entraram hoje (5 total)
      {
        id: 'COPF-2024-001',
        agency: 'AG0001 - Centro (São Paulo)',
        segment: 'AA',
        equipment: 'ATM Saque',
        serialNumber: 'AA001-SP-0001',
        description: 'ATM não está dispensando cédulas - erro de hardware na gaveta',
        severity: 'critical',
        status: 'a_iniciar',
        createdAt: today.toISOString(),
        assignedTo: 'João Silva - NOC',
        vendor: 'Diebold Nixdorf',
        tipoAgencia: 'convencional',
        estado: 'SP',
        municipio: 'São Paulo',
        dineg: '2',
        vip: true
      },
      {
        id: 'COPF-2024-002',
        agency: 'AG0015 - Centro (São Paulo)',
        segment: 'AB',
        equipment: 'Impressora',
        serialNumber: 'AB002-SP-0015',
        description: 'Impressora com papel atolado constantemente',
        severity: 'high',
        status: 'em_andamento',
        createdAt: today.toISOString(),
        assignedTo: 'Maria Santos - Facilities',
        vendor: 'HP',
        tipoAgencia: 'convencional',
        estado: 'SP',
        municipio: 'São Paulo',
        dineg: '2',
        vip: true
      },
      {
        id: 'COPF-2024-003',
        agency: 'AG1001 - Centro (Rio de Janeiro)',
        segment: 'AA',
        equipment: 'ATM Depósito',
        serialNumber: 'AA003-RJ-1001',
        description: 'ATM não aceita depósitos - problemas no mecanismo de captura',
        severity: 'high',
        status: 'com_impedimentos',
        createdAt: today.toISOString(),
        assignedTo: 'Carlos Oliveira - Redes',
        vendor: 'NCR Corporation',
        tipoAgencia: 'convencional',
        estado: 'RJ',
        municipio: 'Rio de Janeiro',
        dineg: '4',
        vip: true
      },
      {
        id: 'COPF-2024-004',
        agency: 'AG2001 - Centro (Belo Horizonte)',
        segment: 'AB',
        equipment: 'Desktop',
        serialNumber: 'AB004-MG-2001',
        description: 'Desktop com lentidão extrema',
        severity: 'medium',
        status: 'em_andamento',
        createdAt: today.toISOString(),
        assignedTo: 'Ana Costa - POS',
        vendor: 'Dell Technologies',
        tipoAgencia: 'convencional',
        estado: 'MG',
        municipio: 'Belo Horizonte',
        dineg: '8',
        vip: true
      },
      {
        id: 'COPF-2024-005',
        agency: 'AG3001 - Centro (Porto Alegre)',
        segment: 'AB',
        equipment: 'Monitor LCD/LED',
        serialNumber: 'AB005-RS-3001',
        description: 'Monitor com falha na exibição',
        severity: 'low',
        status: 'a_iniciar',
        createdAt: today.toISOString(),
        assignedTo: 'Roberto Lima - Suporte',
        vendor: 'Dell Technologies',
        tipoAgencia: 'convencional',
        estado: 'RS',
        municipio: 'Porto Alegre',
        dineg: '80',
        vip: true
      },

      // Ocorrências pendentes antigas (8 total - incluindo as 5 de hoje)
      {
        id: 'COPF-2024-006',
        agency: 'AG0045 - Centro (São Paulo)',
        segment: 'AA',
        equipment: 'Cassete',
        serialNumber: 'AA006-SP-0045',
        description: 'Cassete com defeito no sensor de notas',
        severity: 'critical',
        status: 'em_andamento',
        createdAt: yesterday.toISOString(),
        assignedTo: 'João Silva - NOC',
        vendor: 'Diebold Nixdorf',
        transportadora: 'Express Logística',
        tipoAgencia: 'terceirizada',
        estado: 'SP',
        municipio: 'São Paulo',
        dineg: '2',
        vip: false
      },
      {
        id: 'COPF-2024-007',
        agency: 'AG1045 - Centro (Rio de Janeiro)',
        segment: 'AB',
        equipment: 'Notebook',
        serialNumber: 'AB007-RJ-1045',
        description: 'Notebook apresentando tela azul',
        severity: 'high',
        status: 'com_impedimentos',
        createdAt: twoDaysAgo.toISOString(),
        assignedTo: 'Maria Santos - Facilities',
        vendor: 'Fornecedor A',
        transportadora: 'Express Logística',
        tipoAgencia: 'terceirizada',
        estado: 'RJ',
        municipio: 'Rio de Janeiro',
        dineg: '4',
        vip: false
      },
      {
        id: 'COPF-2024-008',
        agency: 'AG2045 - Centro (Belo Horizonte)',
        segment: 'AB',
        equipment: 'Leitor biométrico',
        serialNumber: 'AB008-MG-2045',
        description: 'Leitor biométrico não funciona',
        severity: 'medium',
        status: 'a_iniciar',
        createdAt: threeDaysAgo.toISOString(),
        assignedTo: 'Carlos Oliveira - Redes',
        vendor: 'Fornecedor B',
        transportadora: 'Express Logística',
        tipoAgencia: 'terceirizada',
        estado: 'MG',
        municipio: 'Belo Horizonte',
        dineg: '8',
        vip: false
      },

      // Ocorrências resolvidas (4 total)
      {
        id: 'COPF-2024-009',
        agency: 'AG0067 - Centro (São Paulo)',
        segment: 'AA',
        equipment: 'ATM Saque',
        serialNumber: 'AA009-SP-0067',
        description: 'Problema no leitor de cartão magnético',
        severity: 'high',
        status: 'encerrado',
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Ana Costa - POS',
        vendor: 'Itautec',
        transportadora: 'TechTransporte',
        tipoAgencia: 'terceirizada',
        estado: 'SP',
        municipio: 'São Paulo',
        dineg: '2',
        vip: false
      },
      {
        id: 'COPF-2024-010',
        agency: 'AG1067 - Centro (Rio de Janeiro)',
        segment: 'AB',
        equipment: 'Scanner de Cheque',
        serialNumber: 'AB010-RJ-1067',
        description: 'Scanner não consegue ler documentos',
        severity: 'medium',
        status: 'encerrado',
        createdAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Roberto Lima - Suporte',
        vendor: 'Fornecedor D',
        transportadora: 'TechTransporte',
        tipoAgencia: 'terceirizada',
        estado: 'RJ',
        municipio: 'Rio de Janeiro',
        dineg: '4',
        vip: false
      },
      {
        id: 'COPF-2024-011',
        agency: 'AG2067 - Centro (Belo Horizonte)',
        segment: 'AB',
        equipment: 'Impressora térmica',
        serialNumber: 'AB011-MG-2067',
        description: 'Impressora com papel atolado constantemente',
        severity: 'low',
        status: 'encerrado',
        createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'João Silva - NOC',
        vendor: 'Fornecedor E',
        transportadora: 'TechTransporte',
        tipoAgencia: 'terceirizada',
        estado: 'MG',
        municipio: 'Belo Horizonte',
        dineg: '8',
        vip: false
      },
      {
        id: 'COPF-2024-012',
        agency: 'AG3045 - Centro (Porto Alegre)',
        segment: 'AA',
        equipment: 'ATM Depósito',
        serialNumber: 'AA012-RS-3045',
        description: 'Erro de conectividade com o servidor central',
        severity: 'critical',
        status: 'encerrado',
        createdAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Maria Santos - Facilities',
        vendor: 'Fornecedor F',
        transportadora: 'LogiCorp',
        tipoAgencia: 'terceirizada',
        estado: 'RS',
        municipio: 'Porto Alegre',
        dineg: '80',
        vip: false
      },

      // Reincidências (3 total - mesmo equipamento, agência e descrição)
      {
        id: 'COPF-2024-013',
        agency: 'AG0001 - Centro (São Paulo)',
        segment: 'AA',
        equipment: 'ATM Saque',
        serialNumber: 'AA013-SP-0001',
        description: 'ATM não está dispensando cédulas - erro de hardware na gaveta',
        severity: 'high',
        status: 'em_andamento',
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Carlos Oliveira - Redes',
        vendor: 'Diebold Nixdorf',
        tipoAgencia: 'convencional',
        estado: 'SP',
        municipio: 'São Paulo',
        dineg: '2',
        vip: true
      },
      {
        id: 'COPF-2024-014',
        agency: 'AG0015 - Centro (São Paulo)',
        segment: 'AB',
        equipment: 'Impressora',
        serialNumber: 'AB014-SP-0015',
        description: 'Impressora com papel atolado constantemente',
        severity: 'medium',
        status: 'a_iniciar',
        createdAt: yesterday.toISOString(),
        assignedTo: 'Ana Costa - POS',
        vendor: 'HP',
        tipoAgencia: 'convencional',
        estado: 'SP',
        municipio: 'São Paulo',
        dineg: '2',
        vip: true
      },
      {
        id: 'COPF-2024-015',
        agency: 'AG2067 - Centro (Belo Horizonte)',
        segment: 'AB',
        equipment: 'Impressora térmica',
        serialNumber: 'AB015-MG-2067',
        description: 'Impressora com papel atolado constantemente',
        severity: 'low',
        status: 'com_impedimentos',
        createdAt: twoDaysAgo.toISOString(),
        assignedTo: 'Roberto Lima - Suporte',
        vendor: 'Fornecedor E',
        transportadora: 'TechTransporte',
        tipoAgencia: 'terceirizada',
        estado: 'MG',
        municipio: 'Belo Horizonte',
        dineg: '8',
        vip: false
      },

      // SLA em atraso (2 total - criadas há mais de 24h e ainda pendentes)
      {
        id: 'COPF-2024-016',
        agency: 'AG4001 - Centro (Salvador)',
        segment: 'AA',
        equipment: 'ATM Saque',
        serialNumber: 'AA016-BA-4001',
        description: 'Display do ATM com falha na exibição',
        severity: 'critical',
        status: 'em_andamento',
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás - SLA vencido
        assignedTo: 'João Silva - NOC',
        vendor: 'Diebold Nixdorf',
        tipoAgencia: 'convencional',
        estado: 'BA',
        municipio: 'Salvador',
        dineg: '3',
        vip: true
      },
      {
        id: 'COPF-2024-017',
        agency: 'AG4015 - Centro (Salvador)',
        segment: 'AB',
        equipment: 'PIN PAD',
        serialNumber: 'AB017-BA-4015',
        description: 'PIN PAD com botões travados',
        severity: 'high',
        status: 'a_iniciar',
        createdAt: new Date(today.getTime() - 30 * 60 * 60 * 1000).toISOString(), // 30 horas atrás - SLA vencido
        assignedTo: 'Maria Santos - Facilities',
        vendor: 'Gertec',
        tipoAgencia: 'convencional',
        estado: 'BA',
        municipio: 'Salvador',
        dineg: '3',
        vip: true
      }
    ];

    return staticOccurrences;
  }, [])

  // Regenerar dados quando o filtro de período mudar
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setOccurrences(generateMockData)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [generateMockData])

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