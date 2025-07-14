import { useState, useEffect } from 'react'

export interface OccurrenceData {
  id: string
  agency: string
  segment: 'AA' | 'AB'
  equipment: string
  serialNumber: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'pending' | 'resolved'
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

  // Dados mock mais realistas
  const generateMockData = () => {
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
        agencyNum = String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0');
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
        status: "active",
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
        status: "pending",
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
        status: "active",
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
        status: "resolved",
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
        status: "pending",
        createdAt: "2024-01-13T16:45:00",
        assignedTo: "Roberto Lima - Suporte",
        vendor: "NCR Corporation"
      }
    ]

    // Simular chegada de novas ocorrências
    const additionalOccurrences = Array.from({ length: 15 }, (_, i) => {
      const segment: 'AA' | 'AB' = Math.random() > 0.5 ? 'AA' : 'AB';
      const equipmentList = equipmentsBySegment[segment];
      const equipment = equipmentList[Math.floor(Math.random() * equipmentList.length)];
      const agencyNum = getUniqueAgencyNumber();
      
      return {
        id: `COPF-2024-${String(i + 6).padStart(3, '0')}`,
        agency: `AG${agencyNum} - ${['Centro', 'Paulista', 'Vila Madalena', 'Pinheiros', 'Moema', 'Itaim'][Math.floor(Math.random() * 6)]} (São Paulo)`,
        segment,
        equipment,
        serialNumber: `${segment}${String(i + 6).padStart(3, '0')}-SP-${agencyNum}`,
        description: ['Erro de hardware', 'Falha de conectividade', 'Problema de temperatura', 'Defeito no leitor'][Math.floor(Math.random() * 4)],
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as ('critical' | 'high' | 'medium' | 'low'),
        status: ['active', 'pending', 'resolved'][Math.floor(Math.random() * 3)] as ('active' | 'pending' | 'resolved'),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Roberto Lima'][Math.floor(Math.random() * 5)],
        vendor: ['Diebold Nixdorf', 'NCR Corporation', 'Dell Technologies', 'Gertec', 'Bematech'][Math.floor(Math.random() * 5)]
      }
    })

    return [...mockOccurrences, ...additionalOccurrences]
  }

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setOccurrences(generateMockData())
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Dados processados para gráficos
  const severityData: ChartData[] = [
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
  ]

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

  // Dados dos equipamentos baseados nos segmentos AA e AB mapeados
  const equipmentData: ChartData[] = [
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
  ]

  const metrics = {
    totalOccurrences: occurrences.length,
    resolvedOccurrences: occurrences.filter(o => o.status === 'resolved').length,
    activeOccurrences: occurrences.filter(o => o.status === 'active').length,
    pendingOccurrences: occurrences.filter(o => o.status === 'pending').length,
    avgMTTR: '4.2h',
    affectedAgencies: new Set(occurrences.map(o => o.agency)).size,
    resolutionRate: Math.round((occurrences.filter(o => o.status === 'resolved').length / occurrences.length) * 100)
  }

  return {
    occurrences,
    isLoading,
    severityData,
    timelineData,
    mttrData,
    equipmentData,
    metrics,
    refreshData: () => {
      setIsLoading(true)
      setTimeout(() => {
        setOccurrences(generateMockData())
        setIsLoading(false)
      }, 500)
    }
  }
}