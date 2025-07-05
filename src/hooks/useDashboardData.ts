import { useState, useEffect } from 'react'

export interface OccurrenceData {
  id: string
  agency: string
  equipment: string
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
    const mockOccurrences: OccurrenceData[] = [
      {
        id: "COPF-2024-001",
        agency: "AG0001 - Centro (São Paulo)",
        equipment: "ATM Diebold 9800 - Slot 01",
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
        equipment: "Split Carrier 18k BTU - Térreo",
        description: "Temperatura ambiente elevada - possível falha no compressor",
        severity: "high",
        status: "pending",
        createdAt: "2024-01-15T09:15:00",
        assignedTo: "Maria Santos - Facilities",
        vendor: "Carrier do Brasil"
      },
      {
        id: "COPF-2024-003",
        agency: "AG0032 - Vila Madalena (São Paulo)",
        equipment: "Link MPLS Principal - Roteador Cisco",
        description: "Perda total de conectividade - link primário inoperante",
        severity: "high",
        status: "active",
        createdAt: "2024-01-14T14:20:00",
        assignedTo: "Carlos Oliveira - Redes",
        vendor: "Vivo Empresas"
      },
      {
        id: "COPF-2024-004",
        agency: "AG0045 - Pinheiros (São Paulo)",
        equipment: "Terminal POS Gertec PPC920",
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
        equipment: "Impressora Térmica Bematech",
        description: "Impressora com papel atolado constantemente",
        severity: "low",
        status: "pending",
        createdAt: "2024-01-13T16:45:00",
        assignedTo: "Roberto Lima - Suporte",
        vendor: "Bematech"
      }
    ]

    // Simular chegada de novas ocorrências
    const additionalOccurrences = Array.from({ length: 15 }, (_, i) => ({
      id: `COPF-2024-${String(i + 6).padStart(3, '0')}`,
      agency: `AG${String(Math.floor(Math.random() * 100)).padStart(4, '0')} - ${['Centro', 'Paulista', 'Vila Madalena', 'Pinheiros', 'Moema', 'Itaim'][Math.floor(Math.random() * 6)]} (São Paulo)`,
      equipment: ['ATM Diebold', 'Split Carrier', 'Link MPLS', 'Terminal POS', 'Impressora Térmica'][Math.floor(Math.random() * 5)],
      description: ['Erro de hardware', 'Falha de conectividade', 'Problema de temperatura', 'Defeito no leitor'][Math.floor(Math.random() * 4)],
      severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
      status: ['active', 'pending', 'resolved'][Math.floor(Math.random() * 3)] as any,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Roberto Lima'][Math.floor(Math.random() * 5)],
      vendor: ['Diebold Nixdorf', 'Carrier', 'Vivo', 'Gertec', 'Bematech'][Math.floor(Math.random() * 5)]
    }))

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

  const equipmentData: ChartData[] = [
    { name: 'ATM', value: 35, fill: 'hsl(var(--primary))' },
    { name: 'POS', value: 28, fill: 'hsl(var(--warning))' },
    { name: 'Rede', value: 22, fill: 'hsl(var(--success))' },
    { name: 'Climatização', value: 15, fill: 'hsl(var(--destructive))' }
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