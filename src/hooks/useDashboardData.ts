import { useState, useEffect, useMemo, useCallback } from 'react'

export interface OccurrenceData {
  id: string
  agency: string
  segment: 'AA' | 'AB'
  equipment: string
  serialNumber: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'a_iniciar' | 'em_atuacao' | 'encerrada' | 'cancelada'
  createdAt: string
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
    // Equipamentos por segmento
    const equipmentsBySegment = {
      AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
      AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
    };

    // Array para rastrear números de agência já usados
    const usedAgencyNumbers = new Set<string>();
    
    const getUniqueAgencyNumber = (): string => {
      let agencyNum: string;
      do {
        agencyNum = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
      } while (usedAgencyNumbers.has(agencyNum));
      usedAgencyNumbers.add(agencyNum);
      return agencyNum;
    };

    const mockOccurrences: OccurrenceData[] = [
      {
        id: "COPF-2024-001",
        agency: "AG0001 - Centro (São Paulo)",
        segment: "AA",
        equipment: "ATM Saque",
        serialNumber: "ATM001-SP-001",
        description: "ATM não está dispensando cédulas - erro de hardware na gaveta",
        severity: "critical",
        status: "em_atuacao",
        createdAt: "2024-01-15T08:30:00",
        assignedTo: "João Silva - NOC",
        vendor: "Diebold Nixdorf"
      },
      {
        id: "COPF-2024-002",
        agency: "AG0015 - Paulista (São Paulo)",
        segment: "AB",
        equipment: "Impressora térmica",
        serialNumber: "IMP002-SP-015",
        description: "Impressora com papel atolado constantemente",
        severity: "high",
        status: "a_iniciar",
        createdAt: "2024-01-15T09:15:00",
        assignedTo: "Maria Santos - Facilities",
        vendor: "Bematech"
      },
      {
        id: "COPF-2024-003",
        agency: "AG0032 - Vila Madalena (São Paulo)",
        segment: "AB",
        equipment: "Servidor",
        serialNumber: "SRV003-SP-032",
        description: "Perda total de conectividade - link primário inoperante",
        severity: "high",
        status: "em_atuacao",
        createdAt: "2024-01-14T14:20:00",
        assignedTo: "Carlos Oliveira - Redes",
        vendor: "Dell Technologies"
      },
      {
        id: "COPF-2024-004",
        agency: "AG0045 - Pinheiros (São Paulo)",
        segment: "AB",
        equipment: "PIN PAD",
        serialNumber: "PIN004-SP-045",
        description: "Terminal não reconhece cartões chip",
        severity: "medium",
        status: "encerrada",
        createdAt: "2024-01-14T11:00:00",
        assignedTo: "Ana Costa - POS",
        vendor: "Gertec"
      },
      {
        id: "COPF-2024-005",
        agency: "AG0067 - Moema (São Paulo)",
        segment: "AA",
        equipment: "ATM Depósito",
        serialNumber: "ATM005-SP-067",
        description: "ATM não aceita depósitos - problemas no mecanismo de captura",
        severity: "low",
        status: "a_iniciar",
        createdAt: "2024-01-13T16:45:00",
        assignedTo: "Roberto Lima - Suporte",
        vendor: "NCR Corporation"
      }
    ]

    // Gerar ocorrências do segmento AA (reduzido para 400 para otimização)
    const aaOccurrences = Array.from({ length: 400 }, (_, i) => {
      const equipmentList = equipmentsBySegment.AA;
      const equipment = equipmentList[Math.floor(Math.random() * equipmentList.length)];
      const agencyNum = getUniqueAgencyNumber();
      
      return {
        id: `COPF-2024-AA-${String(i + 1).padStart(4, '0')}`,
        agency: `AG${agencyNum} - ${['Centro', 'Paulista', 'Vila Madalena', 'Pinheiros', 'Moema', 'Itaim', 'Brooklin', 'Vila Olímpia', 'Jardins', 'Liberdade'][Math.floor(Math.random() * 10)]} (São Paulo)`,
        segment: 'AA' as const,
        equipment,
        serialNumber: `AA${String(i + 1).padStart(4, '0')}-SP-${agencyNum}`,
        description: [
          'ATM não está dispensando cédulas - erro de hardware na gaveta',
          'ATM não aceita depósitos - problemas no mecanismo de captura',
          'Erro de conectividade com o servidor central',
          'Cassete com defeito no sensor de notas',
          'Falha na autenticação biométrica',
          'Problema no leitor de cartão magnético'
        ][Math.floor(Math.random() * 6)],
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as ('critical' | 'high' | 'medium' | 'low'),
        status: ['a_iniciar', 'em_atuacao', 'encerrada', 'cancelada'][Math.floor(Math.random() * 4)] as ('a_iniciar' | 'em_atuacao' | 'encerrada' | 'cancelada'),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: ['João Silva - NOC', 'Maria Santos - Facilities', 'Carlos Oliveira - Redes', 'Ana Costa - POS', 'Roberto Lima - Suporte'][Math.floor(Math.random() * 5)],
        vendor: ['Diebold Nixdorf', 'NCR Corporation', 'Itautec'][Math.floor(Math.random() * 3)]
      }
    });

    // Gerar ocorrências do segmento AB (reduzido para 100 para otimização)
    const abOccurrences = Array.from({ length: 100 }, (_, i) => {
      const equipmentList = equipmentsBySegment.AB;
      const equipment = equipmentList[Math.floor(Math.random() * equipmentList.length)];
      const agencyNum = getUniqueAgencyNumber();
      
      return {
        id: `COPF-2024-AB-${String(i + 1).padStart(4, '0')}`,
        agency: `AG${agencyNum} - ${['Centro', 'Paulista', 'Vila Madalena', 'Pinheiros', 'Moema', 'Itaim', 'Brooklin', 'Vila Olímpia', 'Jardins', 'Liberdade'][Math.floor(Math.random() * 10)]} (São Paulo)`,
        segment: 'AB' as const,
        equipment,
        serialNumber: `AB${String(i + 1).padStart(4, '0')}-SP-${agencyNum}`,
        description: [
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
        status: ['a_iniciar', 'em_atuacao', 'encerrada', 'cancelada'][Math.floor(Math.random() * 4)] as ('a_iniciar' | 'em_atuacao' | 'encerrada' | 'cancelada'),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: ['João Silva - NOC', 'Maria Santos - Facilities', 'Carlos Oliveira - Redes', 'Ana Costa - POS', 'Roberto Lima - Suporte'][Math.floor(Math.random() * 5)],
        vendor: ['Dell Technologies', 'HP', 'Lenovo', 'Gertec', 'Bematech', 'Epson', 'Canon'][Math.floor(Math.random() * 7)]
      }
    });

    const additionalOccurrences = [...aaOccurrences, ...abOccurrences];

    return [...mockOccurrences, ...additionalOccurrences]
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
    const resolvedCount = occurrences.filter(o => o.status === 'encerrada').length
    const totalCount = occurrences.length
    
    return {
      totalOccurrences: totalCount,
      resolvedOccurrences: resolvedCount,
      pendingOccurrences: occurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_atuacao').length,
      avgMTTR: '4.2h',
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