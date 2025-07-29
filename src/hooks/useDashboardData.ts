import { useState, useEffect, useMemo, useCallback } from 'react'
import { formatHours } from '@/lib/timeUtils'
import { useFilters } from '@/contexts/FiltersContext'
import { supabase } from '@/integrations/supabase/client'

export interface OccurrenceData {
  id: string // Real UUID from database for navigation
  displayId: string // COPF-formatted ID for display
  agency: string
  segment: 'AA' | 'AB'
  equipment: string
  serialNumber: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'a_iniciar' | 'em_andamento' | 'encerrado' | 'com_impedimentos' | 'cancelado'
  createdAt: string
  resolvedAt?: string
  dataPrevisaoEncerramento?: string // Data/hora prevista pelo fornecedor para encerramento
  dataEncerramento?: string // Data/hora real do encerramento
  assignedTo: string
  vendor: string
  transportadora?: string // Hierarquia: transportadora > fornecedor para terceirizados
  tipoAgencia: string
  estado: string
  municipio: string
  dineg: string
  vip: boolean
  statusEquipamento: 'operante' | 'inoperante'
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

// Função para simular transportadora baseada na agência
const getTransportadoraByAgency = (agencia: string): string => {
  const agencyNumber = parseInt(agencia.match(/\d+/)?.[0] || '0');
  // Simular diferentes transportadoras baseadas no número da agência
  if (agencyNumber <= 500) return 'Brinks';
  if (agencyNumber <= 1000) return 'Prosegur';
  if (agencyNumber <= 1500) return 'Express Logística';
  if (agencyNumber <= 2000) return 'TechTransporte';
  return 'LogiCorp';
};

// Mapeamento dos campos do banco para a interface do frontend
const mapDatabaseToOccurrence = (dbRecord: any): OccurrenceData => {
  // Mapear status do banco para formato esperado
  const statusMap: Record<string, OccurrenceData['status']> = {
    'pendente': 'a_iniciar',
    'em_andamento': 'em_andamento', 
    'resolvida': 'encerrado',
    'com_impedimentos': 'com_impedimentos'
  }

  // Mapear prioridade para severidade
  const severityMap: Record<string, OccurrenceData['severity']> = {
    'baixa': 'low',
    'media': 'medium',
    'alta': 'high', 
    'critica': 'critical'
  }

  // Mapear segmento do banco para AA/AB - Correção baseada nos dados reais
  const segmentMap: Record<string, OccurrenceData['segment']> = {
    'atm': 'AA',        // ATMs: Saque, Depósito, Cassete
    'pos': 'AA',        // POS também são ATMs  
    'rede': 'AB',       // Equipamentos de rede nas agências
    'datacenter': 'AB'  // Equipamentos de datacenter/infraestrutura
  }
  
  // Gerar ID amigável com prefixo COPF para exibição
  const shortId = `COPF-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
  
  // Formatar agência - extrair números de strings como "AGENCIA_P001", "AGENCIA_T003", etc.
  const agencyString = String(dbRecord.agencia || '');
  const agencyNumberMatch = agencyString.match(/[PT]?(\d+)/);
  const agencyNumber = agencyNumberMatch ? agencyNumberMatch[1].padStart(4, '0') : '0001';
  const agencyNames = ['Centro', 'Norte', 'Sul', 'Leste', 'Oeste', 'Vila Nova', 'São Bento', 'Jardim', 'Parque'];
  const agencyName = agencyNames[parseInt(agencyNumber) % agencyNames.length];
  
  return {
    id: dbRecord.id, // Use real UUID from database for navigation
    displayId: shortId, // COPF ID for display only
    agency: `${agencyNumber} - ${agencyName}`,
    segment: segmentMap[dbRecord.segmento] || 'AB',
    equipment: dbRecord.equipamento,
    serialNumber: dbRecord.numero_serie,
    description: dbRecord.descricao,
    severity: severityMap[dbRecord.severidade] || 'medium',
    status: statusMap[dbRecord.status] || 'a_iniciar',
    createdAt: dbRecord.data_ocorrencia,
    resolvedAt: dbRecord.data_resolucao,
    dataPrevisaoEncerramento: dbRecord.data_previsao_encerramento,
    dataEncerramento: dbRecord.data_encerramento,
    assignedTo: dbRecord.usuario_responsavel || 'Não atribuído',
    vendor: dbRecord.fornecedor,
    transportadora: getTransportadoraByAgency(dbRecord.agencia), // Simular transportadora baseada na agência
    tipoAgencia: dbRecord.tipo_agencia,
    estado: dbRecord.uf,
    municipio: 'Centro', // Campo não existe ainda no banco
    dineg: dbRecord.supt,
    vip: dbRecord.vip,
    statusEquipamento: dbRecord.status_equipamento || 'operante'
  }
}

export function useDashboardData() {
  const [occurrences, setOccurrences] = useState<OccurrenceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { filterPeriod } = useFilters()

  // Buscar dados do Supabase
  const fetchOccurrences = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .order('data_ocorrencia', { ascending: false })

      if (error) {
        console.error('Erro ao buscar ocorrências:', error)
        return
      }

      const mappedOccurrences = data?.map(mapDatabaseToOccurrence) || []
      setOccurrences(mappedOccurrences)
    } catch (error) {
      console.error('Erro na requisição:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Inicializar dados
  useEffect(() => {
    fetchOccurrences()
  }, [fetchOccurrences])

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
    const pendingCount = occurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_andamento' || o.status === 'com_impedimentos').length
    
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
    refreshData: fetchOccurrences
  }
}