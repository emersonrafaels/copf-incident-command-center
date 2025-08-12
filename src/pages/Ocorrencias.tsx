import { COPFLayout } from "@/components/copf/COPFLayout";
import { FilterSection } from "@/components/copf/FilterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download, Eye, MessageSquare, Bot, ChevronUp, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/contexts/FiltersContext";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
const Ocorrencias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    occurrences,
    isLoading
  } = useDashboardData();
  const { toast } = useToast();
  const { 
    segmentFilterMulti, 
    equipmentFilterMulti, 
    statusFilterMulti, 
    vendorFilterMulti, 
    severityFilterMulti,
    statusEquipamentoFilterMulti,
    transportadoraFilterMulti,
    tipoAgenciaFilter,
    agenciaFilter,
    ufFilter,
    municipioFilter,
    pontoVipFilter,
    suptFilter,
    overrideFilter,
    vendorPriorityFilter,
    reincidentFilter,
    statusSlaFilter,
    motivoFilter,
    previsaoSlaFilter,
    equipmentModelFilterMulti,
    impedimentoFilter,
    motivoImpedimentoFilter,
    filterPeriod,
    customDateRange,
    updateFilter
  } = useFilters();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Filtro de modelo: usa o filtro global do contexto (multiselect)
  const filtersCtxForModels = useFilters();
  const selectedEquipmentModels = filtersCtxForModels?.equipmentModelFilterMulti ?? [];
  // Mapeamento genérico de modelos por equipamento (somente para esta página)
  const equipmentModelsMap: Record<string, string[]> = {
    'ATM Saque': ['Modelo ATM Saque 1', 'Modelo ATM Saque 2'],
    'ATM Depósito': ['Modelo ATM Depósito 1', 'Modelo ATM Depósito 2'],
    'Cassete': ['Modelo Cassete 1', 'Modelo Cassete 2'],
    'Notebook': ['Modelo Notebook 1', 'Modelo Notebook 2'],
    'Desktop': ['Modelo Desktop 1', 'Modelo Desktop 2'],
    'Leitor de Cheques/documentos': ['Modelo Leitor Cheques 1', 'Modelo Leitor Cheques 2'],
    'Leitor biométrico': ['Modelo Leitor Biométrico 1', 'Modelo Leitor Biométrico 2'],
    'PIN PAD': ['Modelo PIN PAD 1', 'Modelo PIN PAD 2'],
    'Scanner de Cheque': ['Modelo Scanner Cheque 1', 'Modelo Scanner Cheque 2'],
    'Impressora': ['Modelo Impressora 1', 'Modelo Impressora 2'],
    'Impressora térmica': ['Modelo Impressora Térmica 1', 'Modelo Impressora Térmica 2'],
    'Impressora multifuncional': ['Modelo Impressora Multifuncional 1', 'Modelo Impressora Multifuncional 2'],
    'Monitor LCD/LED': ['Modelo Monitor 1', 'Modelo Monitor 2'],
    'Teclado': ['Modelo Teclado 1', 'Modelo Teclado 2'],
    'Servidor': ['Modelo Servidor 1', 'Modelo Servidor 2'],
    'Televisão': ['Modelo Televisão 1', 'Modelo Televisão 2'],
    'Senheiro': ['Modelo Senheiro 1', 'Modelo Senheiro 2'],
    'TCR': ['Modelo TCR 1', 'Modelo TCR 2'],
    'Classificadora': ['Modelo Classificadora 1', 'Modelo Classificadora 2'],
    'Fragmentadora de Papel': ['Modelo Fragmentadora 1', 'Modelo Fragmentadora 2'],
  };

  const allModelOptions = Array.from(
    new Set(Object.values(equipmentModelsMap).flat())
  );
  const availableEquipmentModels = equipmentFilterMulti.length > 0
    ? Array.from(new Set(equipmentFilterMulti.flatMap(eq => equipmentModelsMap[eq] || [])))
    : allModelOptions;

  const getModelForOccurrence = (occurrence: any) => {
    const models = equipmentModelsMap[occurrence.equipment] || ['Modelo Genérico 1', 'Modelo Genérico 2'];
    const key = (occurrence.serialNumber || occurrence.id || '').toString();
    const idx = key.length > 0 ? (key.charCodeAt(0) + key.length) % models.length : 0;
    return models[idx];
  };

  // Extrair parâmetros de aging da URL
  const agingMin = searchParams.get('aging_min');
  const agingMax = searchParams.get('aging_max');
  
  // Extrair parâmetros dos highlights
  const createdDate = searchParams.get('created_date');
  const slaDate = searchParams.get('sla_date');
  const slaStatus = searchParams.get('sla_status');
  
  // Filtros especiais vindos do dashboard via navigation state
  const filterType = location.state?.filterType;

  // Usar filtros do contexto
  const {
    serialNumberFilter,
    hasActiveFilters
  } = useFilters();

  // Aplicar filtros especiais ao carregar a página
  useEffect(() => {
    const agencyParam = searchParams.get('agency');
    const segmentParam = searchParams.get('segment');
    const equipmentParam = searchParams.get('equipment');
    const previsaoParam = searchParams.get('previsao');

    if (agencyParam) {
      updateFilter('agenciaFilter', [agencyParam]);
    }
    if (segmentParam) {
      updateFilter('segmentFilterMulti', [segmentParam]);
    }
    if (equipmentParam) {
      updateFilter('equipmentFilterMulti', [equipmentParam]);
    }
    if (previsaoParam && ['sem_previsao','previsao_alem_sla','com_previsao_dentro_sla'].includes(previsaoParam)) {
      updateFilter('previsaoSlaFilter', [previsaoParam]);
    }

    if (filterType === 'critical') {
      // Aplicar filtro de criticidade para ocorrências críticas
      updateFilter('severityFilterMulti', ['critical']);
    } else if (filterType === 'due-today') {
      // Aplicar filtro de SLA crítico para ocorrências que vencem hoje
      updateFilter('statusSlaFilter', ['critico']);
    }
    
    // Compatibilidade com query params do highlights
    if (slaStatus === 'due_today') {
      updateFilter('statusSlaFilter', ['critico']);
    }
  }, [filterType, slaStatus, updateFilter, searchParams]);

  // Filtrar ocorrências com o mesmo período da dashboard e reforço de casos >5 dias sem previsão
  const filteredOccurrences = (() => {
    // Determinar intervalo de datas baseado no filtro selecionado no contexto
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = now;

    switch (filterPeriod) {
      case '7-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '60-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 60);
        break;
      case '90-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'custom':
        if (customDateRange?.from) {
          startDate = new Date(customDateRange.from);
        }
        if (customDateRange?.to) {
          endDate = new Date(customDateRange.to);
          // incluir o dia final inteiro
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        // sem filtro de período
        startDate = null;
        endDate = null;
    }

    const base = occurrences.filter(occurrence => {
      // Filtro por período (Data/Hora Abertura)
      if (startDate && endDate) {
        const created = new Date(occurrence.createdAt);
        if (isNaN(created.getTime())) return false;
        if (created < startDate || created > endDate) return false;
      }

      const matchesSearch = occurrence.id.toLowerCase().includes(searchTerm.toLowerCase()) || occurrence.agency.toLowerCase().includes(searchTerm.toLowerCase()) || occurrence.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros multiselect
      const matchesSegment = segmentFilterMulti.length === 0 || segmentFilterMulti.includes(occurrence.segment);
      const matchesEquipment = equipmentFilterMulti.length === 0 || equipmentFilterMulti.includes(occurrence.equipment);
      const matchesStatus = statusFilterMulti.length === 0 || statusFilterMulti.includes(occurrence.status);
      const matchesVendor = vendorFilterMulti.length === 0 || vendorFilterMulti.includes(occurrence.vendor);
      const matchesSeverity = severityFilterMulti.length === 0 || severityFilterMulti.includes(occurrence.severity);

      // Filtro de série
      const matchesSerial = !serialNumberFilter || occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase());

      // Filtro de agência por número
      const matchesAgencia = !Array.isArray(agenciaFilter) || agenciaFilter.length === 0 || agenciaFilter.some(agency => occurrence.agency.includes(agency));

      // Filtro de UF (usar campo 'estado' vindo do banco)
      const matchesUF = ufFilter.length === 0 || ufFilter.includes(occurrence.estado);

      // Usar o campo tipoAgencia do objeto de dados (igual ao Dashboard)
      const matchesTipoAgencia = tipoAgenciaFilter.length === 0 || tipoAgenciaFilter.includes(occurrence.tipoAgencia);

      // Simular ponto VIP (agências com número terminado em 0, 5 são VIP)
      const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
      const isVip = agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
      const pontoVipStatus = isVip ? 'sim' : 'nao';
      const matchesPontoVip = pontoVipFilter.length === 0 || pontoVipFilter.includes(pontoVipStatus);

      // Filtro de SUPT baseado na DINEG da agência
      const agencyNum = parseInt(agencyNumber);
      let agencySupt = '';
      if (agencyNum >= 210 && agencyNum <= 299) agencySupt = agencyNum.toString().substring(0, 2);
      else if (agencyNum >= 510 && agencyNum <= 599) agencySupt = agencyNum.toString().substring(0, 2);
      const matchesSupt = suptFilter.length === 0 || (agencySupt && suptFilter.includes(agencySupt));

      // Filtro de ocorrências que vencem hoje (próximas 24h)
      if (overrideFilter) {
        if (occurrence.status === 'encerrado') return false;
        const createdDate = new Date(occurrence.createdAt);
        const hoursElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const hoursUntilDue = slaLimit - hoursElapsed;
        const dueToday = hoursUntilDue > 0 && hoursUntilDue <= 24; // Vence nas próximas 24 horas
        if (!dueToday) return false;
      }

      // Filtro de priorizadas com fornecedor
      if (vendorPriorityFilter) {
        const isHighPriority = occurrence.severity === 'critical' || occurrence.severity === 'high';
        if (!isHighPriority) return false;
      }

      // Filtro de reincidência
      if (reincidentFilter) {
        // Buscar ocorrências com mesmo motivo, equipamento e agência
        const sameReasonEquipment = occurrences.filter(other => 
          other.id !== occurrence.id &&
          other.description === occurrence.description &&
          other.equipment === occurrence.equipment &&
          other.agency === occurrence.agency
        );
        
        if (sameReasonEquipment.length === 0) {
          return false; // Não é reincidência se não há outras ocorrências similares
        }
        
        // Verificar se há reincidência recente (até 4 dias)
        const hasRecentRecurrence = sameReasonEquipment.some(other => {
          const daysDiff = Math.abs(new Date(occurrence.createdAt).getTime() - new Date(other.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 4;
        });
        
        if (!hasRecentRecurrence) {
          return false; // Só considera reincidência se for dentro de 4 dias
        }
      }

      // Filtro de Status SLA
      if (statusSlaFilter.length > 0) {
        const occCreatedDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - occCreatedDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);
        
        let currentSlaStatus = '';
        if (occurrence.status === 'encerrado' || occurrence.status === 'cancelado') {
          currentSlaStatus = 'no_prazo'; // Se encerrado, considera no prazo
        } else if (hoursDiff > slaLimit) {
          currentSlaStatus = 'vencido'; // Vencido
        } else if (slaEndDate.toDateString() === new Date().toDateString()) {
          currentSlaStatus = 'critico'; // Vence hoje (crítico)
        } else {
          currentSlaStatus = 'no_prazo'; // No prazo
        }
        
        if (!statusSlaFilter.includes(currentSlaStatus)) {
          return false;
        }
      }

      // Filtro de aging (quando vindo do gráfico Long Tail)
      if (agingMin !== null || agingMax !== null) {
        const createdDate = new Date(occurrence.createdAt);
        const agingHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        
        if (agingMin !== null) {
          const minHours = parseFloat(agingMin);
          if (agingHours < minHours) return false;
        }
        
        if (agingMax !== null) {
          const maxHours = parseFloat(agingMax);
          if (agingMax !== '999999' && agingHours >= maxHours) return false;
        }
      }

      // Filtros dos highlights vindos do dashboard
      if (filterType) {
        if (filterType === 'entered-today') {
          // Entraram hoje - filtra por data de criação
          const today = new Date();
          const occCreatedDate = new Date(occurrence.createdAt);
          const isToday = today.toDateString() === occCreatedDate.toDateString();
          if (!isToday) return false;
        } else if (filterType === 'due-today') {
          // Vencem hoje - SLA vence hoje (independente se já venceu ou não no mesmo dia)
          const occCreatedDate = new Date(occurrence.createdAt);
          const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
          const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);
          
          const isDueToday = slaEndDate.toDateString() === new Date().toDateString();
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          
          if (!(isDueToday && isNotCompleted)) return false;
        } else if (filterType === 'overdue-today') {
          // Em atraso - não encerradas e com SLA vencido
          const occCreatedDate = new Date(occurrence.createdAt);
          const hoursDiff = (Date.now() - occCreatedDate.getTime()) / (1000 * 60 * 60);
          const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
          
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          const isOverdue = hoursDiff > slaLimit;
          
          if (!(isNotCompleted && isOverdue)) return false;
        }
      }

      // Filtros dos highlights (mantendo compatibilidade com query params)
      // Filtro por data de criação (entraram hoje)
      if (createdDate) {
        const filterDate = new Date(createdDate);
        const occCreatedDate = new Date(occurrence.createdAt);
        const isSameDay = filterDate.toDateString() === occCreatedDate.toDateString();
        if (!isSameDay) return false;
      }

      // Filtro por SLA status (vencem hoje ou vencidas)
      if (slaStatus) {
        const occCreatedDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - occCreatedDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);

        if (slaStatus === 'due_today') {
          // Vencem hoje - SLA vence hoje (independente se já venceu ou não no mesmo dia)
          const isDueToday = slaEndDate.toDateString() === new Date().toDateString();
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          if (!(isDueToday && isNotCompleted)) return false;
        } else if (slaStatus === 'overdue') {
          // Vencidas - não encerradas e vencidas
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          const isOverdue = hoursDiff > slaLimit;
          if (!(isNotCompleted && isOverdue)) return false;
        }
      }

      // Filtro de status do equipamento
      const matchesStatusEquipamento = statusEquipamentoFilterMulti.length === 0 || statusEquipamentoFilterMulti.includes(occurrence.statusEquipamento);

      // Filtro de transportadora (similar ao Dashboard)
      const matchesTransportadora = transportadoraFilterMulti.length === 0 || (
        occurrence.transportadora && 
        occurrence.transportadora.trim() !== '' && 
        transportadoraFilterMulti.includes(occurrence.transportadora)
      );

      // Filtro de motivo de ocorrência e impedimento
      const matchesMotivo = motivoFilter.length === 0 || motivoFilter.includes(occurrence.motivoOcorrencia || 'Não informado');
      const matchesMotivoImpedimento = motivoImpedimentoFilter.length === 0 || motivoImpedimentoFilter.includes(occurrence.motivoImpedimento || 'Não informado');
      const matchesImpedimentoFlag = !impedimentoFilter || !!occurrence.possuiImpedimento;

      // Filtro especial: Modelo de equipamento (global)
      const occurrenceModel = getModelForOccurrence(occurrence);
      const matchesEquipmentModel = selectedEquipmentModels.length === 0 || selectedEquipmentModels.includes(occurrenceModel);

      // Filtro de previsão vs SLA
      const matchesPrevisaoSla = (() => {
        if (previsaoSlaFilter.length === 0) return true;
        
        // Filtrar apenas ocorrências não encerradas e não canceladas
        const isActive = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
        if (!isActive) return false;
        
        const now = new Date();
        const createdDate = new Date(occurrence.createdAt);
        const slaLimitHours = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaDeadline = new Date(createdDate.getTime() + (slaLimitHours * 60 * 60 * 1000));
        
        if (previsaoSlaFilter.includes('sem_previsao')) {
          return !occurrence.dataPrevisaoEncerramento;
        }
        
        if (previsaoSlaFilter.includes('com_previsao_dentro_sla')) {
          if (!occurrence.dataPrevisaoEncerramento) return false;
          const previsaoDate = new Date(occurrence.dataPrevisaoEncerramento);
          return previsaoDate <= slaDeadline;
        }
        
        if (previsaoSlaFilter.includes('previsao_alem_sla')) {
          if (!occurrence.dataPrevisaoEncerramento) return false;
          const previsaoDate = new Date(occurrence.dataPrevisaoEncerramento);
          return previsaoDate > slaDeadline;
        }
        
        return false;
      })();

    return matchesSearch && matchesStatus && matchesSegment && matchesEquipment && matchesSerial && matchesVendor && matchesSeverity && matchesAgencia && matchesUF && matchesTipoAgencia && matchesPontoVip && matchesSupt && matchesStatusEquipamento && matchesTransportadora && matchesMotivo && matchesMotivoImpedimento && matchesEquipmentModel && matchesPrevisaoSla && matchesImpedimentoFlag;
  });

  // Evitar geração quando houver filtros ativos ou filtros de aging/previsão via URL
  if (hasActiveFilters || agingMin !== null || agingMax !== null || previsaoSlaFilter.length > 0) {
    return base;
  }

  // Garantir algumas ocorrências com aging > 5 dias e sem previsão (somente sem filtros)
  const MIN_OLD_NOFORECAST = 12; // "algumas ocorrências"
  const oldNoForecastCount = base.filter(o => {
    const created = new Date(o.createdAt);
    const agingHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
    const isActive = o.status !== 'encerrado' && o.status !== 'cancelado';
    return isActive && agingHours > 120 && !o.dataPrevisaoEncerramento;
  }).length;

  if (oldNoForecastCount >= MIN_OLD_NOFORECAST) return base;

  const toAdd = MIN_OLD_NOFORECAST - oldNoForecastCount;
  const vendors = Array.from(new Set(occurrences.map(o => o.vendor))).filter(Boolean);
  const equipments = Array.from(new Set(occurrences.map(o => o.equipment))).filter(Boolean);
  const agencies = Array.from(new Set(occurrences.map(o => o.agency))).filter(Boolean);

  const generated = Array.from({ length: toAdd }).map((_, i) => {
    const hoursAgo = 132 + (i % 36); // entre ~5,5 e ~6,9 dias atrás
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    const displayId = `COPF-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    return {
      id: `SYNTH-${Date.now()}-${i}`,
      displayId,
      agency: agencies[i % (agencies.length || 1)] || '0001 - Centro',
      segment: 'AB' as const,
      equipment: equipments[i % (equipments.length || 1)] || 'Notebook',
      serialNumber: `SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      description: 'Atendimento pendente - Sem previsão do fornecedor',
      motivoOcorrencia: 'Falha técnica',
      severity: 'medium' as const,
      status: 'em_andamento' as const,
      createdAt,
      assignedTo: 'Fila de atendimento',
      vendor: vendors[i % (vendors.length || 1)] || 'NCR',
      transportadora: 'Prosegur',
      tipoAgencia: 'convencional',
      estado: 'SP',
      municipio: 'São Paulo',
      dineg: '21',
      vip: false,
      statusEquipamento: 'inoperante' as const,
      // campos opcionais não preenchidos
    } as any;
  });

  return base.concat(generated);
  })();
  const handleExportExcel = () => {
    // Preparar dados para exportação (ordem alinhada à tabela)
    const exportData = filteredOccurrences.map(occurrence => ({
      'ID': occurrence.id,
      'Agência': occurrence.agency,
      'Segmento': occurrence.segment,
      'Equipamento': occurrence.equipment,
      'Status Equipamento': occurrence.statusEquipamento === 'operante' ? 'Operante' : 'Inoperante',
      'Fornecedor': occurrence.vendor,
      'Status': getStatusLabel(occurrence.status),
      'SLA': getSlaStatus(occurrence),
      'Criticidade': getSeverityLabel(occurrence.severity),
      'Data/Hora Abertura': new Date(occurrence.createdAt).toLocaleString('pt-BR'),
      'Previsão de Atendimento': occurrence.dataPrevisaoEncerramento ? new Date(occurrence.dataPrevisaoEncerramento).toLocaleString('pt-BR') : '',
      'Data Encerramento': occurrence.dataEncerramento ? new Date(occurrence.dataEncerramento).toLocaleString('pt-BR') : '',
      'Impedimento': occurrence.possuiImpedimento ? 'Sim' : 'Não',
      'Motivo Impedimento': occurrence.motivoImpedimento || '',
      'Modelo': getModelForOccurrence(occurrence),
      'N° Série': occurrence.serialNumber || ''
    }));

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ocorrências");

    // Ajustar largura das colunas
    const wscols = [
      { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 20 },
      { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 22 },
      { wch: 24 }, { wch: 22 }, { wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 14 }
    ];
    ws['!cols'] = wscols;

    // Baixar arquivo
    const fileName = `ocorrencias_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast({
      title: "Exportação Concluída",
      description: `Arquivo ${fileName} foi baixado com sucesso.`
    });
  };

  const handleBotInteraction = (message: string) => {
    // Simular resposta do bot
    const responses = [
      "Analisando as ocorrências... Encontrei 3 ocorrências críticas que precisam de atenção imediata.",
      "Com base no histórico, o fornecedor TechSol tem respondido 40% mais rápido que a média.",
      "Recomendo priorizar as ocorrências da Agência Centro, que têm maior impacto nos clientes.",
      "Identifiquei um padrão: 60% das falhas ocorrem entre 14h-16h. Sugestão: manutenção preventiva neste horário."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setTimeout(() => {
      toast({
        title: "Assistente Virtual",
        description: randomResponse
      });
    }, 1000);
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getSymptomCode = (s: string) => {
    const base = (s || 'NAO INFORMADO')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    let hash = 0 >>> 0;
    for (let i = 0; i < base.length; i++) {
      hash = ((hash * 31) + base.charCodeAt(i)) >>> 0;
    }
    const hex = (hash >>> 0).toString(16).toUpperCase().padStart(4, '0');
    return hex.slice(0, 4);
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Crítica';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aberta';
      case 'pending':
        return 'Em Andamento';
      case 'resolved':
        return 'Resolvida';
      default:
        return status;
    }
  };

  const getSlaStatus = (occurrence: any) => {
    const createdDate = new Date(occurrence.createdAt);
    const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    
    if (occurrence.status === 'resolved' || occurrence.status === 'encerrado') {
      return 'Dentro do SLA';
    }
    
    if (hoursDiff > slaLimit) {
      return 'Vencido';
    } else if (hoursDiff > slaLimit * 0.8) {
      return 'Crítico';
    } else {
      return 'No Prazo';
    }
  };

  const getSlaStatusVariant = (slaStatus: string) => {
    switch (slaStatus) {
      case 'Vencido':
        return 'destructive';
      case 'Crítico':
        return 'secondary';
      case 'No Prazo':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getRemainingTime = (occurrence: any) => {
    const createdDate = new Date(occurrence.createdAt);
    const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    
    if (occurrence.status === 'resolved' || occurrence.status === 'encerrado') {
      return 'Concluída';
    }
    
    const remainingHours = slaLimit - hoursDiff;
    
    if (remainingHours <= 0) {
      const overdueHours = Math.abs(remainingHours);
      if (overdueHours < 1) {
        return `${Math.floor(overdueHours * 60)}min vencido`;
      }
      return `${Math.floor(overdueHours)}h vencido`;
    }
    
    if (remainingHours < 1) {
      return `${Math.floor(remainingHours * 60)}min`;
    }
    
    return `${Math.floor(remainingHours)}h`;
  };

  // Função para converter valores em números para ordenação
  const getSortValue = (occurrence: any, column: string) => {
    switch (column) {
      case 'id':
        return occurrence.id.toLowerCase();
      case 'agency':
        return occurrence.agency.toLowerCase();
      case 'segment':
        return occurrence.segment.toLowerCase();
      case 'equipment':
        return occurrence.equipment.toLowerCase();
      case 'serialNumber':
        return occurrence.serialNumber.toLowerCase();
      case 'severity':
        const severityMap = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return severityMap[occurrence.severity] || 0;
      case 'status':
        return occurrence.status.toLowerCase();
      case 'slaStatus':
        const slaStatusMap = { 'Vencido': 3, 'Crítico': 2, 'No Prazo': 1, 'Dentro do SLA': 0 };
        return slaStatusMap[getSlaStatus(occurrence)] || 0;
      case 'remainingTime':
        const createdDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        return slaLimit - hoursDiff; // Menor tempo restante = maior urgência
      case 'createdAt':
        return new Date(occurrence.createdAt).getTime();
      case 'dataPrevisaoEncerramento':
        return occurrence.dataPrevisaoEncerramento ? new Date(occurrence.dataPrevisaoEncerramento).getTime() : 0;
      case 'dataEncerramento':
        return occurrence.dataEncerramento ? new Date(occurrence.dataEncerramento).getTime() : 0;
      case 'vendor':
        return occurrence.vendor.toLowerCase();
      case 'statusEquipamento':
        return occurrence.statusEquipamento === 'operante' ? 0 : 1; // Operante first, then inoperante
      default:
        return '';
    }
  };

  // Função para ordenar ocorrências
  const sortOccurrences = (occurrences: any[]) => {
    return [...occurrences].sort((a, b) => {
      const aValue = getSortValue(a, sortColumn);
      const bValue = getSortValue(b, sortColumn);
      
      // Ordenação primária
      let result = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue;
      } else {
        result = String(aValue).localeCompare(String(bValue));
      }
      
      // Aplicar direção da ordenação
      if (sortDirection === 'desc') {
        result *= -1;
      }
      
      // Se for ordenação por tempo restante, aplicar ordenação secundária por severidade
      if (sortColumn === 'remainingTime' && result === 0) {
        const aSeverity = getSortValue(a, 'severity');
        const bSeverity = getSortValue(b, 'severity');
        return bSeverity - aSeverity; // Severidade maior primeiro
      }
      
      return result;
    });
  };

  // Função para lidar com clique no cabeçalho
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Aplicar ordenação padrão: tempo restante (menor primeiro) + severidade crítica
  const sortedOccurrences = sortOccurrences(filteredOccurrences);

  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ocorrências</h1>
            <p className="text-muted-foreground">Lista detalhada de todas as ocorrências registradas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAIAssistant(!showAIAssistant)}>
              <Bot className="mr-2 h-4 w-4" />
              Assistente IA
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <FilterSection showSerialNumber={true} />

        <Card className="shadow-lg border-0 bg-gradient-to-r from-background to-accent/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Busca Específica
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Busca Principal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por ID, agência ou descrição..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10 h-11 border-2 focus:border-primary/50 transition-colors" 
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Bot Assistente */}
        {showAIAssistant && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Assistente Virtual - Análise Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" onClick={() => handleBotInteraction("Analisar ocorrências críticas")} className="text-left p-4 h-auto">
                    <div>
                      <p className="font-medium">Analisar Criticidade</p>
                      <p className="text-sm text-muted-foreground">Identifica ocorrências que precisam de atenção imediata</p>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => handleBotInteraction("Analisar performance fornecedores")} className="text-left p-4 h-auto">
                    <div>
                      <p className="font-medium">Performance Fornecedores</p>
                      <p className="text-sm text-muted-foreground">Avalia tempo de resposta e eficiência</p>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => handleBotInteraction("Sugerir otimizações")} className="text-left p-4 h-auto">
                    <div>
                      <p className="font-medium">Sugestões de Melhoria</p>
                      <p className="text-sm text-muted-foreground">Recomendações baseadas em padrões identificados</p>
                    </div>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Digite sua pergunta sobre as ocorrências..." 
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleBotInteraction(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }} 
                  />
                  <Button size="sm" variant="outline">
                    Perguntar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Ocorrências</CardTitle>
              <Badge variant="outline">
                {filteredOccurrences.length} ocorrência(s) encontrada(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando ocorrências...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                     <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-20"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            ID
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'id' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'id' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-32"
                          onClick={() => handleSort('agency')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Agência
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'agency' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'agency' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-14"
                          onClick={() => handleSort('segment')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Segmento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'segment' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'segment' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-28"
                          onClick={() => handleSort('equipment')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Equipamento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'equipment' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'equipment' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-20"
                          onClick={() => handleSort('statusEquipamento')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Status Equipamento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'statusEquipamento' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'statusEquipamento' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-24"
                          onClick={() => handleSort('vendor')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Fornecedor
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'vendor' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'vendor' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-16"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Status
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'status' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'status' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-16"
                          onClick={() => handleSort('slaStatus')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            SLA
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'slaStatus' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'slaStatus' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-16"
                          onClick={() => handleSort('severity')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Criticidade
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'severity' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'severity' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-24"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Data/Hora Abertura
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'createdAt' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'createdAt' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-24"
                          onClick={() => handleSort('dataPrevisaoEncerramento')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Previsão de Atendimento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'dataPrevisaoEncerramento' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'dataPrevisaoEncerramento' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-24"
                          onClick={() => handleSort('dataEncerramento')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            Data Encerramento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'dataEncerramento' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'dataEncerramento' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="w-16">Impedimento</TableHead>
                        <TableHead className="w-40">Motivo Impedimento</TableHead>
                        <TableHead className="w-24">Modelo</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none w-20"
                          onClick={() => handleSort('serialNumber')}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium">
                            N° Série
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'serialNumber' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'serialNumber' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="w-12">Ações</TableHead>
                      </TableRow>
                   </TableHeader>
                 <TableBody>
                   {sortedOccurrences.map(occurrence => (
                     <TableRow key={occurrence.id} className="text-xs">
                       <TableCell className="font-medium py-2">{occurrence.displayId}</TableCell>
                       <TableCell className="py-2 truncate max-w-[120px]">{occurrence.agency}</TableCell>
                       <TableCell className="py-2">
                         <Badge variant="outline" className="text-xs px-1 py-0">{occurrence.segment}</Badge>
                       </TableCell>
                       <TableCell className="py-2 truncate max-w-[100px]">{occurrence.equipment}</TableCell>
                       <TableCell className="py-2">
                         <Badge variant={occurrence.statusEquipamento === 'operante' ? 'default' : 'destructive'} className="text-xs px-1 py-0">
                           {occurrence.statusEquipamento === 'operante' ? 'Op' : 'In'}
                         </Badge>
                       </TableCell>
                       <TableCell className="py-2 text-xs">{occurrence.vendor}</TableCell>
                       <TableCell className="py-2">
                         <StatusBadge status={occurrence.status} />
                       </TableCell>
                       <TableCell className="py-2">
                         <Badge variant={getSlaStatusVariant(getSlaStatus(occurrence))} className="text-xs px-1 py-0">
                           {getSlaStatus(occurrence)}
                         </Badge>
                       </TableCell>
                       <TableCell className="py-2">
                         <Badge variant={getSeverityVariant(occurrence.severity)} className="text-xs px-1 py-0">
                           {getSeverityLabel(occurrence.severity)}
                         </Badge>
                       </TableCell>
                       <TableCell className="py-2 text-xs">
                         {new Date(occurrence.createdAt).toLocaleDateString('pt-BR', { 
                           day: '2-digit', 
                           month: '2-digit',
                           year: '2-digit'
                         })} {new Date(occurrence.createdAt).toLocaleTimeString('pt-BR', {
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </TableCell>
                       <TableCell className="py-2 text-xs">
                         {occurrence.dataPrevisaoEncerramento ? (
                           <div>
                             {new Date(occurrence.dataPrevisaoEncerramento).toLocaleDateString('pt-BR', { 
                               day: '2-digit', 
                               month: '2-digit',
                               year: '2-digit'
                             })} {new Date(occurrence.dataPrevisaoEncerramento).toLocaleTimeString('pt-BR', {
                               hour: '2-digit',
                               minute: '2-digit'
                             })}
                           </div>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </TableCell>
                       <TableCell className="py-2 text-xs">
                         {occurrence.dataEncerramento ? (
                           <div>
                             {new Date(occurrence.dataEncerramento).toLocaleDateString('pt-BR', { 
                               day: '2-digit', 
                               month: '2-digit',
                               year: '2-digit'
                             })} {new Date(occurrence.dataEncerramento).toLocaleTimeString('pt-BR', {
                               hour: '2-digit',
                               minute: '2-digit'
                             })}
                           </div>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </TableCell>
                       <TableCell className="py-2">
                         {occurrence.possuiImpedimento ? (
                           <Badge variant="destructive" className="text-xs px-1 py-0">Sim</Badge>
                         ) : (
                           <span className="text-muted-foreground">Não</span>
                         )}
                       </TableCell>
                       <TableCell className="py-2 text-xs truncate max-w-[200px]">
                         {occurrence.motivoImpedimento ? (
                           <span title={occurrence.motivoImpedimento}>
                             {`${getSymptomCode(occurrence.motivoImpedimento)} - ${occurrence.motivoImpedimento.length > 40 ? occurrence.motivoImpedimento.substring(0, 40) + '...' : occurrence.motivoImpedimento}`}
                           </span>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </TableCell>
                       <TableCell className="py-2 text-xs truncate max-w-[120px]">{getModelForOccurrence(occurrence)}</TableCell>
                       <TableCell className="py-2 text-xs truncate max-w-[80px]">{occurrence.serialNumber}</TableCell>
                       <TableCell className="py-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => navigate(`/ocorrencia/${occurrence.id}`)} 
                           title="Visualizar detalhes da ocorrência"
                           className="h-6 w-6 p-0"
                         >
                           <Eye className="h-3 w-3" />
                         </Button>
                       </TableCell>
                     </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  </COPFLayout>
);
};

export default Ocorrencias;